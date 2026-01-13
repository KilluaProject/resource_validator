from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress
import socket
import requests
import dns.resolver
import dns.reversename
import time
import concurrent.futures
import re

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === SECURITY VALIDATOR (UPDATED: SUPPORT RANGE) ===
def is_safe_input(text, type="IP"):
    if len(text) > 50: return False 
    text = text.strip()
    
    if type == "ASN":
        return bool(re.match(r'^AS\d+$', text, re.IGNORECASE))
    else:
        # IPv4 Pattern
        ipv4_pattern = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[1-2]?[0-9]))?$'
        # IPv6 Pattern
        ipv6_pattern = r'^([0-9a-fA-F]{1,4}:){1,7}:?([0-9a-fA-F]{1,4})?(\/[0-9]{1,3})?$'
        # Range Pattern (IP - IP)
        range_pattern = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*-\s*(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

        return bool(re.match(ipv4_pattern, text)) or bool(re.match(ipv6_pattern, text)) or bool(re.match(range_pattern, text))

# === UTILS ===
WHOIS_APNIC = "whois.apnic.net"
WHOIS_RADB = "whois.radb.net"

def query_socket(query_str, server=WHOIS_APNIC):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5) 
        s.connect((server, 43))
        cmd = f"{query_str}\r\n"
        s.send(cmd.encode())
        response = b""
        while True:
            data = s.recv(4096)
            if not data: break
            response += data
        s.close()
        return response.decode('utf-8', errors='ignore')
    except: return ""

def calculate_size(range_str):
    try:
        if '-' in range_str: 
            start, end = [x.strip() for x in range_str.split('-')]
            return int(ipaddress.ip_address(end)) - int(ipaddress.ip_address(start))
        else:
            net = ipaddress.ip_network(range_str, strict=False)
            return int(net.num_addresses)
    except: return 0

# === TASKS ===

# 1. APNIC HIERARCHY
def task_apnic_hierarchy(cidr):
    def parse_apnic(raw_text):
        hierarchy_objs = []
        current_obj = {}
        for line in raw_text.split('\n'):
            line = line.strip()
            if not line or line.startswith('%'):
                if current_obj:
                    if 'inetnum' in current_obj or 'inet6num' in current_obj:
                        current_obj['_range'] = current_obj.get('inetnum', current_obj.get('inet6num'))
                        hierarchy_objs.append(current_obj)
                    current_obj = {}
                continue
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip().lower()
                val = val.strip()
                if key in current_obj: current_obj[key] += f" | {val}"
                else: current_obj[key] = val
        if current_obj and ('inetnum' in current_obj or 'inet6num' in current_obj):
             current_obj['_range'] = current_obj.get('inetnum', current_obj.get('inet6num'))
             hierarchy_objs.append(current_obj)
        return hierarchy_objs

    cmd_self = f"-rB {cidr}" 
    raw_self = query_socket(cmd_self, server=WHOIS_APNIC)
    cmd_parent = f"-l -rB {cidr}" 
    raw_parent = query_socket(cmd_parent, server=WHOIS_APNIC)
    cmd_children = f"-m -rB {cidr}" 
    raw_children = query_socket(cmd_children, server=WHOIS_APNIC)
    
    full_raw = raw_self + "\n" + raw_parent + "\n" + raw_children
    hierarchy_list = parse_apnic(full_raw)
    
    unique_hierarchy = []
    seen = set()
    IGNORE_NAMES = ['APNIC-AP', 'IANA', 'ERX-NETBLOCK', 'ARIN-CIDR-BLOCK', 'ADMINISTERED-BY-RIPE']

    try:
        input_net = ipaddress.ip_network(cidr, strict=False)
        input_range_v4 = f"{input_net.network_address} - {input_net.broadcast_address}"
    except: input_range_v4 = "UNKNOWN"

    temp_list = []
    for obj in hierarchy_list:
        rng = obj.get('_range', '')
        name = obj.get('netname', '').upper()
        source = obj.get('source', '').upper()

        if 'IDNIC' in source:
            name_ori = obj.get('netname', '')
            obj['netname'] = f"{name_ori} [@source IDNIC]"

        if rng in seen: continue
        if any(bad in name for bad in IGNORE_NAMES): continue
        size = calculate_size(rng)
        if size >= 16000000: continue 
        seen.add(rng)
        obj['_size'] = size
        temp_list.append(obj)

    is_self_portable = False
    self_size = calculate_size(input_range_v4) if '-' in input_range_v4 else 0
    for obj in temp_list:
        if obj.get('_range') == input_range_v4:
            if 'PORTABLE' in obj.get('status', '').upper(): is_self_portable = True; break
    
    for obj in temp_list:
        if is_self_portable and obj['_size'] > self_size: continue
        unique_hierarchy.append(obj)
    
    unique_hierarchy.sort(key=lambda x: x['_size'], reverse=True)
    parent_obj = unique_hierarchy[0] if unique_hierarchy else None
    
    if not parent_obj:
        temp = parse_apnic(raw_self)
        parent_obj = temp[0] if temp else None

    p_net = parent_obj.get('_range', '-') if parent_obj else '-'
    p_name = parent_obj.get('netname', 'Not Found') if parent_obj else 'Not Found'
    p_desc = parent_obj.get('descr', '-') if parent_obj else '-'
    p_desc = p_desc.replace(" | ", ", ")
    
    children_txt = []
    if len(unique_hierarchy) > 1:
        for obj in unique_hierarchy[1:]:
            c_desc = obj.get('descr', '').replace(" | ", ", ")
            child_str = f"{obj.get('netname', '?')} ({obj.get('_range')})"
            if c_desc and c_desc != "-": child_str += f" : {c_desc}"
            children_txt.append(child_str)
    
    return {"parent_net": p_net, "parent_name": p_name, "parent_desc": p_desc, "children": " | ".join(children_txt) if children_txt else "-"}

# 2. ROUTING INTELLIGENCE
def task_routing_intelligence(cidr):
    irr_list = []
    rpki_status, rpki_detail, visibility = "UNKNOWN", "-", "Not Seen"
    detected_upstreams = set()
    try:
        with requests.Session() as s:
            url_bgp = f"https://stat.ripe.net/data/bgp-state/data.json?resource={cidr}"
            r_bgp = s.get(url_bgp, timeout=6).json()
            bgp_data = r_bgp.get('data', {}).get('bgp_state', [])
            peers_seeing = 0
            for route in bgp_data:
                path = route.get('path', [])
                if len(path) >= 2: detected_upstreams.add(f"AS{path[-2]}")
                peers_seeing += 1
            r_stat = s.get(f"https://stat.ripe.net/data/routing-status/data.json?resource={cidr}", timeout=5).json()
            data_stat = r_stat.get('data', {})
            if peers_seeing == 0:
                v4_p = data_stat.get('visibility', {}).get('v4', {}).get('ris_peers_seeing', 0)
                v6_p = data_stat.get('visibility', {}).get('v6', {}).get('ris_peers_seeing', 0)
                peers_seeing = v4_p if v4_p > 0 else v6_p
            for item in data_stat.get('route_objects', []): irr_list.append(f"{item.get('origin')}@{item.get('source')}")
            r_net = s.get(f"https://stat.ripe.net/data/network-info/data.json?resource={cidr}", timeout=5).json()
            origin_as = "?"
            asns = r_net.get('data', {}).get('asns', [])
            if asns: origin_as = f"AS{asns[0]}"
            if peers_seeing > 0:
                if peers_seeing < 10: visibility = f"⚠️ Low Vis. ({peers_seeing} Peers) via {origin_as}"
                else: visibility = f"✅ Global ({peers_seeing} Peers) via {origin_as}"
            else: visibility = "❌ Not Announced"
            r_rpki = s.get(f"https://stat.ripe.net/data/rpki-roas/data.json?resource={cidr}", timeout=5).json()
            roas = r_rpki.get('data', {}).get('roas', [])
            if roas:
                asn = roas[0].get('asn')
                maxlen = roas[0].get('max_length')
                maxlen_str = f"/{maxlen}" if maxlen else ""
                if str(asn) == "0": rpki_status, rpki_detail = "INVALID (AS0)", "Terminated"
                else: rpki_status, rpki_detail = "VALID", f"AS{asn} {maxlen_str}"
            else: rpki_status = "NOT FOUND"
    except: pass
    try:
        raw_radb = query_socket(f"{cidr}", server=WHOIS_RADB)
        curr_origin, curr_source = None, None
        for line in raw_radb.split('\n'):
            line = line.strip()
            if line.startswith('origin:'): curr_origin = line.split(':')[1].strip().upper()
            if line.startswith('source:'): curr_source = line.split(':')[1].strip().upper()
            if curr_origin and curr_source:
                obj = f"{curr_origin}@{curr_source}"
                if obj not in irr_list: irr_list.append(obj); curr_origin, curr_source = None, None
    except: pass
    return {"visibility": visibility, "rpki_status": rpki_status, "rpki_detail": rpki_detail, "irr_objects": " | ".join(list(set(irr_list))) if irr_list else "-", "upstreams": ", ".join(list(detected_upstreams)) if detected_upstreams else "-"}

# 3. REVERSE DNS
def task_reverse_dns(cidr):
    def get_zone_name(cidr_obj):
        try:
            if cidr_obj.version == 4:
                parts = str(cidr_obj.network_address).split('.')
                if cidr_obj.prefixlen >= 24: return f"{parts[2]}.{parts[1]}.{parts[0]}.in-addr.arpa"
                elif cidr_obj.prefixlen >= 16: return f"{parts[1]}.{parts[0]}.in-addr.arpa"
                return f"{parts[0]}.in-addr.arpa"
            else:
                rev = cidr_obj.network_address.reverse_pointer
                nibbles = int(cidr_obj.prefixlen / 4)
                return ".".join(rev.split('.')[-(nibbles+2):])
        except: return None
    final_ptr_display = ""
    try:
        net = ipaddress.ip_network(cidr, strict=False)
        if net.version == 4 and net.prefixlen < 24:
            results = ["Detected Aggregate Block (Checking /24 Delegation):"]
            for subnet in net.subnets(new_prefix=24):
                z = get_zone_name(subnet)
                if z:
                    raw = query_socket(f"-rB {z}", server=WHOIS_APNIC)
                    ns_found = []
                    for line in raw.split('\n'):
                        if 'nserver:' in line.lower():
                            ns = line.split(':')[1].strip().lower()
                            if ns not in ns_found: ns_found.append(ns)
                    if ns_found: results.append(f" ↳ {subnet}: {', '.join(ns_found[:2])} (APNIC)")
                    else: results.append(f" ↳ {subnet}: No Delegation")
            final_ptr_display = "\n".join(results)
        else:
            dns_ptr = "No DNS PTR"
            try:
                rev = dns.reversename.from_address(str(net.network_address))
                resolver = dns.resolver.Resolver()
                resolver.nameservers = ['8.8.8.8']
                dns_ptr = str(resolver.resolve(rev, "PTR")[0])
            except: pass
            whois_ns = ""
            z = get_zone_name(net)
            if z:
                raw = query_socket(f"-rB {z}", server=WHOIS_APNIC)
                ns_found = []
                for line in raw.split('\n'):
                    if 'nserver:' in line.lower():
                        ns = line.split(':')[1].strip().lower()
                        if ns not in ns_found: ns_found.append(ns)
                if ns_found: whois_ns = f"Delegated to: {', '.join(ns_found[:2])}"
            if "No DNS" not in dns_ptr: final_ptr_display = f"{dns_ptr} (Live DNS)"
            elif whois_ns: final_ptr_display = f"{whois_ns} (APNIC Whois)"
            else: final_ptr_display = "No Reverse DNS & No Delegation"
    except Exception as e: final_ptr_display = f"Error: {str(e)}"
    return {"ptr_record": final_ptr_display}

# === CONTROLLER ===
def scan_ip_logic_parallel(cidr_str):
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_apnic = executor.submit(task_apnic_hierarchy, cidr_str)
        future_routing = executor.submit(task_routing_intelligence, cidr_str)
        future_reverse = executor.submit(task_reverse_dns, cidr_str)
        try: res_apnic = future_apnic.result()
        except: res_apnic = {}
        try: res_routing = future_routing.result()
        except: res_routing = {}
        try: res_reverse = future_reverse.result()
        except: res_reverse = {}
    return { "cidr": cidr_str, **res_apnic, **res_routing, **res_reverse }

# === API ===
class InputData(BaseModel):
    raw_text: str

def convert_range_to_cidr(teks_input):
    try:
        parts = teks_input.split('-')
        if len(parts) != 2: return []
        start = ipaddress.ip_address(parts[0].strip())
        end = ipaddress.ip_address(parts[1].strip())
        return list(ipaddress.summarize_address_range(start, end))
    except: return []

@app.post("/api/scan")
@app.post("/scan")
async def scan_endpoint(payload: InputData):
    raw_lines = payload.raw_text.split('\n')
    if len(raw_lines) > 50: raise HTTPException(status_code=400, detail="Too many IPs.")
    valid_cidrs = []
    for line in raw_lines:
        line = line.strip()
        if not line: continue
        if not is_safe_input(line, type="IP"): continue
        if "-" in line and ":" not in line: valid_cidrs.extend(convert_range_to_cidr(line))
        else:
            try: valid_cidrs.append(ipaddress.ip_network(line, strict=False))
            except: continue
    results = []
    for cidr in valid_cidrs:
        try:
            data = scan_ip_logic_parallel(str(cidr))
            results.append(data)
            time.sleep(0.5) 
        except Exception as e: print(e)
    return results

class ASNInput(BaseModel):
    asn: str

@app.post("/api/asn")
@app.post("/asn")
async def asn_endpoint(payload: ASNInput):
    asn_clean = payload.asn.strip().upper()
    if not is_safe_input(asn_clean, type="ASN"): raise HTTPException(status_code=400, detail="Invalid ASN.")
    asn_clean = asn_clean.replace("AS", "").strip()
    asn_str = f"AS{asn_clean}"
    holder_name = asn_str
    prefixes_v4 = []
    prefixes_v6 = []
    upstreams = []
    with requests.Session() as s:
        try:
            url_overview = f"https://stat.ripe.net/data/as-overview/data.json?resource={asn_str}"
            resp = s.get(url_overview, timeout=5)
            if resp.status_code == 200: holder_name = resp.json().get('data', {}).get('holder', asn_str)
        except: pass
        try:
            url_prefix = f"https://stat.ripe.net/data/announced-prefixes/data.json?resource={asn_str}"
            resp = s.get(url_prefix, timeout=8)
            if resp.status_code == 200:
                prefix_data = resp.json().get('data', {}).get('prefixes', [])
                seen = set()
                for item in prefix_data:
                    p = item.get('prefix')
                    if p not in seen:
                        seen.add(p)
                        if ":" in p: prefixes_v6.append(p)
                        else: prefixes_v4.append(p)
        except: pass
        try:
            url_neigh = f"https://stat.ripe.net/data/asn-neighbours/data.json?resource={asn_str}"
            resp = s.get(url_neigh, timeout=6)
            if resp.status_code == 200:
                neigh_data = resp.json().get('data', {}).get('neighbours', [])
                for n in neigh_data:
                    if len(upstreams) < 15: upstreams.append(f"AS{n.get('asn')}")
        except: pass
    return {"asn": asn_str, "holder": holder_name, "total_v4": len(prefixes_v4), "total_v6": len(prefixes_v6), "prefixes_v4": prefixes_v4, "prefixes_v6": prefixes_v6, "upstreams": upstreams}
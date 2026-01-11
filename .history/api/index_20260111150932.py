from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress
import socket
import requests
import dns.resolver
import dns.reversename
import time
import concurrent.futures

# === SETTING APPS ===
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. SHARED UTILS
# ==========================================
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
            data_recv = s.recv(4096)
            if not data_recv: break
            response += data_recv
        s.close()
        return response.decode('utf-8', errors='ignore')
    except:
        return ""

def calculate_size(range_str):
    try:
        if '-' in range_str: 
            start, end = [x.strip() for x in range_str.split('-')]
            return int(ipaddress.ip_address(end)) - int(ipaddress.ip_address(start))
        else:
            net = ipaddress.ip_network(range_str, strict=False)
            return int(net.num_addresses)
    except: return 0

# ==========================================
# 2. WORKER TASKS (PARALLEL WORKERS)
# ==========================================

# --- TASK A: APNIC HIERARCHY (FIXED: NO TRUNCATION & IGNORE ROOT) ---
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
    
    # Filter List Blok Raksasa
    IGNORE_NAMES = [
        'APNIC-AP', 'IANA', 'ERX-NETBLOCK', 'ARIN-CIDR-BLOCK', 
        'ADMINISTERED-BY-RIPE', 'AFRINIC-CIDR-BLOCK', 'LACNIC-CIDR-BLOCK'
    ]

    for obj in hierarchy_list:
        rng = obj.get('_range')
        name = obj.get('netname', '').upper()
        
        if rng in seen: continue
        if any(bad in name for bad in IGNORE_NAMES): continue

        size = calculate_size(rng)
        if size >= 16000000: continue # Skip > /8
            
        seen.add(rng)
        obj['_size'] = size
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
            
            # Format: NETNAME (RANGE)
            child_str = f"{obj.get('netname', '?')} ({obj.get('_range')})"
            
            # === FIX: TAMPILKAN DESKRIPSI FULL (JANGAN DIPOTONG) ===
            if c_desc and c_desc != "-":
                child_str += f" : {c_desc}"
                
            children_txt.append(child_str)
            
    children_str = " | ".join(children_txt) if children_txt else "-"
    
    return {
        "parent_net": p_net,
        "parent_name": p_name,
        "parent_desc": p_desc,
        "children": children_str
    }

# --- TASK B: ROUTING INTELLIGENCE (UPSTREAM DETECTOR) ---
def task_routing_intelligence(cidr):
    irr_list = []
    rpki_status, rpki_detail, visibility = "UNKNOWN", "-", "Not Seen"
    detected_upstreams = set()
    
    try:
        with requests.Session() as s:
            # A. BGP State (Upstream Detection)
            url_bgp = f"https://stat.ripe.net/data/bgp-state/data.json?resource={cidr}"
            r_bgp = s.get(url_bgp, timeout=6).json()
            bgp_data = r_bgp.get('data', {}).get('bgp_state', [])
            
            peers_seeing = 0
            for route in bgp_data:
                path = route.get('path', [])
                if len(path) >= 2:
                    upstream = path[-2] # Second to last is upstream
                    detected_upstreams.add(f"AS{upstream}")
                peers_seeing += 1

            # B. Routing Status (IRR & Visibility Fallback)
            r_stat = s.get(f"https://stat.ripe.net/data/routing-status/data.json?resource={cidr}", timeout=5).json()
            data_stat = r_stat.get('data', {})
            
            if peers_seeing == 0:
                v4_p = data_stat.get('visibility', {}).get('v4', {}).get('ris_peers_seeing', 0)
                v6_p = data_stat.get('visibility', {}).get('v6', {}).get('ris_peers_seeing', 0)
                peers_seeing = v4_p if v4_p > 0 else v6_p
            
            for item in data_stat.get('route_objects', []):
                irr_list.append(f"{item.get('origin')}@{item.get('source')}")

            # C. Network Info
            r_net = s.get(f"https://stat.ripe.net/data/network-info/data.json?resource={cidr}", timeout=5).json()
            origin_as = "?"
            asns = r_net.get('data', {}).get('asns', [])
            if asns: origin_as = f"AS{asns[0]}"
            
            if peers_seeing > 0:
                if peers_seeing < 10: visibility = f"⚠️ Low Vis. ({peers_seeing} Peers) via {origin_as}"
                else: visibility = f"✅ Global ({peers_seeing} Peers) via {origin_as}"
            else:
                visibility = "❌ Not Announced"

            # D. RPKI Check
            r_rpki = s.get(f"https://stat.ripe.net/data/rpki-roas/data.json?resource={cidr}", timeout=5).json()
            roas = r_rpki.get('data', {}).get('roas', [])
            if roas:
                asn = roas[0].get('asn')
                maxlen = roas[0].get('max_length')
                if str(asn) == "0": rpki_status, rpki_detail = "INVALID (AS0)", "Terminated"
                else: rpki_status, rpki_detail = "VALID", f"AS{asn} (/{maxlen})"
            else:
                rpki_status = "NOT FOUND"
                
    except: pass

    # E. RADB Check
    try:
        raw_radb = query_socket(f"{cidr}", server=WHOIS_RADB)
        curr_origin, curr_source = None, None
        for line in raw_radb.split('\n'):
            line = line.strip()
            if line.startswith('origin:'): curr_origin = line.split(':')[1].strip().upper()
            if line.startswith('source:'): curr_source = line.split(':')[1].strip().upper()
            if curr_origin and curr_source:
                obj = f"{curr_origin}@{curr_source}"
                if obj not in irr_list: irr_list.append(obj)
                curr_origin, curr_source = None, None
    except: pass
    
    upstreams_str = ", ".join(list(detected_upstreams)) if detected_upstreams else "-"
    
    return {
        "visibility": visibility,
        "rpki_status": rpki_status,
        "rpki_detail": rpki_detail,
        "irr_objects": " | ".join(list(set(irr_list))) if irr_list else "-",
        "upstreams": upstreams_str
    }

# --- TASK C: REVERSE DNS ---
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
    except Exception as e:
        final_ptr_display = f"Error: {str(e)}"
    return {"ptr_record": final_ptr_display}

# ==========================================
# 3. CONTROLLER
# ==========================================
def scan_ip_logic_parallel(cidr_str):
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_apnic = executor.submit(task_apnic_hierarchy, cidr_str)
        future_routing = executor.submit(task_routing_intelligence, cidr_str)
        future_reverse = executor.submit(task_reverse_dns, cidr_str)
        
        res_apnic = future_apnic.result()
        res_routing = future_routing.result()
        res_reverse = future_reverse.result()
    
    return {
        "cidr": cidr_str,
        **res_apnic,
        **res_routing,
        **res_reverse
    }

# ==========================================
# 4. API ENDPOINTS
# ==========================================
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
    valid_cidrs = []
    for line in raw_lines:
        line = line.strip()
        if not line: continue
        if "-" in line and ":" not in line: 
            valid_cidrs.extend(convert_range_to_cidr(line))
        else:
            try: valid_cidrs.append(ipaddress.ip_network(line, strict=False))
            except: continue
            
    results = []
    for cidr in valid_cidrs:
        try:
            data = scan_ip_logic_parallel(str(cidr))
            results.append(data)
            time.sleep(0.5) 
        except Exception as e:
            print(f"Error processing {cidr}: {e}")
    return results

class ASNInput(BaseModel):
    asn: str

@app.post("/api/asn")
@app.post("/asn")
async def asn_endpoint(payload: ASNInput):
    asn_clean = payload.asn.upper().replace("AS", "").strip()
    asn_str = f"AS{asn_clean}"
    
    holder_name = asn_str
    prefixes_v4 = []
    prefixes_v6 = []
    upstreams = []

    with requests.Session() as s:
        # 1. Get Holder
        try:
            url_overview = f"https://stat.ripe.net/data/as-overview/data.json?resource={asn_str}"
            resp = s.get(url_overview, timeout=5)
            if resp.status_code == 200:
                holder_name = resp.json().get('data', {}).get('holder', asn_str)
        except: pass

        # 2. Get Prefixes (Split v4/v6)
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

        # 3. Get Neighbors (Peers/Upstreams)
        try:
            url_neigh = f"https://stat.ripe.net/data/asn-neighbours/data.json?resource={asn_str}"
            resp = s.get(url_neigh, timeout=6)
            if resp.status_code == 200:
                neigh_data = resp.json().get('data', {}).get('neighbours', [])
                for n in neigh_data:
                    neighbor_asn = f"AS{n.get('asn')}"
                    # Limit neighbor
                    if len(upstreams) < 15: 
                        upstreams.append(neighbor_asn)
        except: pass

    return {
        "asn": asn_str,
        "holder": holder_name,
        "total_v4": len(prefixes_v4),
        "total_v6": len(prefixes_v6),
        "prefixes_v4": prefixes_v4, 
        "prefixes_v6": prefixes_v6, 
        "upstreams": upstreams
    }
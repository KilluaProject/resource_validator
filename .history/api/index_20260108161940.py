from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress
import socket
import requests
import dns.resolver
import dns.reversename
import time

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
# 1. MODUL WHOIS (SOCKET)
# ==========================================
WHOIS_SERVER = "whois.apnic.net"

def query_socket(query_str):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(15)
        s.connect((WHOIS_SERVER, 43))
        cmd = f"{query_str}\r\n"
        s.send(cmd.encode())
        response = b""
        while True:
            data = s.recv(4096)
            if not data: break
            response += data
        s.close()
        return response.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"❌ Socket Error: {e}")
        return ""

# ==========================================
# 2. MODUL REVERSE DOMAIN & DELEGATION
# ==========================================
def get_reverse_zone(cidr_obj):
    try:
        if isinstance(cidr_obj, ipaddress.IPv4Network):
            parts = str(cidr_obj.network_address).split('.')
            if cidr_obj.prefixlen >= 24:
                return f"{parts[2]}.{parts[1]}.{parts[0]}.in-addr.arpa"
            elif cidr_obj.prefixlen >= 16:
                return f"{parts[1]}.{parts[0]}.in-addr.arpa"
            elif cidr_obj.prefixlen >= 8:
                return f"{parts[0]}.in-addr.arpa"
        elif isinstance(cidr_obj, ipaddress.IPv6Network):
            rev = cidr_obj.network_address.reverse_pointer
            nibbles = int(cidr_obj.prefixlen / 4)
            return ".".join(rev.split('.')[-(nibbles+2):])
    except:
        return None
    return None

def get_whois_delegation(cidr_obj):
    zone_name = get_reverse_zone(cidr_obj)
    if not zone_name: return None
    
    raw_text = query_socket(f"-rB {zone_name}")
    nservers = []
    lines = raw_text.split('\n')
    for line in lines:
        if 'nserver:' in line.lower():
            parts = line.split(':', 1)
            if len(parts) > 1:
                ns = parts[1].strip().lower()
                if ns not in nservers: nservers.append(ns)
    if nservers: return nservers
    return None

# ==========================================
# 3. MODUL UTAMA (GET DATA & PARSING)
# ==========================================
def get_full_data(cidr):
    cmd_parent = f"-rB {cidr}" 
    raw_parent = query_socket(cmd_parent)
    cmd_children = f"-m -rB {cidr}"
    raw_children = query_socket(cmd_children)
    return raw_parent + "\n\n" + raw_children

def parse_and_separate(raw_text):
    hierarchy_objs = []
    route_objs = []
    current_obj = {}
    lines = raw_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('%'):
            if current_obj:
                if 'inetnum' in current_obj or 'inet6num' in current_obj:
                    current_obj['_range'] = current_obj.get('inetnum', current_obj.get('inet6num'))
                    hierarchy_objs.append(current_obj)
                elif 'route' in current_obj or 'route6' in current_obj:
                    origin = current_obj.get('origin', 'UNKNOWN').upper()
                    source = current_obj.get('source', 'APNIC').upper()
                    route_objs.append(f"{origin}@{source}")
                current_obj = {}
            continue
        
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip().lower()
            val = val.strip()
            if key in current_obj:
                current_obj[key] += f" | {val}"
            else:
                current_obj[key] = val
    
    if current_obj:
        if 'inetnum' in current_obj or 'inet6num' in current_obj:
            current_obj['_range'] = current_obj.get('inetnum', current_obj.get('inet6num'))
            hierarchy_objs.append(current_obj)
        elif 'route' in current_obj or 'route6' in current_obj:
            origin = current_obj.get('origin', 'UNKNOWN').upper()
            source = current_obj.get('source', 'APNIC').upper()
            route_objs.append(f"{origin}@{source}")
            
    return hierarchy_objs, list(set(route_objs))

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
# 4. CONTROLLER LOGIC (HOSTMASTER OP VERSION)
# ==========================================
def scan_ip_logic(cidr_str):
    # print(f"\n🔍 Processing: {cidr_str}")
    
    # --- PHASE 1: IP WHOIS ---
    raw_text = get_full_data(cidr_str)
    hierarchy_list, route_list = parse_and_separate(raw_text)
    
    unique_hierarchy = []
    seen_ranges = set()
    for obj in hierarchy_list:
        rng = obj.get('_range')
        if rng not in seen_ranges:
            seen_ranges.add(rng)
            obj['_size'] = calculate_size(rng)
            unique_hierarchy.append(obj)
    unique_hierarchy.sort(key=lambda x: x['_size'], reverse=True)
    
    parent_obj = unique_hierarchy[0] if unique_hierarchy else None
    children_txt_list = []
    if unique_hierarchy:
        for obj in unique_hierarchy[1:]:
            children_txt_list.append(f"{obj.get('netname', '?')} ({obj.get('_range')})")

    p_net = parent_obj.get('_range', '-') if parent_obj else '-'
    p_name = parent_obj.get('netname', 'Not Found') if parent_obj else 'Not Found'
    p_desc = parent_obj.get('descr', '-') if parent_obj else '-'
    children_str = " | ".join(children_txt_list) if children_txt_list else "-"

    # --- PHASE 2: IRR & VISIBILITY ---
    final_irr_list = route_list[:]
    rpki_status, rpki_detail, visibility = "UNKNOWN", "-", "Not Seen"
    try:
        url = f"https://stat.ripe.net/data/routing-status/data.json?resource={cidr_str}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json().get('data', {})
            v4_vis = data.get('visibility', {}).get('v4', {}).get('ris_peers_seeing', 0)
            v6_vis = data.get('visibility', {}).get('v6', {}).get('ris_peers_seeing', 0)
            if v4_vis > 0 or v6_vis > 0: visibility = "Announced (Global)"
            for item in data.get('route_objects', []):
                item_fmt = f"{item.get('origin')}@{item.get('source')}"
                if item_fmt not in final_irr_list: final_irr_list.append(item_fmt)
        
        rpki_url = f"https://stat.ripe.net/data/rpki-roas/data.json?resource={cidr_str}"
        rpki_data = requests.get(rpki_url, timeout=5).json().get('data', {}).get('roas', [])
        if rpki_data:
            asn = rpki_data[0].get('asn')
            maxlen = rpki_data[0].get('max_length')
            if str(asn) == "0": rpki_status, rpki_detail = "INVALID (AS0)", "Terminated"
            else: rpki_status, rpki_detail = "VALID", f"AS{asn} (/{maxlen})"
        else: rpki_status = "NOT FOUND"
    except: pass

    # --- PHASE 3: REVERSE DNS & DELEGATION (SMART /24) ---
    final_ptr_display = ""
    try:
        net = ipaddress.ip_network(cidr_str, strict=False)
        # LOGIC: Kalo IPv4 dan prefix < 24 (Aggregate Block), cek anak-anaknya
        if net.version == 4 and net.prefixlen < 24:
            results = []
            results.append("Detected Aggregate Block (Checking /24 Delegation):")
            for subnet in net.subnets(new_prefix=24):
                nservers = get_whois_delegation(subnet)
                if nservers:
                    ns_str = ", ".join(nservers[:2])
                    results.append(f" ↳ {subnet}: {ns_str} (APNIC)")
                else:
                    results.append(f" ↳ {subnet}: No Delegation")
            final_ptr_display = "\n".join(results)
        else:
            # Single Check (/24 atau /32)
            dns_ptr = "No DNS PTR"
            try:
                rev = dns.reversename.from_address(str(net.network_address))
                resolver = dns.resolver.Resolver()
                resolver.nameservers = ['8.8.8.8']
                dns_ptr = str(resolver.resolve(rev, "PTR")[0])
            except: pass
            
            whois_ns = ""
            nservers = get_whois_delegation(net)
            if nservers: whois_ns = f"Delegated to: {', '.join(nservers[:2])}"
            
            if "No DNS" not in dns_ptr: final_ptr_display = f"{dns_ptr} (Live DNS)"
            elif whois_ns: final_ptr_display = f"{whois_ns} (APNIC Whois)"
            else: final_ptr_display = "No Reverse DNS & No Delegation"
    except Exception as e:
        final_ptr_display = f"Error: {str(e)}"

    return {
        "cidr": cidr_str,
        "parent_net": p_net,
        "parent_name": p_name,
        "parent_desc": p_desc,
        "children": children_str,
        "rpki_status": rpki_status,
        "rpki_detail": rpki_detail,
        "visibility": visibility,
        "irr_objects": " | ".join(final_irr_list) if final_irr_list else "-",
        "ptr_record": final_ptr_display
    }

# ==========================================
# 5. API ENDPOINTS
# ==========================================

# -- IP SCAN INPUT --
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
async def scan_endpoint(data: InputData):
    raw_lines = data.raw_text.split('\n')
    results = []
    for line in raw_lines:
        line = line.strip()
        if not line: continue
        targets = []
        if "-" in line and ":" not in line: targets = convert_range_to_cidr(line)
        else:
            try: targets = [ipaddress.ip_network(line, strict=False)]
            except: continue
        for cidr in targets:
            try: results.append(scan_ip_logic(str(cidr)))
            except Exception as e: print(f"❌ Error: {e}")
            time.sleep(1)
    return results

# -- NEW: ASN SCANNER INPUT --
class ASNInput(BaseModel):
    asn: str

@app.post("/api/asn")
@app.post("/asn")
async def asn_endpoint(data: ASNInput):
    asn_clean = data.asn.upper().replace("AS", "").strip()
    
    # 1. Cek Holder Name
    holder_name = f"AS{asn_clean}"
    try:
        url_overview = f"https://stat.ripe.net/data/as-overview/data.json?resource=AS{asn_clean}"
        resp = requests.get(url_overview, timeout=5)
        if resp.status_code == 200:
            holder_name = resp.json().get('data', {}).get('holder', f"AS{asn_clean}")
    except: pass

    # 2. Cek Announced Prefixes
    prefixes = []
    try:
        url_prefix = f"https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS{asn_clean}"
        resp = requests.get(url_prefix, timeout=10)
        if resp.status_code == 200:
            data = resp.json().get('data', {}).get('prefixes', [])
            seen = set()
            for item in data:
                p = item.get('prefix')
                if p not in seen:
                    prefixes.append(p)
                    seen.add(p)
    except: pass

    return {
        "asn": f"AS{asn_clean}",
        "holder": holder_name,
        "total_prefixes": len(prefixes),
        "prefixes": prefixes
    }
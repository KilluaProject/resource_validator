from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress
import socket
import requests
import time

# === SETTING DOCS AGAR BISA DIBUKA DI VERCEL ===
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. MODUL WHOIS (SOCKET CLEAN)
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
# 2. MODUL REVERSE DOMAIN (UPDATED: RECURSIVE /24)
# ==========================================
# Ini fungsi baru yang pinter mecah /24 bro
def check_ptr_recursive(cidr_input: str) -> str:
    results = []
    
    # Set timeout biar gak bengong lama kalo DNS mati
    socket.setdefaulttimeout(3)

    try:
        # Validasi CIDR
        network = ipaddress.ip_network(cidr_input, strict=False)

        # --- Helper kecil buat cek satu IP ---
        def lookup_one_ip(ip_str):
            try:
                hostname, _, _ = socket.gethostbyaddr(ip_str)
                return hostname
            except socket.herror:
                return "No Record"
            except Exception:
                return "Timeout/Error"

        # 1. Cek Blok Utama (Induk)
        # Kita ambil IP pertama (Network Address) sebagai sample
        main_ip = str(network.network_address)
        ptr_main = lookup_one_ip(main_ip)
        
        # Tambahin ke list hasil
        if network.version == 4 and network.prefixlen < 24:
             results.append(f"HEAD ({cidr_input}): {ptr_main}")
        else:
             results.append(f"{ptr_main}") # Kalo /24 atau /32, tampilin isinya aja

        # 2. Logic "Pecah Telur" (Khusus IPv4 & Prefix < 24)
        if network.version == 4 and network.prefixlen < 24:
            results.append("\n----- Breakdown /24 -----")
            
            # Looping setiap subnet /24
            for subnet in network.subnets(new_prefix=24):
                # Cek IP pertama dari subnet itu (biasanya .0)
                sub_ip = str(subnet.network_address)
                sub_ptr = lookup_one_ip(sub_ip)
                
                # Format: ↳ 103.10.x.0/24 : ptr.domain.com
                results.append(f"↳ {subnet}: {sub_ptr}")

    except ValueError:
        return "Invalid CIDR Format"
    except Exception as e:
        return f"System Error: {str(e)}"

    # Gabung semua list jadi satu string dengan Enter (\n)
    return "\n".join(results)


# ==========================================
# 3. MODUL UTAMA (GET DATA & PARSING)
# ==========================================
def get_full_data(cidr):
    # Query 1: IP Parent
    cmd_parent = f"-rB {cidr}" 
    print(f"   ↳ 📡 Query IP Parent: {cmd_parent}")
    raw_parent = query_socket(cmd_parent)
    
    # Query 2: IP Children (More Specific)
    cmd_children = f"-m -rB {cidr}"
    print(f"   ↳ 📡 Query IP Children: {cmd_children}")
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
    except:
        return 0

# ==========================================
# 4. CONTROLLER LOGIC
# ==========================================
def scan_ip_logic(cidr_str):
    print(f"\n🔍 Processing: {cidr_str}")
    
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

    # --- PHASE 3: REVERSE DNS (NEW LOGIC) ---
    # Kita panggil fungsi recursive yang baru di sini
    final_ptr = check_ptr_recursive(cidr_str)

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
        "ptr_record": final_ptr
    }

# ==========================================
# 5. API ENDPOINT
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
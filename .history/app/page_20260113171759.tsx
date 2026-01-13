"use client";

import { useState, useEffect, useRef } from "react";
import ResultModal from "@/components/ResultModal";
import { ScanResult } from "@/types";
import { useAuth } from "@/context/AuthContext"; 

interface ASNResult {
  asn: string;
  holder: string;
  total_v4: number;
  total_v6: number;
  prefixes_v4: string[];
  prefixes_v6: string[];
  upstreams: string[]; 
}

interface HistoryItem {
  id: number;
  date: string;
  mode: "IP" | "ASN";
  input: string;
  ipData?: ScanResult[];
  asnData?: ASNResult | null;
}

export default function Home() {
  const { isHostmaster } = useAuth(); 
  
  const [mode, setMode] = useState<"IP" | "ASN">("IP");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [totalScan, setTotalScan] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [asnResult, setAsnResult] = useState<ASNResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // History Helper
  const saveToHistory = (newMode: "IP" | "ASN", newInput: string, ipRes?: ScanResult[], asnRes?: ASNResult) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: newMode,
      input: newInput,
      ipData: ipRes,
      asnData: asnRes
    };
    const newHistory = [newItem, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("scanHistory", JSON.stringify(newHistory));
  };

  const restoreHistory = (item: HistoryItem) => {
    setMode(item.mode);
    setInput(item.input);
    if (item.mode === "IP" && item.ipData) {
      setResults(item.ipData);
      setAsnResult(null);
      setShowModal(true);
    } else if (item.mode === "ASN" && item.asnData) {
      setAsnResult(item.asnData);
      setResults([]);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("scanHistory");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setInput(event.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  };

  // === SATPAM FRONTEND (SIMPLIFIED REGEX) ===
  const validateInput = (text: string, type: "IP" | "ASN") => {
    const cleanText = text.trim();
    if (type === "ASN") return /^AS\d+$/i.test(cleanText);
    
    // Regex IPv4 (CIDR / Single)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[1-2]?[0-9]))?$/;
    
    // Regex IPv6
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){1,7}:?([0-9a-fA-F]{1,4})?(\/[0-9]{1,3})?$/;
    
    // Regex Range (LEBIH SANTAI: Angka.Angka - Angka.Angka)
    // Ini biar format "157.20.236.0 - 157.20.236.255" lolos
    const rangeRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*-\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

    return ipv4Regex.test(cleanText) || ipv6Regex.test(cleanText) || rangeRegex.test(cleanText);
  };

  // SCAN IP LOGIC
  const handleScanIP = async (targets: string) => {
    if (!targets.trim()) return;
    const lines = targets.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    // PEMBATASAN FITUR
    if (!isHostmaster && lines.length > 1) {
        alert("🔒 Mode Member Terbatas: Cuma bisa scan 1 IP.\n\nLogin sebagai Hostmaster untuk Bulk Scan!");
        return;
    }
    if (lines.length > 50) { 
        alert(`⚠️ Too many IPs! Max 50 baris.`);
        return;
    }

    for (let i = 0; i < lines.length; i++) {
        if (!validateInput(lines[i], "IP")) {
            alert(`⛔ Format Salah di Baris ke-${i+1}: "${lines[i]}"`);
            return;
        }
    }

    setLoading(true);
    setProgress(0);
    setTotalScan(lines.length);
    if(mode === "IP") { setAsnResult(null); setResults([]); setShowModal(false); }

    let accumulatedResults: ScanResult[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        try {
            const res = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ raw_text: line }),
            });
            const data = await res.json();
            if (data.error) { console.error("Backend Error:", data.error); continue; }
            accumulatedResults = [...accumulatedResults, ...data];
        } catch (error) { console.error(error); }
        setProgress(i + 1);
    }
    setResults(accumulatedResults);
    saveToHistory("IP", targets, accumulatedResults, undefined);
    setLoading(false);
    setShowModal(true); 
  };

  const handleScanASN = async () => {
    if (!input) return;
    if (!validateInput(input, "ASN")) { alert(`⛔ Format ASN Salah.`); return; }
    setLoading(true); setAsnResult(null); setResults([]); 
    try {
      const res = await fetch("/api/asn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asn: input }),
      });
      const data = await res.json();
      if (data.detail) { alert(`Error: ${data.detail}`); return; }
      setAsnResult(data);
      saveToHistory("ASN", input, undefined, data);
    } catch (error) { console.error(error); alert("Gagal scan ASN."); } finally { setLoading(false); }
  };

  const handleSubmit = () => {
    if (mode === "IP") handleScanIP(input);
    else handleScanASN();
  };

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-32 md:pt-40 px-4 md:px-6 text-center">
        
        {/* HEADER */}
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Resource <span className="text-blue-600">Validator.</span></h1>
          <p className="text-xl md:text-2xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">&quot;Kalau ada yang simpel, kenapa harus ribet?&quot;</p>
          <p className="text-slate-500 text-sm md:text-base">Otomatisasi WHOIS, RPKI, IRR, & Reverse DNS.</p>
        </div>

        {/* SWITCH BUTTON */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex w-full md:w-auto">
            <button onClick={() => { setMode("IP"); setInput(""); setAsnResult(null); }} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === "IP" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}>Scan IP / CIDR</button>
            <button onClick={() => { setMode("ASN"); setInput(""); setResults([]); }} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === "ASN" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"}`}>Scan ASN</button>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left transition-all focus-within:ring-4 focus-within:ring-blue-100/50">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
             <div className="flex flex-wrap items-center gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mode === "IP" ? "Bulk Input" : "Single Input"}</span>
               {mode === "IP" && (
                 <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${isHostmaster ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-200 text-slate-600 border-slate-300"}`}>
                   {isHostmaster ? "✅ Unlimited Bulk" : "🔒 Member: Max 1 IP"}
                 </span>
               )}
             </div>
             
             <div className="flex gap-2 w-full sm:w-auto">
               {mode === "IP" && isHostmaster && (
                 <>
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
                   <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none justify-center text-xs flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition-colors px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m0 0L8 8m4-4v12" /></svg> Upload .txt
                   </button>
                 </>
               )}
               {input && (<button onClick={() => setInput("")} className="flex-1 sm:flex-none justify-center text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-red-200 shadow-sm transition-colors">Clear</button>)}
             </div>
          </div>
          <div className="p-2">
             {mode === "IP" ? (
                <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    // Update placeholder biar user tau format baru
                    placeholder={isHostmaster ? `103.10.10.0/24\n157.20.236.0 - 157.20.236.255` : `103.10.10.0/24`} 
                    className="w-full h-40 p-4 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 font-mono text-sm resize-y" 
                />
             ) : (
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter ASN (e.g. AS136115)..." className="w-full h-16 px-4 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 font-mono text-lg font-bold" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
             )}
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
             <button onClick={handleSubmit} disabled={loading || !input} className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-300/50 active:scale-95">
                {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Processing {progress}/{totalScan}...</>) : (<>{mode === "IP" ? "🚀 Submit" : "Search ASN"}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>)}
             </button>
          </div>
        </div>

        {/* RECENT SCANS SAMA AJA */}
        {/* ... */}
      </div>

      {showModal && results.length > 0 && (
        <ResultModal data={results} onClose={() => setShowModal(false)} isHostmaster={isHostmaster} />
      )}
    </main>
  );
}
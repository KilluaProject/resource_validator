"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navber";
import ResultModal from "@/components/ResultModal";
import { ScanResult } from "@/types";

// Interface buat hasil ASN
interface ASNResult {
  asn: string;
  holder: string;
  total_prefixes: number;
  prefixes: string[];
}

export default function Home() {
  const [mode, setMode] = useState<"IP" | "ASN">("IP");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [asnResult, setAsnResult] = useState<ASNResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FITUR UPLOAD TXT ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // --- LOGIC SCAN IP ---
  const handleScanIP = async (targets: string) => {
    if (!targets.trim()) return;

    // 1. VALIDASI JUMLAH BARIS (MAX 50)
    const lineCount = targets.split('\n').filter(line => line.trim() !== '').length;
    if (lineCount > 50 && mode === "IP") {
        alert(`⚠️ Too many IPs! Maksimal 50 IP sekali scan biar browser gak ngebul.\nInput lu: ${lineCount} baris.`);
        return;
    }

    setLoading(true);
    if(mode === "IP") setAsnResult(null); 
    
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: targets }),
      });
      const data = await res.json();
      
      // LOGIC SIMPLE: Selalu munculin Modal, biarin user yg mutusin mau download apa enggak
      if (mode === "ASN") {
         setResults(prev => [...prev, ...data]);
      } else {
         setResults(data);
      }
      setShowModal(true);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal scan. Cek koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC SCAN ASN ---
  const handleScanASN = async () => {
    if (!input) return;
    setLoading(true);
    setAsnResult(null);
    setResults([]); 
    
    try {
      const res = await fetch("/api/asn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asn: input }),
      });
      const data = await res.json();
      setAsnResult(data);
    } catch (error) {
      console.error("ASN Error:", error);
      alert("Gagal scan ASN.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "IP") handleScanIP(input);
    else handleScanASN();
  };

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      <Navbar />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-28 px-6 text-center">
        
        <div className="mb-8 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Resource <span className="text-blue-600">Validator.</span>
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
            Automated auditing tools IP Public and ASnumber.
          </p>
        </div>

        {/* SWITCH TOGGLE */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button 
              onClick={() => { setMode("IP"); setInput(""); setAsnResult(null); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "IP" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Scan IP / CIDR
            </button>
            <button 
              onClick={() => { setMode("ASN"); setInput(""); setResults([]); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "ASN" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
              }`}
            >
              Scan ASN
            </button>
          </div>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left transition-all focus-within:ring-4 focus-within:ring-blue-100/50">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {mode === "IP" ? "Bulk Input Mode" : "Single Input Mode"}
               </span>
               {mode === "IP" && (
                 <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-300 font-medium">
                   Max 50 Lines
                 </span>
               )}
             </div>

             <div className="flex gap-2">
               {mode === "IP" && (
                 <>
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
                   <button onClick={() => fileInputRef.current?.click()} className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium transition-colors px-2 py-1 hover:bg-white rounded">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                     Upload .txt
                   </button>
                 </>
               )}
               {input && (
                 <button onClick={() => setInput("")} className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 hover:bg-white rounded transition-colors">
                   Clear
                 </button>
               )}
             </div>
          </div>

          <div className="p-2">
             {mode === "IP" ? (
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`103.10.10.0/24\n103.10.11.0/24\n202.10.x.x`}
                  className="w-full h-40 p-4 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 font-mono text-sm resize-y"
                />
             ) : (
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter ASN (e.g. AS136115)..."
                  className="w-full h-16 px-4 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 font-mono text-lg font-bold"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
             )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
             <button 
                onClick={handleSubmit}
                disabled={loading || !input}
                className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-slate-300/50 hover:shadow-blue-500/30 hover:-translate-y-0.5"
             >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "IP" ? "🚀 Submit" : "Search ASN"}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
             </button>
          </div>
        </div>

        {/* ASN RESULT GRID */}
        {mode === "ASN" && asnResult && (
          <div className="mt-12 text-left animate-in slide-in-from-bottom-5 fade-in duration-500 pb-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h2 className="text-2xl font-extrabold text-slate-800">{asnResult.asn}</h2>
                 <p className="text-slate-500 font-medium">{asnResult.holder}</p>
               </div>
               <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                  {asnResult.total_prefixes} Prefixes Found
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asnResult.prefixes.map((prefix, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-slate-700 font-medium">{prefix}</span>
                   </div>
                   <button 
                     onClick={() => handleScanIP(prefix)}
                     className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                   >
                     🔍 Audit
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && results.length > 0 && (
        <ResultModal data={results} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
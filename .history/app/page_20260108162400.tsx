"use client";

import { useState } from "react";
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
  // Mode: 'IP' atau 'ASN'
  const [mode, setMode] = useState<"IP" | "ASN">("IP");
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  
  // State khusus ASN
  const [asnResult, setAsnResult] = useState<ASNResult | null>(null);
  
  const [showModal, setShowModal] = useState(false);

  // Logic Scan IP (Hostmaster)
  const handleScanIP = async (targets: string) => {
    setLoading(true);
    // Kalau lagi mode IP, reset hasil ASN biar bersih
    if(mode === "IP") setAsnResult(null); 
    
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: targets }),
      });
      const data = await res.json();
      
      // Kalau dipanggil dari tombol Audit di list ASN, kita append (tambah)
      // Kalau manual scan, kita replace
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

  // Logic Scan ASN (New Feature)
  const handleScanASN = async () => {
    if (!input) return;
    setLoading(true);
    setAsnResult(null); // Reset hasil ASN lama
    setResults([]); // Reset hasil audit IP
    
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
    <main className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-32 px-6 text-center">
        
        {/* Title */}
        <div className="mb-10 space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Resource <span className="text-blue-600">Validator.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Automated auditing tools for Hostmaster IDNIC APJII. <br/>
            Validate RPKI, ROA, IRR, and Delegation in seconds.
          </p>
        </div>

        {/* === SWITCH TOGGLE IP/ASN === */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button 
              onClick={() => { setMode("IP"); setInput(""); setAsnResult(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "IP" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Scan IP / CIDR
            </button>
            <button 
              onClick={() => { setMode("ASN"); setInput(""); setResults([]); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "ASN" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
              }`}
            >
              Scan ASN
            </button>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-blue-100">
          <div className="pl-4 text-slate-400">
             {mode === "IP" ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             ) : (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             )}
          </div>
          
          {/* Conditional Input */}
          {mode === "IP" ? (
             <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste IP prefixes here (e.g. 103.10.10.0/24)..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none h-12 py-3 text-sm font-mono leading-tight"
             />
          ) : (
             <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter ASN (e.g. AS136115)..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 h-12 text-sm font-mono font-bold"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
             />
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading || !input}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Check Now"
            )}
          </button>
        </div>
        
        <p className="mt-4 text-xs text-slate-400 font-medium">
          {mode === "IP" ? "Bulk check supported. One CIDR per line." : "Enter ASN to retrieve announced prefixes."}
        </p>

        {/* === HASIL SCAN ASN (LIST GRID) === */}
        {mode === "ASN" && asnResult && (
          <div className="mt-12 text-left animate-in slide-in-from-bottom-5 fade-in duration-500 pb-20">
            
            {/* ASN Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h2 className="text-2xl font-extrabold text-slate-800">{asnResult.asn}</h2>
                 <p className="text-slate-500 font-medium">{asnResult.holder}</p>
               </div>
               <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                  {asnResult.total_prefixes} Prefixes Found
               </span>
            </div>

            {/* List Prefixes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asnResult.prefixes.map((prefix, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-slate-700 font-medium">{prefix}</span>
                   </div>
                   
                   {/* Tombol Audit per IP */}
                   <button 
                     onClick={() => handleScanIP(prefix)}
                     className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 flex items-center gap-2"
                   >
                     🔍 Audit
                   </button>
                </div>
              ))}
            </div>

            {asnResult.prefixes.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                    No prefixes found for this ASN.
                </div>
            )}
          </div>
        )}

      </div>

      {/* Result Modal (Pop-up Audit) */}
      {showModal && results.length > 0 && (
        <ResultModal data={results} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ResultModal from "@/components/ResultModal";
import { ScanResult } from "@/types";

interface ASNResult {
  asn: string;
  holder: string;
  total_prefixes: number;
  prefixes: string[];
}

// Tipe data buat History
interface HistoryItem {
  id: number;
  date: string;
  mode: "IP" | "ASN";
  input: string;
  ipData?: ScanResult[];     // Kalau mode IP, simpen hasil scan-nya
  asnData?: ASNResult | null; // Kalau mode ASN, simpen hasil ASN-nya
}

export default function Home() {
  const [mode, setMode] = useState<"IP" | "ASN">("IP");
  const [input, setInput] = useState("");
  
  // Progress State
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [totalScan, setTotalScan] = useState(0);

  // Data State
  const [results, setResults] = useState<ScanResult[]>([]);
  const [asnResult, setAsnResult] = useState<ASNResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // History State (NEW)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load History pas buka web
  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal load history", e);
      }
    }
  }, []);

  // 2. Fungsi Save History (Maksimal 5 item)
  const saveToHistory = (newMode: "IP" | "ASN", newInput: string, ipRes?: ScanResult[], asnRes?: ASNResult) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: newMode,
      input: newInput,
      ipData: ipRes,
      asnData: asnRes
    };

    const newHistory = [newItem, ...history].slice(0, 5); // Keep top 5
    setHistory(newHistory);
    localStorage.setItem("scanHistory", JSON.stringify(newHistory));
  };

  // 3. Fungsi Restore (Klik History -> Balikin Data)
  const restoreHistory = (item: HistoryItem) => {
    setMode(item.mode);
    setInput(item.input);
    
    if (item.mode === "IP" && item.ipData) {
      setResults(item.ipData);
      setAsnResult(null);
      setShowModal(true); // Langsung buka modal
    } else if (item.mode === "ASN" && item.asnData) {
      setAsnResult(item.asnData);
      setResults([]);
    }
  };

  // 4. Fungsi Clear History
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("scanHistory");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInput(event.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleScanIP = async (targets: string) => {
    if (!targets.trim()) return;
    const lines = targets.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    if (lines.length > 50 && mode === "IP") {
        alert(`⚠️ Too many IPs! Maksimal 50 IP sekali scan.\nInput lu: ${lines.length} baris.`);
        return;
    }

    setLoading(true);
    setProgress(0);
    setTotalScan(lines.length);
    if(mode === "IP") {
        setAsnResult(null);
        setResults([]);
    }

    setShowModal(true);

    // Temp array buat nyimpen hasil biar bisa disave ke history nanti
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
            
            // Update State (UI)
            setResults(prev => [...prev, ...data]);
            
            // Update Temp Array (Logic)
            accumulatedResults = [...accumulatedResults, ...data];
            
        } catch (error) {
            console.error(`Error scanning ${line}:`, error);
        }
        setProgress(i + 1);
    }
    
    // SAVE KE HISTORY SETELAH SEMUA SELESAI
    saveToHistory("IP", targets, accumulatedResults, undefined);
    
    setLoading(false);
  };

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
      
      // SAVE KE HISTORY
      saveToHistory("ASN", input, undefined, data);

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

      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-24 md:pt-32 px-4 md:px-6 text-center">
        
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Resource <span className="text-blue-600">Validator.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
            &quot;Kalau ada yang simpel, kenapa harus ribet?&quot;
          </p>
          <p className="text-slate-500 text-sm md:text-base">
            Otomatisasi Audit RPKI, IRR, & Reverse DNS untuk Hostmaster IDNIC APJII.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex w-full md:w-auto">
            <button 
              onClick={() => { setMode("IP"); setInput(""); setAsnResult(null); }}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "IP" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Scan IP / CIDR
            </button>
            <button 
              onClick={() => { setMode("ASN"); setInput(""); setResults([]); }}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "ASN" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-600"
              }`}
            >
              Scan ASN
            </button>
          </div>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left transition-all focus-within:ring-4 focus-within:ring-blue-100/50">
          
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
             <div className="flex flex-wrap items-center gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {mode === "IP" ? "Bulk Input" : "Single Input"}
               </span>
               {mode === "IP" && (
                 <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-300 font-medium">
                   Max 50 Lines
                 </span>
               )}
             </div>

             <div className="flex gap-2 w-full sm:w-auto">
               {mode === "IP" && (
                 <>
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
                   <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none justify-center text-xs flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition-colors px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                     Upload .txt
                   </button>
                 </>
               )}
               {input && (
                 <button onClick={() => setInput("")} className="flex-1 sm:flex-none justify-center text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-red-200 shadow-sm transition-colors">
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
                  placeholder={`103.10.10.0/24\n103.10.11.0/24`}
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
                className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-300/50 active:scale-95"
             >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing {progress}/{totalScan}...
                  </>
                ) : (
                  <>
                    {mode === "IP" ? "Start Audit" : "Search ASN"}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
             </button>
          </div>
        </div>
        
        {/* === FITUR BARU: RECENT SCANS === */}
        {history.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between px-2 mb-3">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Scans</h3>
               <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-600 font-bold hover:underline">
                 Clear History
               </button>
             </div>
             
             <div className="space-y-2">
               {history.map((item) => (
                 <div 
                    key={item.id} 
                    onClick={() => restoreHistory(item)}
                    className="bg-white border border-slate-200 hover:border-blue-300 p-3 rounded-xl flex items-center justify-between cursor-pointer group transition-all hover:shadow-md"
                 >
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                         item.mode === "IP" ? "bg-slate-800 text-white" : "bg-blue-600 text-white"
                       }`}>
                         {item.mode}
                       </div>
                       <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-slate-700 truncate max-w-[200px] md:max-w-md">
                            {item.input.split('\n')[0]} {item.input.split('\n').length > 1 && `(+${item.input.split('\n').length - 1} more)`}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.date}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                          Restore
                       </span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* ASN RESULT GRID */}
        {mode === "ASN" && asnResult && (
          <div className="mt-12 text-left animate-in slide-in-from-bottom-5 fade-in duration-500 pb-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h2 className="text-2xl font-extrabold text-slate-800 break-all">{asnResult.asn}</h2>
                 <p className="text-slate-500 font-medium text-sm">{asnResult.holder}</p>
               </div>
               <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100 whitespace-nowrap">
                  {asnResult.total_prefixes} Prefixes Found
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asnResult.prefixes.map((prefix, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-mono flex-none">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-slate-700 font-medium truncate">{prefix}</span>
                   </div>
                   <button 
                     onClick={() => handleScanIP(prefix)}
                     className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg transition-all hover:bg-blue-600 active:scale-95 flex items-center gap-2 whitespace-nowrap"
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
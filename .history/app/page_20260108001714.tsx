"use client";

import { useState } from "react";
import { ScanResult } from "@/types";
import { downloadCSV } from "@/libs/csvHelper";
import ResultModal from "@/components/ResultModal";

export default function Home() {
  // === STATE MANAGEMENT (SAMA KEK KEMAREN) ===
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState<ScanResult[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setInputText(event.target.result as string);
    };
    reader.readAsText(file);
  };

  const handleScan = async () => {
    if (!inputText.trim()) {
      alert("⚠️ IP-nya mana bro? Kosong nih!");
      return;
    }
    setLoading(true);
    setModalData(null);

    try {
      const response = await fetch('/api/scan', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: inputText }),
      });

      if (!response.ok) throw new Error("Gagal konek ke backend");
      const data: ScanResult[] = await response.json();

      if (data.length > 10) {
        downloadCSV(data);
        alert(`🚀 Berhasil scan ${data.length} IP! Laporan otomatis di-download.`);
      } else {
        setModalData(data);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error: Backend Python belum nyala atau timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // === BACKGROUND DENGAN GRID PATTERN HALUS ===
    <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Background Decoration (Grid) */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      
      {/* Gradient Blob (Pemanis) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/40 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

      <div className="w-full max-w-4xl z-10 flex flex-col gap-8">
        
        {/* === HEADER SECTION === */}
        <div className="text-center space-y-4">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase shadow-sm">
            Internal Tool v1.0
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Validator</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Audit status IP Member, RPKI Validation, dan Reverse DNS check dalam satu kedipan mata. 
            <span className="block mt-1 font-medium text-blue-600">Sat-set, Anti Ribet.</span>
          </p>
        </div>

        {/* === CARD UTAMA === */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
          
          {/* Card Header */}
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs font-mono text-slate-400">input_target.txt</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* INPUT AREA */}
            <div className="relative group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Target Resources (IP / CIDR)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"103.10.x.x/24\n192.168.1.0/24\n2001:db8::/32"}
                className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono text-sm text-slate-800 shadow-inner group-hover:bg-white"
                spellCheck={false}
              />
              {/* Tombol Clear (Floating) */}
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  className="absolute top-10 right-4 text-xs bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 px-3 py-1 rounded-md transition-colors font-medium z-20"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
              
              {/* File Upload (Custom Design) */}
              <div className="w-full md:w-auto">
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-white border border-slate-300 hover:border-blue-400 hover:text-blue-600 text-slate-600 py-2.5 px-5 rounded-xl transition-all shadow-sm group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm font-semibold">Upload .txt File</span>
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleScan}
                disabled={loading}
                className={`w-full md:w-auto py-3 px-8 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 min-w-[180px]
                  ${loading 
                    ? "bg-slate-400 cursor-not-allowed opacity-80" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 hover:scale-[1.02]"
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <span>Run Audit</span>
                  </>
                )}
              </button>
            </div>
            
          </div>
          
          {/* Card Footer (Info) */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-[10px] md:text-xs text-slate-400 uppercase tracking-wide font-semibold">
            <span>Security Check</span>
            <span>IDNIC APJII Hostmaster</span>
          </div>

        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Cuma Iseng doang ini mah
        </p>

      </div>

      {/* Modal Result */}
      {modalData && (
        <ResultModal 
          data={modalData} 
          onClose={() => {
            setModalData(null);
            setInputText(""); 
          }} 
        />
      )}
    </main>
  );
}
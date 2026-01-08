import { ScanResult } from "../types";

interface ResultModalProps {
  data: ScanResult[];
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  
  // --- HELPERS ---
  
  // 1. Logic buat nentuin ASN
  const getSuggestedASN = (irrString: string) => {
    // Kalau kosong / strip, kasih placeholder biar user tau harus isi sendiri
    if (!irrString || irrString === '-' || irrString === '' || !irrString.includes('AS')) {
      return "(ASN ANDA)"; 
    }
    // Kalau ada datanya, ambil yang pertama
    return irrString.split(' | ')[0].split('@')[0];
  };

  const getMaxLength = (cidr: string) => cidr.includes(":") ? "48" : "24";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("✅ Config copied to clipboard!");
  };

  // --- CSV EXPORTER ---
  const handleExportCSV = () => {
    const headers = [
      "CIDR", "Parent Network", "Parent Name", "RPKI Status", "RPKI Detail", 
      "Visibility", "Route Objects (IRR)", "Reverse DNS (PTR)", "Fix Suggestion (ASN)"
    ];

    const rows = data.map(item => {
      const clean = (text: string) => `"${text.replace(/"/g, '""')}"`;

      return [
        clean(item.cidr),
        clean(item.parent_net),
        clean(item.parent_name),
        clean(item.rpki_status),
        clean(item.rpki_detail),
        clean(item.visibility),
        clean(item.irr_objects),
        clean(item.ptr_record),
        item.rpki_status.includes("VALID") ? "-" : `Create ROA: ${getSuggestedASN(item.irr_objects)} (MaxLen /${getMaxLength(item.cidr)})`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Audit Report</h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
                {data.length} Resources
              </span>
            </div>
            <p className="text-slate-500 text-sm">Review hasil validasi resource member secara mendetail.</p>
          </div>

          <div className="flex gap-3">
            {/* TOMBOL DOWNLOAD CSV */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
              Export CSV
            </button>

            <button 
              onClick={onClose} 
              className="group bg-slate-50 hover:bg-red-50 p-2 rounded-xl border border-slate-200 hover:border-red-200 transition-all"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-white text-xs font-bold font-mono">{idx + 1}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-mono tracking-tight">{item.cidr}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Resource</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm ${
                    item.rpki_status.includes("INVALID") ? "bg-red-50 border-red-200 text-red-700" : 
                    item.rpki_status.includes("VALID") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                    "bg-orange-50 border-orange-200 text-orange-700"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${item.rpki_status.includes("VALID") ? "bg-emerald-500" : "bg-current"}`}></div>
                    <span className="text-xs font-bold font-mono">{item.rpki_status}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ... Identity & Technical Columns (Sama kayak sebelumnya) ... */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy Data</h4>
                    </div>
                    <div className="pl-4 border-l-2 border-blue-200 space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Parent Block</p>
                      <p className="font-semibold text-slate-800 text-sm">{item.parent_name}</p>
                      <p className="font-mono text-xs text-slate-500 bg-slate-100 inline-block px-1 rounded">{item.parent_net}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-slate-200 space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Sub-Allocations</p>
                       {item.children === "-" ? <p className="text-sm text-slate-400 italic">No sub-allocations</p> : 
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.children.split(' | ').map((child, cIdx) => (
                            <span key={cIdx} className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-xs font-mono">↳ {child}</span>
                          ))}
                        </div>
                       }
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Routing Intelligence</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-500 uppercase mb-1">Visibility</p>
                         <p className="text-sm font-bold text-slate-700">{item.visibility}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-500 uppercase mb-1">RPKI Detail</p>
                         <p className="text-sm font-bold text-slate-700 font-mono truncate">{item.rpki_detail}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Reverse DNS (PTR)</p>
                      <div className="bg-slate-800 text-slate-200 p-3 rounded-lg font-mono text-[11px] shadow-inner whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto">
                        {item.ptr_record}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-2">Route Objects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.irr_objects === "-" ? <span className="text-xs text-slate-400">-</span> : (
                          item.irr_objects.split(' | ').map((irr, iIdx) => (
                            <span key={iIdx} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-[11px] font-medium font-mono">{irr}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROA Fixer (TERMINAL) */}
                {!item.rpki_status.includes("VALID") && (
                  <div className="mt-8 relative group/terminal">
                    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                         </div>
                         <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">MyAPNIC_Config.sh</span>
                      </div>
                      
                      {/* Copy Button */}
                      <button 
                        onClick={() => handleCopy(`ASN: ${getSuggestedASN(item.irr_objects)}\nPrefix: ${item.cidr}\nMax Length: /${getMaxLength(item.cidr)}`)}
                        className="absolute top-12 right-4 text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-3 py-1 rounded transition border border-white/5 backdrop-blur-sm z-10"
                      >
                        📋 Copy
                      </button>

                      <div className="p-5 font-mono text-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <div>
                            <h5 className="text-slate-100 font-bold">Action Required: Create ROA</h5>
                            <p className="text-slate-400 text-xs mt-1">Status IP Invalid. Buat ROA di MyAPNIC dengan data berikut:</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-4">
                           <div>
                             <p className="text-slate-500 text-[10px] uppercase">Origin ASN</p>
                             {/* DISINI YANG BERUBAH */}
                             <p className="text-green-400 font-bold mt-1">{getSuggestedASN(item.irr_objects)}</p>
                           </div>
                           <div>
                             <p className="text-slate-500 text-[10px] uppercase">Prefix</p>
                             <p className="text-blue-400 font-bold mt-1">{item.cidr}</p>
                           </div>
                           <div>
                             <p className="text-slate-500 text-[10px] uppercase">Max Length</p>
                             <p className="text-purple-400 font-bold mt-1">/{getMaxLength(item.cidr)}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="h-4"></div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white z-10 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-8 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-300/50 transition-all hover:-translate-y-0.5"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
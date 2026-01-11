import { ScanResult } from "../types";

interface ResultModalProps {
  data: ScanResult[];
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  
  const getSuggestedASN = (irrString: string) => {
    if (!irrString || irrString === '-' || irrString === '' || !irrString.includes('AS')) {
      return "(ASN ANDA)"; 
    }
    return irrString.split(' | ')[0].split('@')[0];
  };

  const getMaxLength = (cidr: string) => cidr.includes(":") ? "48" : "24";

  // Helper untuk parsing Sub-allocation
  const parseChildString = (childStr: string) => {
    const match = childStr.match(/^(.*?) \((.*?)\)(?: : (.*))?$/);
    if (match) {
      return {
        netname: match[1],
        range: match[2],
        desc: match[3] || "-"
      };
    }
    return { netname: childStr, range: "", desc: "" };
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("✅ Config copied to clipboard!");
  };

  const handleExportCSV = () => {
    const headers = [
      "CIDR", "Parent Network", "Parent Name", "Parent Description", "RPKI Status", "RPKI Detail", 
      "Visibility", "Detected Upstreams", "Route Objects (IRR)", "Reverse DNS (PTR)", "Fix Suggestion (ASN)"
    ];
    const rows = data.map(item => {
      const clean = (text: string) => `"${text.replace(/"/g, '""')}"`;
      
      // FIX 1: Hapus (item as any), langsung panggil item.upstreams
      const upstreams = item.upstreams || "-";

      return [
        clean(item.cidr), clean(item.parent_net), clean(item.parent_name), clean(item.parent_desc),
        clean(item.rpki_status), clean(item.rpki_detail), clean(item.visibility),
        clean(upstreams), 
        clean(item.irr_objects), clean(item.ptr_record),
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
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-end md:items-center justify-center md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-white w-full md:rounded-2xl md:max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden rounded-t-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 md:py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Audit Report</h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200 whitespace-nowrap">
                {data.length} Resources
              </span>
            </div>
            <p className="text-slate-500 text-xs md:text-sm hidden md:block">Review hasil validasi resource member secara mendetail.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleExportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
              CSV
            </button>
            <button onClick={onClose} className="flex-none bg-slate-100 hover:bg-red-50 p-2 rounded-xl border border-slate-200 hover:border-red-200 transition-all text-slate-500 hover:text-red-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-4 md:space-y-6">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
              
              {/* Card Header */}
              <div className="px-4 py-3 md:px-6 md:py-4 bg-linear-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex-none flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold font-mono">{idx + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 font-mono tracking-tight truncate">{item.cidr}</h3>
                  </div>
                </div>
                <div className={`self-start md:self-auto flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm text-[10px] md:text-xs font-bold font-mono ${
                    item.rpki_status.includes("INVALID") ? "bg-red-50 border-red-200 text-red-700" : 
                    item.rpki_status.includes("VALID") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                    "bg-orange-50 border-orange-200 text-orange-700"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${item.rpki_status.includes("VALID") ? "bg-emerald-500" : "bg-current"}`}></div>
                    <span>{item.rpki_status}</span>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  
                  {/* Identity */}
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy Data</h4>
                    </div>
                    
                    {/* Parent Block */}
                    <div className="pl-3 border-l-2 border-blue-200 space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Parent Block</p>
                      <p className="font-semibold text-slate-800 text-sm break-words">{item.parent_name}</p>
                      <p className="text-xs text-slate-500 italic mb-1 border-l-2 border-slate-200 pl-2 py-0.5 bg-slate-50 rounded-r">{item.parent_desc}</p>
                      <p className="font-mono text-xs text-slate-500 bg-slate-100 inline-block px-1 rounded">{item.parent_net}</p>
                    </div>

                    {/* Children / Sub-Allocations (Stack Layout) */}
                    <div className="pl-3 border-l-2 border-slate-200 space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Sub-Allocations</p>
                       {item.children === "-" ? <p className="text-sm text-slate-400 italic">No sub-allocations</p> : 
                        <div className="flex flex-col gap-3 mt-2">
                          {item.children.split(' | ').map((child, cIdx) => {
                             const { netname, range, desc } = parseChildString(child);
                             return (
                                <div key={cIdx} className="px-3 py-2 bg-yellow-50 text-slate-700 border border-yellow-100 rounded text-xs leading-relaxed flex flex-col gap-0.5 shadow-sm">
                                  {/* Baris 1: IP Range */}
                                  <div className="flex items-center gap-2">
                                     <span className="font-mono font-bold text-blue-600 bg-blue-50/50 px-1 rounded">{range}</span>
                                     <span className="text-[10px] text-yellow-600/50">↳</span>
                                  </div>
                                  
                                  {/* Baris 2: Netname */}
                                  <div className="font-bold text-slate-800">
                                     {netname}
                                  </div>

                                  {/* Baris 3: Description */}
                                  <div className="text-slate-500 italic text-[11px] border-l-2 border-yellow-200 pl-2 mt-1">
                                     {desc}
                                  </div>
                                </div>
                             );
                          })}
                        </div>
                       }
                    </div>
                  </div>

                  {/* Technical (Routing & Upstreams) */}
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Routing Intelligence</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-500 uppercase mb-1">Visibility</p>
                         <p className="text-sm font-bold text-slate-700">{item.visibility}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <p className="text-[10px] text-slate-500 uppercase mb-1">RPKI Detail</p>
                         <p className="text-sm font-bold text-slate-700 font-mono truncate">{item.rpki_detail}</p>
                      </div>
                    </div>
                    
                    {/* Detected Upstreams */}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Detected Upstreams</p>
                      <div className="flex flex-wrap gap-1.5">
                        {/* FIX 2: Hapus (item as any), langsung panggil item.upstreams */}
                        {(!item.upstreams || item.upstreams === "-") ? <span className="text-xs text-slate-400 italic">No upstream data</span> : (
                          item.upstreams.split(', ').map((asn: string, uIdx: number) => (
                            <span key={uIdx} className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded text-[11px] font-bold font-mono">⟵ {asn}</span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Reverse DNS (PTR)</p>
                      <div className="bg-slate-800 text-slate-200 p-3 rounded-lg font-mono text-[11px] shadow-inner whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto">{item.ptr_record}</div>
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

                {/* Footer Actions */}
                <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-4">
                  {!item.rpki_status.includes("VALID") && (
                     <button 
                        onClick={() => handleCopy(`ASN: ${getSuggestedASN(item.irr_objects)}\nPrefix: ${item.cidr}\nMax Length: /${getMaxLength(item.cidr)}`)}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        Copy ROA Config
                      </button>
                  )}
                </div>

              </div>
            </div>
          ))}
          <div className="h-4"></div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white z-10 flex justify-end shrink-0">
          <button onClick={onClose} className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-300/50 transition-all active:scale-95">
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
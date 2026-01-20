"use client";

interface ASNResult {
  asn: string;
  holder: string;
  total_v4: number;
  total_v6: number;
  prefixes_v4: string[];
  prefixes_v6: string[];
  upstreams: string[]; 
}

interface ASNResultModalProps {
  data: ASNResult;
  onClose: () => void;
}

export default function ASNResultModal({ data, onClose }: ASNResultModalProps) {
  
  // Helper biar prefix bisa diklik untuk copy atau audit (future dev)
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-end md:items-center justify-center md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full md:rounded-2xl md:max-w-6xl h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden rounded-t-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                🏢 ASN Report
                <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-lg border border-blue-200">{data.asn}</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">{data.holder}</p>
          </div>

          <button onClick={onClose} className="bg-slate-100 hover:bg-red-50 p-2 rounded-lg border border-slate-200 hover:border-red-200 transition-all text-slate-500 hover:text-red-500 absolute top-4 right-4 md:static">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
            
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total IPv4</p>
                        <p className="text-2xl font-extrabold text-blue-600">{data.total_v4}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">v4</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total IPv6</p>
                        <p className="text-2xl font-extrabold text-purple-600">{data.total_v6}</p>
                    </div>
                    <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold">v6</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Chart Distribution */}
                <div className="col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Resource Distribution</h3>
                   <div className="space-y-4">
                         <div>
                            <div className="flex justify-between text-xs font-bold mb-1"><span className="text-blue-600">IPv4</span><span className="text-slate-600">{data.total_v4}</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(data.total_v4 / (data.total_v4 + data.total_v6 || 1)) * 100}%` }}></div></div>
                         </div>
                         <div>
                            <div className="flex justify-between text-xs font-bold mb-1"><span className="text-purple-600">IPv6</span><span className="text-slate-600">{data.total_v6}</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(data.total_v6 / (data.total_v4 + data.total_v6 || 1)) * 100}%` }}></div></div>
                         </div>
                   </div>
                </div>

                {/* Neighbors */}
                <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-full">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Detected Neighbors (BGP Peers)</h3>
                   <div className="flex flex-wrap gap-2">
                      {data.upstreams && data.upstreams.length > 0 ? (
                        data.upstreams.map((peer: string, idx: number) => (
                            <span key={idx} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-default">
                                🔗 {peer}
                            </span>
                        ))
                      ) : (<p className="text-sm text-slate-400 italic">No neighbor data available.</p>)}
                      
                      {data.upstreams && data.upstreams.length >= 15 && (
                        <span className="px-3 py-1.5 text-slate-400 text-xs font-bold rounded-lg border border-dashed border-slate-200">+ more</span>
                      )}
                   </div>
                </div>
            </div>

            {/* Prefixes List */}
            <div>
               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>Announced Prefixes</span>
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Top 50 Displayed</span>
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...data.prefixes_v4, ...data.prefixes_v6].slice(0, 50).map((prefix, idx) => (
                    <div key={idx} onClick={() => handleCopy(prefix)} className="bg-white px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer">
                       <span className={`font-mono font-medium truncate ${prefix.includes(':') ? 'text-purple-700' : 'text-slate-700'}`}>{prefix}</span>
                       <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Copy</span>
                    </div>
                  ))}
               </div>
               
               {((data.prefixes_v4.length + data.prefixes_v6.length) > 50) && (
                   <div className="mt-6 text-center">
                       <p className="text-xs text-slate-400 italic">... and { (data.prefixes_v4.length + data.prefixes_v6.length) - 50 } more prefixes hidden.</p>
                   </div>
               )}
            </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-100 bg-white z-10 flex justify-end shrink-0">
          <button onClick={onClose} className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-300/50 transition-all active:scale-95">
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
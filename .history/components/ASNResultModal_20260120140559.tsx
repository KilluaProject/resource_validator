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
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ Copied: ${text}`);
  };

  const totalPrefixes = data.total_v4 + data.total_v6;
  const v4Percentage = totalPrefixes > 0 ? (data.total_v4 / totalPrefixes) * 100 : 0;
  const v6Percentage = totalPrefixes > 0 ? (data.total_v6 / totalPrefixes) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center md:p-6 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full md:rounded-3xl md:max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col border border-slate-200/50 shadow-2xl shadow-slate-900/20 overflow-hidden rounded-t-3xl">
        
        {/* === HEADER SECTION === */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        {data.asn}
                    </h2>
                    <p className="text-lg text-slate-500 font-medium mt-1 flex items-center gap-1">
                        {data.holder}
                    </p>
                </div>
            </div>

            <button onClick={onClose} className="absolute top-5 right-5 md:static bg-slate-50 hover:bg-red-50 p-2.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all text-slate-500 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* === CONTENT SCROLL AREA === */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 space-y-6 scroll-smooth">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total IPv4 Prefixes</p>
                        <p className="text-3xl font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors">{data.total_v4.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">v4</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-purple-300 transition-all group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total IPv6 Prefixes</p>
                        <p className="text-3xl font-extrabold text-purple-600 group-hover:text-purple-700 transition-colors">{data.total_v6.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all">v6</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Distribution & Neighbors */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Resource Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-auto">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                            Distribution
                        </h3>
                        <div className="space-y-4">
                                <div>
                                <div className="flex justify-between text-sm font-bold mb-1.5"><span className="text-blue-600">IPv4</span><span className="text-slate-500">{v4Percentage.toFixed(1)}%</span></div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${v4Percentage}%` }}></div></div>
                                </div>
                                <div>
                                <div className="flex justify-between text-sm font-bold mb-1.5"><span className="text-purple-600">IPv6</span><span className="text-slate-500">{v6Percentage.toFixed(1)}%</span></div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${v6Percentage}%` }}></div></div>
                                </div>
                        </div>
                    </div>

                    {/* Neighbors */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            Upstreams / Peers
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.upstreams && data.upstreams.length > 0 ? (
                            data.upstreams.map((peer: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold font-mono rounded-lg border border-slate-200 transition-colors cursor-default select-all">
                                    {peer}
                                </span>
                            ))
                            ) : (<p className="text-sm text-slate-400 italic">No neighbor data available.</p>)}
                            
                            {data.upstreams && data.upstreams.length >= 15 && (
                            <span className="px-3 py-1.5 text-slate-400 text-xs font-bold rounded-lg border border-dashed border-slate-200">+ more</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Prefixes List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            Announced Prefixes
                        </h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Showing Top 50
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[...data.prefixes_v4, ...data.prefixes_v6].slice(0, 50).map((prefix, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleCopy(prefix)} 
                            className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                        >
                            <span className={`font-mono font-bold text-sm ${prefix.includes(':') ? 'text-purple-600' : 'text-blue-600'}`}>{prefix}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm transition-opacity">
                                Copy
                            </span>
                        </div>
                        ))}
                    </div>
                    
                    {((data.prefixes_v4.length + data.prefixes_v6.length) > 50) && (
                        <div className="mt-8 text-center pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">... and <span className="font-bold text-slate-900">{ (data.prefixes_v4.length + data.prefixes_v6.length) - 50 }</span> more prefixes hidden.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* === FOOTER === */}
        <div className="p-6 border-t border-slate-100 bg-white z-10 flex justify-end shrink-0">
          <button onClick={onClose} className="w-full md:w-auto px-10 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200/50 transition-all active:scale-95">
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
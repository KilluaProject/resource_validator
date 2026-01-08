import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      
      {/* Background Grid Pattern (Sama kayak Home) */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-28 px-6">
        
        {/* === HERO SECTION (Mirip Home) === */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Validator <span className="text-blue-600">Docs.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Panduan lengkap penggunaan tools audit Hostmaster. <br/>
            Pelajari cara kerja fitur IP Scan, ASN Scan, dan CSV Export.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* CARD 1: WHAT'S NEW (Highlight) */}
          <section className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-50/50 px-8 py-4 border-b border-blue-100 flex items-center gap-3">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                New v2.0
              </span>
              <h2 className="text-lg font-bold text-slate-800">Release Notes</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">ASN Scanner</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Fitur audit berbasis Member. Masukkan nomor ASN (contoh: <code>AS136115</code>) untuk menarik dan mengecek seluruh prefix yang di-announce.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-none">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">CSV Export</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Download laporan audit lengkap dalam format <code>.csv</code>. Cocok untuk arsip bulanan atau laporan ke manajemen.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-none">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Bulk TXT Upload</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Upload file <code>.txt</code> berisi daftar IP (satu per baris) untuk melakukan bulk scanning hingga 50 IP sekaligus.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Smart Delegation</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Sistem otomatis memecah blok aggregate (misal /23) dan mengecek delegasi NS server per subnet /24 secara rekursif.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* CARD 2: PANDUAN (Clean Style) */}
          <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 border-b border-slate-100 pb-4">
              Panduan Penggunaan
            </h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-5">
                <div className="flex-none w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-300/50">1</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Mode Scan IP / CIDR</h3>
                  <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                    Mode default untuk mengecek validitas IP member. Anda bisa memasukkan satu prefix atau banyak sekaligus.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 font-mono">
                    <p className="mb-1 text-slate-400 text-xs uppercase font-bold">Input Example:</p>
                    103.10.10.0/24<br/>
                    2001:db8::/32
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5">
                <div className="flex-none w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-300/50">2</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Mode Scan ASN</h3>
                  <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                    Gunakan mode ini untuk melihat resource member secara keseluruhan. Tools akan menarik data dari RIPEstat.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>Input nomor ASN (contoh: <code>136115</code>).</li>
                    <li>Klik tombol <strong>Audit</strong> pada list IP yang muncul.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 3: TECHNICAL LOGIC (Dark Mode) */}
          <section className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
             {/* Hiasan */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-6 relative z-10">Logic "Behind the Scene"</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              
              <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                 <div className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div> RPKI Validator
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Mencocokkan Origin ASN dan Prefix dengan database global. Jika Invalid, sistem men-generate script ROA yang benar.
                 </p>
              </div>

              <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                 <div className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div> Recursive PTR
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Mendeteksi blok aggregate (/23, /22) dan otomatis mengecek delegasi NS server pada setiap subnet /24 di dalamnya.
                 </p>
              </div>

              <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                 <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Real-time Check
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Tidak menggunakan database cache lokal. Semua data diambil langsung dari APNIC Whois dan DNS saat tombol ditekan.
                 </p>
              </div>

            </div>
          </section>

        </div>

        {/* Footer Link */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors"
            >
                <span>&larr;</span> Kembali ke Scanner
            </Link>
        </div>

      </div>
    </main>
  );
}
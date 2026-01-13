import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-28 px-6">
        
        {/* === HERO SECTION === */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Validator <span className="text-blue-600">Docs.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Panduan lengkap penggunaan tools audit Hostmaster. <br/>
            Pahami hak akses, fitur keamanan, dan cara kerja sistem.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* CARD 1: WHAT'S NEW (UPDATED) */}
          <section className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-50/50 px-8 py-4 border-b border-blue-100 flex items-center gap-3">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Update v2.1
              </span>
              <h2 className="text-lg font-bold text-slate-800">Security & Features Update</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1: Role Based */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Hostmaster Login</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Pemisahan hak akses. Fitur <strong>Bulk Scan</strong> dan <strong>CSV Export</strong> kini eksklusif untuk Hostmaster yang login.
                  </p>
                </div>
              </div>

              {/* Feature 2: Auto Logout */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-none">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Idle Session Timeout</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Demi keamanan data, sesi Hostmaster akan <strong>otomatis logout</strong> jika tidak ada aktivitas selama 10 menit.
                  </p>
                </div>
              </div>

              {/* Feature 3: Input Sanitization */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-none">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Strict Validation</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Sistem kini dilengkapi &quot;Satpam Digital&quot; (Regex) di Frontend & Backend untuk mencegah input format IP/ASN yang salah.
                  </p>
                </div>
              </div>

              {/* Feature 4: CSV Export */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">CSV Export (Locked)</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Download laporan audit lengkap dalam format <code>.csv</code>. (Hanya muncul setelah Login Hostmaster).
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* CARD 2: AKSES LEVEL COMPARISON (NEW SECTION) */}
          <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              Perbandingan Akses
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Fitur</th>
                    <th className="px-6 py-3 text-slate-600">Member / Tamu</th>
                    <th className="px-6 py-3 text-blue-600 font-bold">Hostmaster (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-medium text-slate-900">Scan Limit</td>
                    <td className="px-6 py-4">Max <strong>1 IP</strong> per scan</td>
                    <td className="px-6 py-4 text-green-600 font-bold">Max 50 IPs (Bulk)</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-medium text-slate-900">Upload .txt File</td>
                    <td className="px-6 py-4 text-red-400">❌ Tidak Bisa</td>
                    <td className="px-6 py-4 text-green-600">✅ Bisa</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-medium text-slate-900">Export CSV</td>
                    <td className="px-6 py-4 text-red-400">❌ Tidak Bisa</td>
                    <td className="px-6 py-4 text-green-600">✅ Bisa</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-medium text-slate-900">Session</td>
                    <td className="px-6 py-4">Unlimited</td>
                    <td className="px-6 py-4 text-orange-600">Auto-Logout 10 Menit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <div className="text-yellow-600 flex-none">💡</div>
              <p className="text-sm text-yellow-800">
                <strong>Cara Login:</strong> Klik ikon gembok (<svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>) di pojok kanan atas halaman utama dan masukkan password Hostmaster.
              </p>
            </div>
          </section>

          {/* CARD 3: TECHNICAL LOGIC */}
          <section className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <h2 className="text-xl font-bold mb-6 relative z-10">Logic &quot;Behind the Scene&quot;</h2>
            
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
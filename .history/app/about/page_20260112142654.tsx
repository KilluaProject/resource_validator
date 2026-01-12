import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-24 px-6 relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* === HEADER SECTION === */}
        <div className="text-center mb-16 space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Behind the <span className="text-blue-600">Code.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sebuah inisiatif kecil untuk dampak yang mungkin besar bagi orang yang membutuhkan 🤗.
          </p>
        </div>

        {/* === CONTENT GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* CARD 1: THE STORY (Why this tool exists?) */}
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              💡
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Kenapa Tools Ini Ada?</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>
                Menjadi seorang Hostmaster berarti berurusan dengan akurasi dan kecepatan. Sebelumnya, memvalidasi satu resource member membutuhkan waktu yang tidak sebentar.
              </p>
              <ul className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Harus buka APNIC Whois.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Pindah tab ke Validator RPKI buat cek ROA.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✕</span> Harus login ke myAPNIC.
                </li>
              </ul>
              <p className="font-medium text-slate-800 pt-2">
                Validator hadir untuk memangkas proses itu. Satu input, satu klik, semua data tersaji lengkap dalam hitungan detik.
              </p>
            </div>
          </section>

          {/* CARD 2: THE TECH STACK (Modern Engineering) */}
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:border-purple-200 transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Stack yang digunakan</h2>
            <p className="text-slate-600 text-sm mb-6">
              Sekadar tools kecil-kecilan yang dibangun pake stack Next.js dan Python. Tujuannya simpel, <i>biar urusan validasi resource gak perlu dicek manual satu-satu lagi</i>. Masih jauh dari kata sempurna, tapi lumayan buat bantu efisiensi kerjaan sehari-hari
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Stack Item */}
              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                 <div className="font-bold text-slate-800 text-sm w-24">Frontend</div>
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded">Next.js</span>
                    <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded">Tailwind CSS</span>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                 <div className="font-bold text-slate-800 text-sm w-24">Backend</div>
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded">Python</span>
                    <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded">FastAPI</span>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                 <div className="font-bold text-slate-800 text-sm w-24">Infrastructure</div>
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded">Vercel</span>
                    <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded">APNIC API</span>
                 </div>
              </div>
            </div>
          </section>

        </div>

        {/* === CREATOR SECTION (Developer Signature) === */}
        <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl animate-in zoom-in-95 duration-700 delay-200">
           
           {/* Decorative Blobs */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -ml-20 -mt-20"></div>
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -mr-20 -mb-20"></div>

           <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-6 border-4 border-slate-800">
                RA 
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Developed with ❤️ & ☕️
              </h3>

              <blockquote className="max-w-xl mx-auto text-slate-400 text-sm italic leading-relaxed mb-8">
                &quot;Tidak perlu menjadi programmer handal untuk membuat perubahan. Cukup peduli dengan masalah yang ada, dan punya kemauan untuk mencari solusinya.&quot;
              </blockquote>

              <Link href="/" className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Mulai Audit Resource &rarr;
              </Link>
           </div>
        </section>

        <div className="mt-12 text-center pb-10">
           <p className="text-xs text-slate-400">
             &copy; 2026 Resource Validator
           </p>
        </div>

      </div>
    </main>
  );
}
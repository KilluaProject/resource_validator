export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            About <span className="text-blue-600">Validator.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tools audit jaringan modern yang dibuat untuk menyederhanakan kompleksitas 
            validasi resource internet di IDNIC APJII.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: The Mission */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6">
              🎯
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Why This Tool Exists?</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Hostmaster butuh kecepatan dan akurasi. Mengecek RPKI, ROA, dan Whois secara manual memakan waktu. 
              {/* PERBAIKAN DI SINI: ganti " jadi &quot; */}
              Validator hadir sebagai solusi &quot;Satu Klik&quot; untuk memangkas waktu audit dari menit menjadi detik.
            </p>
          </div>

          {/* Card 2: The Technology */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl mb-6">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Powered by Modern Tech</h3>
            <p className="text-slate-600 text-sm mb-4">
              Dibangun dengan standar engineering terkini untuk performa maksimal:
            </p>
            
            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded border border-slate-200">Next.js 14</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded border border-slate-200">Python (FastAPI)</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded border border-slate-200">Tailwind CSS</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded border border-slate-200">Vercel</span>
            </div>
          </div>

        </div>

        {/* Developer Credit Section */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden">
          {/* Hiasan background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <h3 className="text-2xl font-bold mb-2 relative z-10">Developed with ❤️ & ☕</h3>
          
          {/* PERBAIKAN DI SINI: ganti " jadi &quot; dan ' jadi &apos; */}
          <p className="text-slate-300 mb-6 text-sm max-w-lg mx-auto relative z-10 italic">
            &quot;Code is like humor. When you have to explain it, it&apos;s bad.&quot;
          </p>
          
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm relative z-10">
             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xs">
                {/* Ganti Inisial Lu Disini */}
                ME 
             </div>
             <div className="text-left">
                {/* Ganti Nama Lu Disini */}
                <p className="text-xs font-bold text-white">Created by [NAMA LU]</p>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider">Internal Project 2025</p>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}
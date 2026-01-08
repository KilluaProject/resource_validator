import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-24 px-6 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Docs */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Dokumentasi Penggunaan</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Panduan lengkap penggunaan Resource Validator v2.0 untuk keperluan audit Hostmaster IDNIC APJII.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          
          {/* SECTION 1: WHAT'S NEW */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-extrabold">NEW</span>
              Fitur Terbaru (v2.0)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">🚀 ASN Scanner</h3>
                <p className="text-sm text-slate-600">
                  Cukup masukkan nomor ASN (contoh: <code>AS136115</code>), tools akan otomatis menarik semua prefix IP yang di-announce oleh ASN tersebut untuk diaudit.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">📊 Export to CSV</h3>
                <p className="text-sm text-slate-600">
                  Hasil audit sekarang bisa diunduh dalam format <code>.csv</code> (Excel) untuk keperluan laporan resmi atau arsip Hostmaster.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">📂 Bulk Upload (.txt)</h3>
                <p className="text-sm text-slate-600">
                  Tidak perlu copy-paste manual. Upload file <code>.txt</code> berisi daftar IP, dan sistem akan memprosesnya otomatis.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">🧠 Smart Delegation Check</h3>
                <p className="text-sm text-slate-600">
                  Otomatis mendeteksi blok besar (misal /23) dan mengecek delegasi Reverse DNS (PTR) di level /24 secara rekursif.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: CARA MENGGUNAKAN */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Panduan Penggunaan</h2>
            
            <div className="space-y-8">
              {/* Mode 1 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Mode Scan IP / CIDR</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Gunakan mode ini untuk mengecek validitas IP secara spesifik atau massal.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 bg-slate-100 p-4 rounded-xl border border-slate-200">
                    <li>Masukkan prefix IP per baris (contoh: <code>103.10.10.0/24</code>).</li>
                    <li>Maksimal input adalah <strong>50 IP</strong> per scan demi performa browser.</li>
                    <li>Bisa menggunakan tombol <strong>Upload .txt</strong> jika list IP sudah ada di file.</li>
                  </ul>
                </div>
              </div>

              {/* Mode 2 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Mode Scan ASN</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Gunakan mode ini untuk audit menyeluruh terhadap satu Member/ISP.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <li>Masukkan nomor ASN (contoh: <code>136115</code> atau <code>AS136115</code>).</li>
                    <li>Sistem akan menampilkan daftar seluruh prefix IPv4/IPv6 milik ASN tersebut.</li>
                    <li>Klik tombol <strong>🔍 Audit</strong> di sebelah IP untuk melakukan validasi mendalam.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: LOGIC PENJELASAN */}
          <section className="bg-slate-900 text-slate-300 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Bagaimana Validator Bekerja?</h2>
            <div className="space-y-6 text-sm leading-relaxed">
              <div>
                <h4 className="font-bold text-blue-400 mb-1">🔍 Validasi RPKI & ROA</h4>
                <p>
                  Sistem mengecek database RPKI global. Jika status <code>INVALID</code>, sistem akan menyarankan konfigurasi ROA yang benar (ASN, Prefix, Max Length /24) agar member bisa langsung copy-paste ke MyAPNIC.
                </p>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-bold text-purple-400 mb-1">🌐 Recursive PTR Check</h4>
                <p>
                  Untuk input blok besar (Aggregate) seperti /23 atau /22, sistem tidak hanya mengecek induknya. Sistem cerdas memecah blok tersebut menjadi subnet /24 dan mengecek delegasi NS server satu per satu.
                </p>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <h4 className="font-bold text-green-400 mb-1">⚡ Real-time Verification</h4>
                <p>
                  Data diambil secara real-time dari Whois APNIC, RIPEstat, dan DNS Global. Tidak ada database statis (caching), sehingga hasil audit selalu akurat detik itu juga.
                </p>
              </div>
            </div>
          </section>

        </div>

        <div className="mt-16 text-center border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500">
                Develope with ❤️ and ☕️.
            </p>
            <div className="mt-4">
                <Link href="/" className="text-blue-600 font-bold hover:underline">
                    &larr; Kembali ke Scanner
                </Link>
            </div>
        </div>

      </div>
    </main>
  );
}
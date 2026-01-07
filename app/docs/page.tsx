export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Dokumentasi Penggunaan</h1>
        <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8">
          Panduan singkat cara menggunakan Resource Validator untuk audit jaringan.
        </p>

        <div className="space-y-10">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
              Cara Melakukan Scan
            </h2>
            <div className="prose prose-slate text-sm text-slate-600 leading-relaxed">
              <p>Anda memiliki dua cara untuk memasukkan data target:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Manual Input:</strong> Ketik atau copy-paste list IP/CIDR ke kolom input. Satu baris satu IP.</li>
                <li><strong>Upload File:</strong> Upload file <code>.txt</code> yang berisi daftar IP. Sistem akan otomatis membaca isinya.</li>
              </ul>
              <div className="mt-3 bg-slate-100 p-3 rounded-lg font-mono text-xs text-slate-700 border border-slate-200">
                103.10.10.0/24<br/>
                2001:db8::/32
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
              Memahami Hasil & Status RPKI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-700 font-bold text-sm block mb-1">✅ VALID</span>
                <p className="text-xs text-emerald-600/80">
                  Aman. Route object sesuai dengan announcement BGP global. Tidak perlu tindakan.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-700 font-bold text-sm block mb-1">❌ INVALID (AS0)</span>
                <p className="text-xs text-red-600/80">
                  Prefix di-suspend atau ditandai AS0. Traffic global akan di-drop.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <span className="text-orange-700 font-bold text-sm block mb-1">⚠️ INVALID / NOT FOUND</span>
                <p className="text-xs text-orange-600/80">
                  Konfigurasi ROA salah atau belum dibuat. Gunakan fitur <strong>ROA Suggestion</strong> di hasil scan.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
              Fitur ROA Fixer
            </h2>
            <p className="text-sm text-slate-600">
              Jika hasil scan menunjukkan status <strong>INVALID</strong>, tools ini akan otomatis menampilkan kotak hitam berisi rekomendasi konfigurasi (ASN, Prefix, Max Length).
              Anda cukup menyalin data tersebut ke portal MyAPNIC.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 italic">
                Dibuat untuk mempermudah operasional Hostmaster IDNIC APJII.
            </p>
        </div>

      </div>
    </main>
  );
}
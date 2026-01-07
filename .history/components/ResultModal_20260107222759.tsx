import { ScanResult } from "../types";

interface ResultModalProps {
  data: ScanResult[];
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  return (
    // Overlay Hitam
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Container Utama */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Results ({data.length} IP)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Scroll ke bawah untuk melihat detail per IP
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body (Scrollable List) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-6">
          
          {data.map((item, idx) => (
            // --- ITEM CARD ---
            <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              
              {/* Header Card (IP & Status) */}
              <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">#{idx + 1}</span>
                  <h3 className="text-lg font-bold text-blue-900 font-mono tracking-wide">
                    {item.cidr}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  // Prioritas 1: Khusus INVALID (AS0) -> Merah Soft
                  item.rpki_status.includes("INVALID (AS0)")
                    ? "bg-red-100 text-red-700 border-red-100" 
                    // Prioritas 2: VALID -> Hijau
                    : item.rpki_status.includes("VALID") 
                    ? "bg-green-100 text-green-700 border-green-200" 
                    // Prioritas 3: INVALID Lainnya -> Merah Standar
                    : item.rpki_status.includes("INVALID")
                    ? "bg-red-100 text-red-700 border-red-200"
                    // Default: Abu-abu (Unknown/Not Found)
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}>
                  RPKI: {item.rpki_status}
                </span>
              </div>

              {/* Isi Detail (Grid Layout) */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* KIRI: WHOIS Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                    🏢 Whois Hierarchy
                  </h4>
                  
                  {/* Parent Info */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Parent (Direct Alloc)</p>
                    <p className="font-semibold text-gray-800 text-sm">{item.parent_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{item.parent_net}</p>
                    <p className="text-xs text-gray-600 italic mt-1 border-t border-gray-200 pt-1">
                      {item.parent_desc}
                    </p>
                  </div>

                  {/* Children Info */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sub-Allocations (Children)</p>
                    {item.children === "-" ? (
                      <span className="text-sm text-gray-400 italic">Tidak ada anak / sub-alloc</span>
                    ) : (
                      <ul className="text-xs text-gray-700 space-y-1 bg-yellow-50 p-2 rounded border border-yellow-100 max-h-40 overflow-y-auto">
                        {item.children.split(' | ').map((child, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <span className="text-yellow-600">↳</span>
                            {child}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* KANAN: Technical Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                    ⚙️ Technical Status
                  </h4>

                  {/* RPKI Detail */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">RPKI Detail</span>
                    <span className="text-sm font-mono font-medium text-gray-800">{item.rpki_detail}</span>
                  </div>

                  {/* Visibility */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-600">Global Visibility</span>
                    <span className={`text-sm font-bold ${
                      item.visibility.includes("Global") ? "text-green-600" : "text-gray-400"
                    }`}>
                      {item.visibility}
                    </span>
                  </div>

                  {/* Reverse DNS (UPDATED: Multi-line support) */}
                  <div className="flex flex-col border-b border-gray-100 pb-2 gap-1">
                    <span className="text-sm text-gray-600">Reverse DNS / Nameservers</span>
                    {/* Hapus 'truncate', ganti text-right & break-words biar turun ke bawah */}
                    <span className="text-sm font-mono text-gray-800 text-right wrap-break-word bg-gray-50 p-2 rounded border border-gray-100">
                      {item.ptr_record}
                    </span>
                  </div>

                  {/* IRR Objects */}
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">IRR Objects (Route)</span>
                    <div className="flex flex-wrap gap-1">
                      {item.irr_objects === "-" ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : (
                        item.irr_objects.split(' | ').map((irr, iIdx) => (
                          <span key={iIdx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                            {irr}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-bold transition-all shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
// Perhatiin importnya tetep pake @/ karena Next.js otomatis set alias ke root
import { ScanResult } from "@/types";
import { downloadCSV } from "@/libs/csvHelper";
import ResultModal from "@/components/ResultModal";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState<ScanResult[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInputText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleScan = async () => {
    if (!inputText.trim()) {
      alert("Isi dulu bro IP nya!");
      return;
    }

    setLoading(true);
    setModalData(null);

    try {
      // Pastikan backend python jalan di port 8000
      const response = await fetch('/api/scan', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: inputText }),
      });

      if (!response.ok) throw new Error("Gagal konek ke backend");

      const data: ScanResult[] = await response.json();

      if (data.length > 10) {
        downloadCSV(data);
        alert(`🚀 Berhasil scan ${data.length} IP! File laporan otomatis ter-download.`);
      } else {
        setModalData(data);
      }

    } catch (error) {
      console.error(error);
      alert("❌ Backend Error: Pastikan Python API (uvicorn) udah jalan!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
           Resource Validator 🐼
        </h1>
        <p className="text-gray-600">Whois, RPKI, & Reverse DNS dalam satu klik.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Input List IP / CIDR / Range (Satu per baris)
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Contoh:&#10;103.200.10.0/24&#10;192.168.1.10 - 192.168.1.20"
            className="w-full h-48 p-4 border placeholder:text-black placeholder:opacity-20 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none font-mono text-sm text-black"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-auto">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white transition shadow-lg
              ${loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
              }`}
          >
            {loading ? "Scanning..." : "🚀 Submit"}
          </button>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Cuma buat belajar aja ini mah 
      </p>

      {modalData && (
        <ResultModal 
          data={modalData} 
          onClose={() => setModalData(null)} 
        />
      )}
    </main>
  );
}
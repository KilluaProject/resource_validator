"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Fungsi buat deteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      // Kalo scroll lebih dari 10px, ubah state jadi true
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Bersihin event listener pas pindah halaman (biar gak memory leak)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-40 transition-all duration-300 ease-in-out ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-3" // Style pas Scroll
          : "bg-transparent border-b border-transparent py-5" // Style pas di Pucuk (Polos)
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-md transition-all ${
             scrolled 
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" 
              : "bg-white text-blue-600 shadow-sm"
          }`}>
            V
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Validator<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Menu Links */}
        <div className="flex gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Scanner
          </Link>
          <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Docs
          </Link>
        </div>

      </div>
    </nav>
  );
}
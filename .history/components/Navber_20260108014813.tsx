"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State buat Mobile Menu

  // Deteksi Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled || isOpen // Kalau discroll ATAU menu dibuka, background jadi putih
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-3" 
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-md transition-all ${
             scrolled || isOpen
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" 
              : "bg-white text-blue-600 shadow-sm"
          }`}>
            V
          </div>
          <span className={`font-bold tracking-tight text-lg transition-colors ${
            scrolled || isOpen ? "text-slate-800" : "text-slate-800" 
          }`}>
            Validator<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* === DESKTOP MENU (Hidden di Mobile) === */}
        <div className="hidden md:flex gap-8">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Scanner
          </Link>
          <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Docs
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            About
          </Link>
        </div>

        {/* === MOBILE HAMBURGER BUTTON (Visible di Mobile) === */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            // Icon X (Close)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Icon Hamburger (Menu)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* === MOBILE MENU DROPDOWN === */}
      {/* Muncul cuma kalau isOpen = true */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
          <Link 
            href="/" 
            className="text-base font-semibold text-slate-700 hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)} // Tutup menu pas diklik
          >
            🚀 Scanner
          </Link>
          <Link 
            href="/docs" 
            className="text-base font-semibold text-slate-700 hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)}
          >
            📚 Dokumentasi
          </Link>
          <Link 
            href="/about" 
            className="text-base font-semibold text-slate-700 hover:text-blue-600 py-2"
            onClick={() => setIsOpen(false)}
          >
            👤 About Project
          </Link>
        </div>
      )}

    </nav>
  );
}
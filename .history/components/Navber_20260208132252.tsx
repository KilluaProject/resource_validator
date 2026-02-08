"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

export default function Navbar() {
  const { isHostmaster, logout, login } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginSuccess = () => {
    login();
    alert("🔓 Hostmaster Mode Unlocked!");
  };

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* === LOGO SECTION === */}
            <Link href="/" className="shrink-0 flex items-center cursor-pointer group py-2">
              <div className="relative w-40 h-12 md:w-64 md:h-20"> 
                 <Image 
                    src="/apjii-idnic-logo.png" 
                    alt="IDNIC Logo" 
                    fill
                    className="object-contain object-left"
                    priority
                    sizes="(max-width: 768px) 160px, 256px"
                 />
              </div>
            </Link>
            {/* === END LOGO === */}

            {/* MENU DESKTOP */}
            <div className="hidden md:flex items-center gap-8">
               <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Scanner</Link>
               <Link href="/docs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Docs</Link>
               <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">About</Link>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4">
              {isHostmaster ? (
                <div className="flex items-center gap-3">
                    <span className="hidden md:block text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">
                        Hi, Hostmaster
                    </span>
                    <button 
                    onClick={logout}
                    title="Logout"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  title="Hostmaster Login"
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm ${
                      scrolled 
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white" 
                      : "bg-white/80 text-slate-600 hover:bg-white hover:text-blue-600 backdrop-blur-sm"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </button>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-4 space-y-3 shadow-xl absolute w-full z-50">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-bold">Scanner</Link>
              <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-bold">Docs</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-bold">About</Link>
          </div>
        )}
      </nav>
    </>
  );
}
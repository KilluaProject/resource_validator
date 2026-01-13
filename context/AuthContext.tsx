"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isHostmaster: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHostmaster, setIsHostmaster] = useState(false);

  // === 1. DEFINISI FUNGSI ===
  const login = () => {
    setIsHostmaster(true);
    localStorage.setItem("isHostmaster", "true");
  };

  const logout = () => {
    setIsHostmaster(false);
    localStorage.removeItem("isHostmaster");
    window.location.reload(); 
  };

  // === 2. USE EFFECT ===
  
  // Cek Login saat Load (DIPERBAIKI PAKE TIMEOUT)
  useEffect(() => {
    // Kita bungkus pake setTimeout biar gak dianggap "Synchronous Update"
    // Ini trik ampuh buat ngilangin error "Cascading Render"
    const timer = setTimeout(() => {
      const session = localStorage.getItem("isHostmaster");
      if (session === "true") {
        setIsHostmaster(true);
      }
    }, 0);

    return () => clearTimeout(timer); // Cleanup biar aman
  }, []);

  // Logic Auto Logout (Idle 10 Menit)
  useEffect(() => {
    if (!isHostmaster) return;

    let timeoutId: NodeJS.Timeout;
    
    const doAutoLogout = () => {
      logout(); 
      alert("⚠️ Sesi Habis!\n\nAnda otomatis logout karena tidak ada aktivitas selama 10 menit.");
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(doAutoLogout, 10 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isHostmaster]); 

  return (
    <AuthContext.Provider value={{ isHostmaster, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
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

  // 1. Cek Login saat Load
  useEffect(() => {
    const session = localStorage.getItem("isHostmaster");
    if (session === "true") setIsHostmaster(true);
  }, []);

  // 2. Logic Auto Logout (Idle 10 Menit) - Pindah kesini
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

  const login = () => {
    setIsHostmaster(true);
    localStorage.setItem("isHostmaster", "true");
  };

  const logout = () => {
    setIsHostmaster(false);
    localStorage.removeItem("isHostmaster");
    // Opsional: Redirect atau refresh
    // window.location.reload(); 
  };

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
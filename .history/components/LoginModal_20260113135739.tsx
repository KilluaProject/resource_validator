// frontend/components/LoginModal.tsx
"use client";

import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = () => {
    // --- PASSWORD RAHASIA ---
    if (password === "IDNIC2026") {
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Hostmaster Access</h3>
        <p className="text-slate-500 text-sm mb-4">Masukkan password untuk membuka fitur admin.</p>
        
        <input 
          type="password" 
          placeholder="Password..." 
          className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-slate-800"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        
        {error && <p className="text-red-500 text-xs font-bold mb-3 animate-pulse">Password salah, bro!</p>}

        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors">Batal</button>
          <button onClick={handleLogin} className="flex-1 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-200">Login</button>
        </div>
      </div>
    </div>
  );
}
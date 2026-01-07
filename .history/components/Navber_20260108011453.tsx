import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-blue-500/30 transition-all">
            V
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">
            Validator<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Menu Links */}
        <div className="flex gap-6">
          
          <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Dokumentasi
          </Link>
        </div>

      </div>
    </nav>
  );
}
import Link from "next/link";

interface NavbarProps {
  isHostmaster: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ isHostmaster, onLogin, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Resource <span className="text-blue-600">Validator</span>
            </span>
          </div>

          {/* RIGHT SIDE: DOCS LINK & LOGIN BUTTON */}
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors hidden sm:block">
              Documentation
            </Link>
            
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            {isHostmaster ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 transition-all active:scale-95"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Logout (HM)
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Hostmaster
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
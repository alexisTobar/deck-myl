import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // --- LÓGICA DE ERA ACTUAL ---
  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const isBuilder = location.pathname.includes("builder");
  const formatPrefix = isImperio ? "/imperio" : isPB ? "/primer-bloque" : "";

  // Colores dinámicos según la Era
  const themeColor = isPB ? "text-yellow-400" : isImperio ? "text-orange-500" : "text-blue-400";
  const themeBtn = isPB ? "bg-gradient-to-r from-yellow-600 to-yellow-500" : "bg-gradient-to-r from-orange-600 to-orange-500";

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (token && user) {
        setIsLoggedIn(true);
        setUsername(user.username || "Invocador");
      } else {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      {/* --- NAVBAR PRINCIPAL --- */}
      <nav className={`sticky top-0 z-[100] w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${isBuilder ? 'py-1' : 'py-2'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center">
          
          {/* ✅ LOGO OPTIMIZADO: Aumentado en Web (h-16 a h-20) y Móvil (h-12) */}
          <Link to="/" className="group flex items-center transition-transform hover:scale-105 active:scale-95 py-1">
            <img 
              src="https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png" 
              alt="MitosApp Logo" 
              className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            />
          </Link>

          {/* MENÚ CENTRAL (ESCRITORIO) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
            <NavLink to="/" label="Portal" icon="🏠" />
            <NavLink to="/community" label="Comunidad" icon="🌍" />
            <NavLink to="/my-decks" label="Mis Mazos" icon="🃏" />
            
            {isLoggedIn && username === "Juegos Vikingos" && (
                <NavLink to="/admin/cards" label="Admin" icon="⚙️" />
            )}
            
            {(isImperio || isPB) && (
              <Link 
                to={`${formatPrefix}/builder`}
                className={`ml-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white shadow-xl hover:scale-105 active:scale-95 transition-all ${themeBtn}`}
              >
                🛠️ Construir Mazo
              </Link>
            )}
          </div>

          {/* ÁREA DE USUARIO */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bienvenido</span>
                  <span className={`text-sm font-bold ${themeColor}`}>{username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="group flex items-center gap-2 bg-slate-900 hover:bg-red-600/10 border border-white/5 hover:border-red-600/50 p-2 md:px-4 md:py-2 rounded-xl transition-all"
                >
                  <span className="hidden md:block text-[10px] font-black text-slate-400 group-hover:text-red-500 uppercase">Salir</span>
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2 rounded-xl bg-white text-black text-xs font-black uppercase hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- DOCK MÓVIL --- */}
      {!isBuilder && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-around items-center">
            <MobileIcon to="/" icon="🏠" label="Inicio" active={location.pathname === "/"} />
            <MobileIcon to="/community" icon="🌍" label="Arena" active={location.pathname.includes("community")} />
            
            {(isImperio || isPB) ? (
              <Link to={`${formatPrefix}/builder`} className={`-translate-y-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-slate-950 active:scale-90 transition-all ${themeBtn}`}>
                <span className="text-2xl">🛠️</span>
              </Link>
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 border-4 border-slate-950 -translate-y-6">
                <span className="text-xl">🔒</span>
              </div>
            )}

            <MobileIcon to="/my-decks" icon="🃏" label="Mazo" active={location.pathname === "/my-decks"} />
            {isLoggedIn ? (
               <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 transition-all active:scale-90">
                  <span className="text-xl">🚪</span>
                  <span className="text-[9px] font-black uppercase text-red-500">Salir</span>
               </button>
            ) : (
               <MobileIcon to="/login" icon="👤" label="Login" active={location.pathname === "/login"} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.includes(to));
  return (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-200'}`}>
      <span>{icon}</span> {label}
    </Link>
  );
}

function MobileIcon({ to, icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 p-2">
      <span className={`text-xl transition-all ${active ? 'scale-110' : 'opacity-50 grayscale'}`}>{icon}</span>
      <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-orange-500' : 'text-slate-500'}`}>{label}</span>
    </Link>
  );
}
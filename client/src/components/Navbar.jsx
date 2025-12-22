import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFormatModal, setShowFormatModal] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // --- DETECCIÓN DE FORMATO ACTUAL ---
  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const formatPrefix = isImperio ? "/imperio" : isPB ? "/primer-bloque" : "";

  // Colores dinámicos para el Dock
  const themeColor = isPB ? "text-yellow-500" : isImperio ? "text-orange-500" : "text-blue-400";
  const activeBg = isPB ? "bg-yellow-500/10" : isImperio ? "bg-orange-500/10" : "bg-blue-500/10";
  const themeBtn = isPB ? "bg-yellow-600" : isImperio ? "bg-orange-600" : "bg-blue-600";

  useEffect(() => {
    const checkSession = () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        if (token && user) {
            setIsLoggedIn(true);
            setUsername(user.username || "Usuario");
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

  // Clase para los links del Dock inferior
  const getMobileLinkClass = (path) => 
    location.pathname === path 
      ? `${themeColor} ${activeBg} font-bold` 
      : "text-slate-500 hover:text-white";

  const handleCreateClick = () => {
    if (formatPrefix) navigate(`${formatPrefix}/builder`);
    else setShowFormatModal(true);
  };

  const handleGoToBuilder = (selectedFormat) => {
    setShowFormatModal(false);
    const path = selectedFormat === 'imperio' ? "/imperio/builder" : "/primer-bloque/builder";
    navigate(path);
  };

  return (
    <>
      {/* --- NAVBAR DESKTOP (PC) --- */}
      <nav className="hidden md:flex bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 px-10 justify-between items-center shadow-xl">
        <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 italic">
          MITOSAPP ⚔️
        </Link>
        
        <div className="flex gap-8 items-center font-bold text-xs uppercase tracking-tighter">
          <Link to={formatPrefix || "/"} className={location.pathname === (formatPrefix || "/") ? themeColor : "text-slate-400 hover:text-white"}>Inicio</Link>
          <Link to={formatPrefix ? `${formatPrefix}/community` : "/community"} className={location.pathname.includes("/community") ? themeColor : "text-slate-400 hover:text-white"}>Comunidad</Link>
          <Link to="/my-decks" className={location.pathname === "/my-decks" ? themeColor : "text-slate-400 hover:text-white"}>Mis Mazos</Link>
          
          <button onClick={handleCreateClick} className={`${themeBtn} text-white px-5 py-2 rounded-xl transition shadow-lg hover:brightness-110`}>
            + Crear Mazo
          </button>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-800 pl-8">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                  <p className={`text-[9px] ${themeColor} uppercase font-black`}>{isPB ? 'ILUMINADO' : 'GUERRERO'}</p>
                  <p className="text-sm text-white font-bold">{username}</p>
              </div>
              <button onClick={handleLogout} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className={`${themeBtn} text-white px-4 py-2 rounded-xl text-xs font-black`}>INGRESAR</Link>
          )}
        </div>
      </nav>

      {/* --- ✅ BOTONES MÓVILES (DOCK INFERIOR RESTAURADO) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex justify-around items-center z-[100] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        
        <Link to={formatPrefix || "/"} className={`flex flex-col items-center p-2 rounded-xl transition-all ${getMobileLinkClass(formatPrefix || "/")}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1 font-bold">Inicio</span>
        </Link>

        <Link to={formatPrefix ? `${formatPrefix}/community` : "/community"} className={`flex flex-col items-center p-2 rounded-xl transition-all ${getMobileLinkClass(formatPrefix ? `${formatPrefix}/community` : "/community")}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-[10px] mt-1 font-bold">Comunidad</span>
        </Link>

        {/* BOTÓN CENTRAL FLOTANTE PARA CREAR */}
        <button 
            onClick={handleCreateClick}
            className={`-translate-y-6 ${themeBtn} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-slate-950 active:scale-90 transition-transform`}
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>

        <Link to="/my-decks" className={`flex flex-col items-center p-2 rounded-xl transition-all ${getMobileLinkClass("/my-decks")}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" /></svg>
            <span className="text-[10px] mt-1 font-bold">Mis Mazos</span>
        </Link>

        <Link to={isLoggedIn ? "/profile" : "/login"} className={`flex flex-col items-center p-2 rounded-xl transition-all ${getMobileLinkClass(isLoggedIn ? "/profile" : "/login")}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-1 font-bold">{isLoggedIn ? "Perfil" : "Entrar"}</span>
        </Link>

      </div>

      {/* --- MODAL DE SELECCIÓN (Destino) --- */}
      {showFormatModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowFormatModal(false)}>
            <div className="bg-slate-800 border border-slate-600 p-6 rounded-[32px] shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-white mb-6 uppercase italic">Elige tu Constructor</h3>
                <div className="grid gap-4">
                    <button onClick={() => handleGoToBuilder('imperio')} className="bg-slate-700 hover:bg-orange-600 p-4 rounded-2xl transition-all flex justify-between items-center font-black">
                        🏛️ IMPERIO <span>➜</span>
                    </button>
                    <button onClick={() => handleGoToBuilder('primer_bloque')} className="bg-slate-700 hover:bg-yellow-600 p-4 rounded-2xl transition-all flex justify-between items-center font-black">
                        📜 PRIMER BLOQUE <span>➜</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
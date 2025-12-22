import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Ocultar Navbar en el constructor para no estorbar
  if (location.pathname.includes("builder")) {
    return null;
  }

  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const formatPrefix = isImperio ? "/imperio" : isPB ? "/primer-bloque" : "";

  // Colores dinámicos según la era
  const themeColor = isPB ? "text-yellow-500" : isImperio ? "text-orange-500" : "text-blue-400";
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

  const handleGoToBuilder = (selectedFormat) => {
    setShowFormatModal(false);
    const path = selectedFormat === 'imperio' ? "/imperio/builder" : "/primer-bloque/builder";
    navigate(path);
  };

  return (
    <>
      {/* --- NAVBAR ESCRITORIO --- */}
      <nav className="hidden md:flex bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 px-10 justify-between items-center shadow-xl">
        <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 italic">
          MITOSAPP ⚔️
        </Link>
        
        <div className="flex gap-8 items-center font-bold text-xs uppercase tracking-tighter">
          <Link to="/" className="text-slate-400 hover:text-white">Cambiar Era</Link>
          <Link to={formatPrefix || "/"} className={location.pathname === (formatPrefix || "/") ? themeColor : "text-slate-400 hover:text-white"}>Home Era</Link>
          <Link to="/community" className="text-slate-400 hover:text-white">Comunidad</Link>
          <Link to="/my-decks" className="text-slate-400 hover:text-white">Mis Mazos</Link>
          <button onClick={() => setShowFormatModal(true)} className={`${themeBtn} text-white px-5 py-2 rounded-xl transition shadow-lg`}>+ Crear Mazo</button>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              <span className="text-white font-bold text-sm">{username}</span>
              <button onClick={handleLogout} className="bg-red-600/10 text-red-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white">SALIR</button>
            </div>
          ) : (
            <Link to="/login" className={`${themeBtn} text-white px-4 py-2 rounded-xl text-xs font-black`}>INGRESAR</Link>
          )}
        </div>
      </nav>

      {/* --- DOCK MÓVIL (CORREGIDO) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex justify-around items-center z-[100] pb-6 shadow-2xl text-white">
        
        <Link to="/" className="flex flex-col items-center p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] mt-1 font-bold">Portal</span>
        </Link>

        <Link to="/community" className="flex flex-col items-center p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] mt-1 font-bold">Comunidad</span>
        </Link>

        {/* BOTÓN CENTRAL CREAR - Usamos onClick para abrir el modal */}
        <button onClick={() => setShowFormatModal(true)} className={`-translate-y-6 ${themeBtn} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-slate-900 active:scale-95 transition-all`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>

        <Link to="/my-decks" className="flex flex-col items-center p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" /></svg>
          <span className="text-[10px] mt-1 font-bold">Mis Mazos</span>
        </Link>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="flex flex-col items-center p-2 text-red-500 hover:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-[10px] mt-1 font-bold">Salir</span>
          </button>
        ) : (
          <Link to="/login" className="flex flex-col items-center p-2 text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-1 font-bold">Login</span>
          </Link>
        )}
      </div>

      {/* --- MODAL DE SELECCIÓN DE ERA --- */}
      {showFormatModal && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowFormatModal(false)}>
          <div className="bg-slate-800 border border-slate-600 p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-white mb-8 uppercase italic">¿Qué vas a construir?</h3>
            <div className="grid gap-5">
              <button onClick={() => handleGoToBuilder('imperio')} className="bg-orange-600 hover:bg-orange-500 p-5 rounded-2xl transition-all flex justify-between items-center font-black text-white shadow-lg">
                🏛️ IMPERIO <span className="text-xl">➜</span>
              </button>
              <button onClick={() => handleGoToBuilder('primer_bloque')} className="bg-yellow-600 hover:bg-yellow-500 p-5 rounded-2xl transition-all flex justify-between items-center font-black text-white shadow-lg">
                📜 PRIMER BLOQUE <span className="text-xl">➜</span>
              </button>
            </div>
            <button onClick={() => setShowFormatModal(false)} className="mt-8 text-slate-500 font-bold text-xs uppercase tracking-widest">Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
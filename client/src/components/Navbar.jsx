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

  // Colores dinámicos
  const themeText = isPB ? "text-yellow-500" : isImperio ? "text-orange-500" : "text-blue-400";
  const themeBtn = isPB ? "bg-yellow-600 hover:bg-yellow-500" : "bg-orange-600 hover:bg-orange-500";

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

  const getLinkClass = (path) => 
    location.pathname === path 
      ? `${themeText} font-bold` 
      : "text-slate-400 hover:text-white transition-colors";

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
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 px-10 flex justify-between items-center shadow-xl">
        <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 italic">
          MITOSAPP ⚔️
        </Link>
        
        <div className="hidden md:flex gap-8 items-center font-bold text-xs uppercase tracking-tighter">
          {/* ✅ Corregido: Si no hay prefijo, va a "/" o "/community" global */}
          <Link to={formatPrefix || "/"} className={getLinkClass(formatPrefix || "/")}>Inicio</Link>
          
          <Link 
            to={formatPrefix ? `${formatPrefix}/community` : "/community"} 
            className={getLinkClass(formatPrefix ? `${formatPrefix}/community` : "/community")}
          >
            Comunidad
          </Link>

          <Link to="/my-decks" className={getLinkClass("/my-decks")}>Mis Mazos</Link>
          
          <button onClick={handleCreateClick} className={`${themeBtn} text-white px-5 py-2 rounded-xl transition shadow-lg`}>
            + Crear Mazo
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className={`text-[9px] ${themeText} uppercase font-black`}>{isPB ? 'ILUMINADO' : 'GUERRERO'}</p>
                  <p className="text-sm text-white font-bold">{username}</p>
              </div>
              <button onClick={handleLogout} className="bg-slate-800 p-2 rounded-lg border border-slate-700 hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-slate-400 hover:text-white text-xs font-bold uppercase">Ingresar</Link>
              <Link to="/register" className={`${themeBtn} text-white px-4 py-2 rounded-xl text-xs font-black`}>REGISTRARSE</Link>
            </div>
          )}
        </div>
      </nav>

      {/* MODAL DE FORMATO */}
      {showFormatModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFormatModal(false)}>
            <div className="bg-slate-800 border border-slate-600 p-6 rounded-[32px] shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500`}></div>
                <h3 className="text-2xl font-black text-white mb-6 uppercase italic">Elige tu Destino</h3>
                <div className="grid gap-4">
                    <button onClick={() => handleGoToBuilder('imperio')} className="group bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-orange-500 p-4 rounded-2xl transition-all flex justify-between items-center font-black">
                        🏛️ IMPERIO <span className="text-orange-500">➜</span>
                    </button>
                    <button onClick={() => handleGoToBuilder('primer_bloque')} className="group bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-yellow-500 p-4 rounded-2xl transition-all flex justify-between items-center font-black">
                        📜 PRIMER BLOQUE <span className="text-yellow-500">➜</span>
                    </button>
                </div>
                <button onClick={() => setShowFormatModal(false)} className="mt-6 text-slate-500 text-xs hover:text-white underline font-bold uppercase">Cancelar</button>
            </div>
        </div>
      )}
    </>
  );
}
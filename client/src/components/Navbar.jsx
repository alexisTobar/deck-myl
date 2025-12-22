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
  const isBuilder = location.pathname.includes("builder"); // Detectamos si es el constructor
  const formatPrefix = isImperio ? "/imperio" : isPB ? "/primer-bloque" : "";

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
      {/* --- NAVBAR DESKTOP --- */}
      {/* Si es builder, lo hacemos un poco más pequeño para ganar espacio */}
      <nav className={`${isBuilder ? 'py-2 px-6' : 'py-4 px-10'} hidden md:flex bg-slate-900 border-b border-slate-800 sticky top-0 z-50 justify-between items-center shadow-xl`}>
        <Link to="/" className={`${isBuilder ? 'text-xl' : 'text-2xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 italic`}>
          MITOSAPP ⚔️
        </Link>
        
        <div className="flex gap-8 items-center font-bold text-[10px] uppercase tracking-tighter">
          <Link to="/" className="text-slate-400 hover:text-white">Cambiar Era</Link>
          <Link to={formatPrefix || "/"} className={location.pathname === (formatPrefix || "/") ? themeColor : "text-slate-400 hover:text-white"}>Home Era</Link>
          <Link to="/community" className="text-slate-400 hover:text-white">Comunidad</Link>
          <Link to="/my-decks" className="text-slate-400 hover:text-white">Mis Mazos</Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-[10px]">{username}</span>
              <button onClick={handleLogout} className="text-red-500 text-[10px] font-black hover:underline">SALIR</button>
            </div>
          ) : (
            <Link to="/login" className={`${themeBtn} text-white px-4 py-1.5 rounded-lg text-[10px] font-black`}>INGRESAR</Link>
          )}
        </div>
      </nav>

      {/* --- DOCK MÓVIL --- */}
      {/* El Dock móvil solo se muestra si NO estamos en el builder para no tapar los controles de cartas */}
      {!isBuilder && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex justify-around items-center z-[100] pb-6 shadow-2xl text-white">
          <Link to="/" className="flex flex-col items-center p-2 text-slate-400"><span className="text-[10px] font-bold">Portal</span></Link>
          <Link to="/community" className="flex flex-col items-center p-2 text-slate-400"><span className="text-[10px] font-bold">Comunidad</span></Link>
          <button onClick={() => setShowFormatModal(true)} className={`-translate-y-6 ${themeBtn} w-14 h-14 rounded-full flex items-center justify-center text-white border-4 border-slate-900 shadow-2xl`}>+</button>
          <Link to="/my-decks" className="flex flex-col items-center p-2 text-slate-400"><span className="text-[10px] font-bold">Mazos</span></Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="p-2 text-red-500 font-bold text-[10px]">Salir</button>
          ) : (
            <Link to="/login" className="p-2 text-blue-400 font-bold text-[10px]">Login</Link>
          )}
        </div>
      )}

      {/* Modal de selección de Era se mantiene igual... */}
    </>
  );
}
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFormatModal, setShowFormatModal] = useState(false);
  
  // Estados de sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Detectar cambios de sesión y tamaño de pantalla
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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    
    // Escuchar cambios en el storage (por si loguea en otra pestaña)
    window.addEventListener("storage", checkSession);

    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("storage", checkSession);
    };
  }, [location]); // Re-chequea cada vez que cambia la ruta

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const hideMobileNav = location.pathname === "/builder"; 

  const getLinkClass = (path) => 
    location.pathname === path 
      ? "text-orange-500 font-bold" 
      : "text-slate-400 hover:text-white transition-colors";

  const handleGoToBuilder = (selectedFormat) => {
    setShowFormatModal(false);
    navigate("/builder", { state: { selectedFormat } });
  };

  // --- COMPONENTE: MODAL DE SELECCIÓN DE FORMATO ---
  const FormatModal = () => {
    if (!showFormatModal) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowFormatModal(false)}>
            <div className="bg-slate-800 border border-slate-600 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
                <h3 className="text-2xl font-black text-white mb-6">Elige tu Camino</h3>
                <div className="grid gap-4">
                    <button onClick={() => handleGoToBuilder('imperio')} className="group relative bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-orange-500 p-4 rounded-xl transition-all">
                        <div className="flex items-center justify-between"><span className="font-bold text-white text-lg">🏛️ IMPERIO</span><span className="text-orange-500">➜</span></div>
                    </button>
                    <button onClick={() => handleGoToBuilder('primer_bloque')} className="group relative bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-yellow-500 p-4 rounded-xl transition-all">
                        <div className="flex items-center justify-between"><span className="font-bold text-white text-lg">📜 PRIMER BLOQUE</span><span className="text-yellow-500">➜</span></div>
                    </button>
                </div>
                <button onClick={() => setShowFormatModal(false)} className="mt-6 text-slate-500 text-sm hover:text-white underline">Cancelar</button>
            </div>
        </div>
    );
  };

  // --- COMPONENTE: BARRA SUPERIOR (PC) ---
  const DesktopNav = () => (
    <nav className="hidden md:flex bg-slate-900 border-b border-slate-800 p-4 justify-between items-center sticky top-0 z-50 px-10">
      <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
        MitosApp ⚔️
      </Link>
      
      <div className="flex gap-8 items-center font-medium">
        <Link to="/" className={getLinkClass("/")}>Inicio</Link>
        <Link to="/community" className={getLinkClass("/community")}>Comunidad</Link>
        <Link to="/my-decks" className={getLinkClass("/my-decks")}>Mis Mazos</Link>
        <button onClick={() => setShowFormatModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-orange-900/20">
          + Crear Mazo
        </button>
      </div>

      {/* SECCIÓN DE USUARIO EN PC */}
      <div className="flex items-center gap-4 border-l border-slate-700 pl-8">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Guerrero</p>
                <p className="text-sm text-white font-bold">{username}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 p-2 rounded-lg border border-slate-700 transition-all"
                title="Cerrar Sesión"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-bold">Ingresar</Link>
            <Link to="/register" className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 hover:text-white transition-all">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );

  // --- COMPONENTE: BARRA INFERIOR (MÓVIL) ---
  const MobileNav = () => {
    if (hideMobileNav) return null; 

    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center py-3 z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        <Link to="/" className={`flex flex-col items-center gap-1 ${getLinkClass("/")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px]">Inicio</span>
        </Link>
        <Link to="/community" className={`flex flex-col items-center gap-1 ${getLinkClass("/community")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px]">Comunidad</span>
        </Link>

        {/* BOTÓN CENTRAL BUILDER */}
        <button onClick={() => setShowFormatModal(true)} className="relative -top-5 bg-gradient-to-r from-orange-600 to-red-600 w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>

        <Link to="/my-decks" className={`flex flex-col items-center gap-1 ${getLinkClass("/my-decks")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="text-[10px]">Mis Mazos</span>
        </Link>
        <Link to="/login" className={`flex flex-col items-center gap-1 ${getLinkClass("/login")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px]">{isLoggedIn ? "Perfil" : "Login"}</span>
        </Link>
      </div>
    );
  };

  return (
    <>
      <DesktopNav />
      <MobileNav />
      <FormatModal />
    </>
  );
}
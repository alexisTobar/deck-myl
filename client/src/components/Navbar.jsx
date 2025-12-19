import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ocultar la barra inferior si estamos dentro del Constructor (para que no tape los controles del mazo)
  // Si prefieres verla siempre, borra esta línea.
  const hideMobileNav = location.pathname === "/builder"; 

  // Clases para enlaces activos
  const getLinkClass = (path) => 
    location.pathname === path 
      ? "text-orange-500 font-bold" 
      : "text-slate-400 hover:text-white";

  // --- COMPONENTE: BARRA SUPERIOR (PC) ---
  const DesktopNav = () => (
    <nav className="hidden md:flex bg-slate-900 border-b border-slate-800 p-4 justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
        MitosApp ⚔️
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/" className={getLinkClass("/")}>Inicio</Link>
        <Link to="/community" className={getLinkClass("/community")}>Comunidad</Link>
        <Link to="/my-decks" className={getLinkClass("/my-decks")}>Mis Mazos</Link>
        <Link to="/builder" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition">
          + Crear Mazo
        </Link>
      </div>
    </nav>
  );

  // --- COMPONENTE: BARRA INFERIOR (MÓVIL) ---
  const MobileNav = () => {
    if (hideMobileNav) return null; // No mostrar en el Builder para ganar espacio

    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center py-3 z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        
        <Link to="/" className={`flex flex-col items-center gap-1 ${getLinkClass("/")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px]">Inicio</span>
        </Link>

        {/* --- AQUÍ ESTÁ EL BOTÓN DE COMUNIDAD QUE FALTABA --- */}
        <Link to="/community" className={`flex flex-col items-center gap-1 ${getLinkClass("/community")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px]">Comunidad</span>
        </Link>

        {/* BOTÓN CENTRAL DESTACADO (BUILDER) */}
        <Link to="/builder" className="relative -top-5 bg-gradient-to-r from-orange-600 to-red-600 w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </Link>

        <Link to="/my-decks" className={`flex flex-col items-center gap-1 ${getLinkClass("/my-decks")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="text-[10px]">Mis Mazos</span>
        </Link>

        <Link to="/login" className={`flex flex-col items-center gap-1 ${getLinkClass("/login")}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px]">Perfil</span>
        </Link>
      </div>
    );
  };

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}
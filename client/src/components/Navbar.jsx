import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Users, Layers, Settings, Hammer, Lock, LogOut, User, LogIn, Star } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const isBuilder = location.pathname.includes("builder");
  
  const themeColor = isPB ? "text-yellow-400" : isImperio ? "text-orange-500" : "text-blue-400";
  const themeBtn = isPB ? "bg-gradient-to-r from-yellow-600 to-yellow-500" : "bg-gradient-to-r from-orange-600 to-orange-500";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user.username || "Invocador");
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <nav className={`sticky top-0 z-[100] w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${isBuilder ? 'py-1' : 'py-2'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center">
          
          <Link to="/" className="group flex items-center py-1">
            <img 
              src="https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png" 
              alt="MitosApp Logo" 
              className="h-12 md:h-16 lg:h-20 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
            <NavLink to="/" label="Portal" icon={<Home size={16} />} />
            <NavLink to="/community" label="Comunidad" icon={<Users size={16} />} />
            <NavLink to="/my-decks" label="Mis Mazos" icon={<Layers size={16} />} />
            
            {isLoggedIn && username === "Juegos Vikingos" && (
                <NavLink to="/admin/cards" label="Admin" icon={<Settings size={16} />} />
            )}
            
            {/* BOTÓN CONSTRUIR MAZO DINÁMICO */}
            {(isImperio || isPB) && (
              <button 
                onClick={() => isPB ? navigate("/primer-bloque") : navigate("/imperio/builder")}
                className={`ml-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white shadow-xl hover:scale-105 transition-all ${themeBtn} flex items-center gap-2`}
              >
                <Hammer size={14} strokeWidth={3} /> {isPB ? "Cambiar Edición" : "Construir Mazo"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <Link to="/login" className="px-6 py-2 rounded-xl bg-white text-black text-xs font-black uppercase hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-2">
                <LogIn size={14} strokeWidth={3} /> Ingresar
              </Link>
            ) : (
              <button onClick={handleLogout} className="bg-slate-900 border border-white/5 p-2 rounded-xl text-slate-500 hover:text-red-500 transition-all">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* DOCK MÓVIL REPARADO */}
      {!isBuilder && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-2xl flex justify-around items-center">
            <MobileIcon to="/" icon={<Home size={22} />} label="Portal" active={location.pathname === "/"} />
            
            {(isImperio || isPB) ? (
              <button 
                onClick={() => isPB ? navigate("/primer-bloque") : navigate("/imperio/builder")}
                className={`-translate-y-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-slate-950 active:scale-90 transition-all ${themeBtn}`}
              >
                <Hammer size={24} strokeWidth={2.5} />
              </button>
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 border-4 border-slate-950 -translate-y-6">
                <Lock size={20} />
              </div>
            )}

            <MobileIcon to="/my-decks" icon={<Layers size={22} />} label="Mis Mazos" active={location.pathname === "/my-decks"} />
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-200'}`}>
      {icon} {label}
    </Link>
  );
}

function MobileIcon({ to, icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 p-2">
      <div className={`transition-all ${active ? 'scale-110 text-yellow-500' : 'text-slate-500'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase ${active ? 'text-yellow-500' : 'text-slate-500'}`}>{label}</span>
    </Link>
  );
}
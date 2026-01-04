import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
    Home, Users, Layers, Settings, Hammer, Lock, LogOut, User, LogIn, X, Star, Moon, Sun, ShoppingCart 
} from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/espada_sagrada.png" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/helenica.png" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/hijos_de_daana.png" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-orange-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/dominios_de_ra.png" }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showPBModal, setShowPBModal] = useState(false); 

  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const isBuilder = location.pathname.includes("builder");

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return false; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

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

  const handleBuildClick = () => {
    if (isPB) setShowPBModal(true);
    else navigate("/imperio/builder");
  };

  const selectEdition = (id) => {
    setShowPBModal(false);
    navigate("/primer-bloque/builder", { state: { initialEdition: id } });
  };

  const themeColor = "text-blue-400"; 
  const themeBtn = "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20";

  return (
    <>
      <nav className={`sticky top-0 z-[100] w-full border-b border-white/10 bg-slate-950/95 backdrop-blur-md transition-all duration-300 ${isBuilder ? 'py-1' : 'py-3'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center">
          
          <Link to="/" className="group flex items-center transition-transform hover:scale-105 active:scale-95 py-1">
            <img 
              src="https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/refs/heads/main/forja.png" 
              alt="ForjaDeck Logo" 
              className="h-14 md:h-20 w-auto object-contain brightness-110" 
            />
          </Link>

          {/* NAVEGACIÓN WEB (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <NavLink to="/" label="Portal" icon={<Home size={16} />} />
            <NavLink to="/community" label="Comunidad" icon={<Users size={16} />} />
            <NavLink to="/my-decks" label="Mis Mazos" icon={<Layers size={16} />} />
            <NavLink to="/marketplace" label="Mercado" icon={<ShoppingCart size={16} />} />
            
            {isLoggedIn && username === "Juegos Vikingos" && (
                <NavLink to="/admin/cards" label="Admin" icon={<Settings size={16} />} />
            )}
            
            {(isImperio || isPB) && (
              <button 
                onClick={handleBuildClick}
                className={`ml-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${themeBtn} flex items-center gap-2`}
              >
                <Hammer size={14} /> Construir Mazo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDark(prev => !prev)} 
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
            >
               {isDark ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex flex-col items-end leading-tight pr-3 border-r border-white/10">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Invocador</span>
                  <span className={`text-sm font-black uppercase italic ${themeColor}`}>{username}</span>
                </div>
                {/* LOGIN/LOGOUT EN MÓVIL TAMBIÉN ARRIBA */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 p-2.5 rounded-xl transition-all text-slate-400 hover:text-red-500 border border-white/10"
                >
                  <LogOut className="w-5 h-5 md:w-5 md:h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 md:px-6 py-2.5 rounded-xl bg-white text-slate-950 text-[10px] md:text-[11px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-md flex items-center gap-2">
                <LogIn size={14} /> <span className="hidden xs:inline">Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL PB */}
      {showPBModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-10 relative shadow-2xl overflow-hidden">
                <button onClick={() => setShowPBModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-50">
                    <X size={28} />
                </button>
                <div className="text-center mb-10">
                    <Star className="mx-auto text-blue-400 mb-3" fill="currentColor" size={32} />
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Construir Mazo PB</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MAIN_EDITIONS.map((ed) => (
                        <button key={ed.id} onClick={() => selectEdition(ed.id)} className="relative group h-32 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500 transition-all shadow-sm">
                            <img src={ed.img} alt={ed.label} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-all" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} opacity-40 mix-blend-multiply`}></div>
                            <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl text-white">{ed.label}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* NAV MÓVIL MEJORADO CON MARKETPLACE */}
      {!isBuilder && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[440px]">
          <div className="bg-slate-950/95 border border-white/10 p-2 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center px-4">
            
            <MobileIcon to="/" icon={<Home size={20} />} label="Portal" active={location.pathname === "/"} />
            
            <MobileIcon to="/community" icon={<Users size={20} />} label="Arena" active={location.pathname.includes("community")} />
            
            {/* BOTÓN CENTRAL DINÁMICO */}
            <div className="relative -translate-y-4">
                {(isImperio || isPB) ? (
                <button 
                    onClick={handleBuildClick}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)] border-4 border-slate-950 transition-all active:scale-90 bg-blue-600"
                >
                    <Hammer size={28} />
                </button>
                ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border-4 border-slate-950">
                    <Lock size={22} />
                </div>
                )}
            </div>

            <MobileIcon to="/marketplace" icon={<ShoppingCart size={20} />} label="Mercado" active={location.pathname.includes("marketplace")} />
            
            <MobileIcon to="/my-decks" icon={<Layers size={20} />} label="Mazos" active={location.pathname === "/my-decks"} />

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
    <Link to={to} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </Link>
  );
}

function MobileIcon({ to, icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 p-2 transition-all">
      <div className={`transition-all duration-300 ${active ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>
        {icon}
      </div>
      <span className={`text-[7px] font-black uppercase tracking-wider ${active ? 'text-blue-400' : 'text-slate-500'}`}>
        {label}
      </span>
    </Link>
  );
}
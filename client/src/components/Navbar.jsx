import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Importación de iconos minimalistas
import { 
  Home, 
  Users, 
  Layers, 
  Settings, 
  Hammer, 
  Lock, 
  LogOut, 
  User, 
  LogIn,
  X,
  Star
} from "lucide-react";

// ✅ Configuración de ediciones para el modal del Navbar
const MAIN_EDITIONS = [
    { 
        id: "espada_sagrada", 
        label: "Espada Sagrada", 
        color: "from-blue-600 to-blue-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/espada_sagrada.png" 
    },
    { 
        id: "helenica", 
        label: "Helénica", 
        color: "from-red-600 to-red-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/helenica.png" 
    },
    { 
        id: "hijos_de_daana", 
        label: "Hijos de Daana", 
        color: "from-green-600 to-green-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/hijos_de_daana.png" 
    },
    { 
        id: "dominios_de_ra", 
        label: "Dominios de Ra", 
        color: "from-yellow-600 to-orange-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/dominios_de_ra.png" 
    }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showPBModal, setShowPBModal] = useState(false); // ✅ Control del modal interno

  const isImperio = location.pathname.includes("/imperio");
  const isPB = location.pathname.includes("/primer-bloque");
  const isBuilder = location.pathname.includes("builder");
  const formatPrefix = isImperio ? "/imperio" : isPB ? "/primer-bloque" : "";

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

  // ✅ Función para manejar el click en Construir Mazo
  const handleBuildClick = () => {
    if (isPB) {
      setShowPBModal(true); // Si es PB, abrimos el modal interno
    } else {
      navigate("/imperio/builder"); // Si es Imperio, va directo
    }
  };

  const selectEdition = (id) => {
    setShowPBModal(false);
    navigate("/primer-bloque/builder", { state: { initialEdition: id } });
  };

  return (
    <>
      {/* --- NAVBAR PRINCIPAL --- */}
      <nav className={`sticky top-0 z-[100] w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${isBuilder ? 'py-1' : 'py-2'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 flex justify-between items-center">
          
          <Link to="/" className="group flex items-center transition-transform hover:scale-105 active:scale-95 py-1">
            <img 
              src="https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png" 
              alt="MitosApp Logo" 
              className="h-12 md:h-16 lg:h-20 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
            />
          </Link>

          {/* MENÚ CENTRAL (ESCRITORIO) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
            <NavLink to="/" label="Portal" icon={<Home size={16} />} />
            <NavLink to="/community" label="Comunidad" icon={<Users size={16} />} />
            <NavLink to="/my-decks" label="Mis Mazos" icon={<Layers size={16} />} />
            
            {isLoggedIn && username === "Juegos Vikingos" && (
                <NavLink to="/admin/cards" label="Admin" icon={<Settings size={16} />} />
            )}
            
            {(isImperio || isPB) && (
              <button 
                onClick={handleBuildClick}
                className={`ml-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white shadow-xl hover:scale-105 active:scale-95 transition-all ${themeBtn} flex items-center gap-2`}
              >
                <Hammer size={14} strokeWidth={3} /> Construir Mazo
              </button>
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
                  <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2 rounded-xl bg-white text-black text-xs font-black uppercase hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-2">
                <LogIn size={14} strokeWidth={3} /> Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- MODAL INTERNO PARA PB (SE ACTIVA DESDE NAVBAR) --- */}
      {showPBModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-2xl rounded-[2.5rem] p-8 relative shadow-2xl overflow-hidden">
                <button onClick={() => setShowPBModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-50">
                    <X size={24} />
                </button>
                
                <div className="text-center mb-8">
                    <Star className="mx-auto text-yellow-500 mb-2" fill="currentColor" />
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Construir Mazo PB</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Selecciona una edición principal para comenzar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MAIN_EDITIONS.map((ed) => (
                        <button
                            key={ed.id}
                            onClick={() => selectEdition(ed.id)}
                            className={`relative group h-32 rounded-2xl overflow-hidden border-2 border-white/5 hover:border-yellow-500 transition-all active:scale-95 shadow-xl`}
                        >
                            <img src={ed.img} alt={ed.label} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} mix-blend-multiply opacity-50`}></div>
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative h-full flex items-center justify-center">
                                <span className="text-xl font-black uppercase italic tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{ed.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- DOCK MÓVIL --- */}
      {!isBuilder && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-around items-center">
            <MobileIcon to="/" icon={<Home size={22} />} label="Inicio" active={location.pathname === "/"} />
            <MobileIcon to="/community" icon={<Users size={22} />} label="Comunidad" active={location.pathname.includes("community")} />
            
            {(isImperio || isPB) ? (
              <button 
                onClick={handleBuildClick}
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
            {isLoggedIn ? (
               <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 transition-all active:scale-90">
                  <LogOut size={22} className="text-slate-400" />
                  <span className="text-[9px] font-black uppercase text-red-500">Salir</span>
               </button>
            ) : (
               <MobileIcon to="/login" icon={<User size={22} />} label="Login" active={location.pathname === "/login"} />
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
      {icon} {label}
    </Link>
  );
}

function MobileIcon({ to, icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 p-2">
      <div className={`transition-all ${active ? 'scale-110 text-orange-500' : 'text-slate-500 grayscale'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-orange-500' : 'text-slate-500'}`}>{label}</span>
    </Link>
  );
}
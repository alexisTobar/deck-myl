import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md backdrop-blur-md bg-opacity-90">
            {/* LOGO PRINCIPAL */}
            <Link to="/" className="hover:scale-105 transition-transform duration-200 flex items-center">
                <Logo className="h-16 md:h-18 w-auto drop-shadow-lg" showText={false} />
            </Link>

            <div className="flex items-center gap-6">

                {/* --- SECCIÓN DE ENLACES (NUEVA RUTA AÑADIDA) --- */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                    <Link to="/" className="hover:text-orange-400 transition">Inicio</Link>
                    
                    {/* Botón de Comunidad Destacado */}
                    <Link to="/community" className="flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-3 py-1.5 rounded-full font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                        🌍 Comunidad
                    </Link>

                    <Link to="/builder" className="hover:text-orange-400 transition">Constructor</Link>
                </div>

                {/* ZONA DE USUARIO */}
                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                    {token ? (
                        <>
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Gladiador</span>
                                <span className="text-sm font-bold text-white leading-none">{user?.username || "Usuario"}</span>
                            </div>

                            <Link
                                to="/my-decks"
                                className="text-slate-300 hover:text-white font-bold text-sm transition hover:bg-slate-800 px-3 py-2 rounded flex items-center gap-2"
                            >
                                📂 <span className="hidden lg:inline">Mis Mazos</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded shadow transition"
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-300 hover:text-white font-bold text-sm transition px-2">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded shadow transition">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
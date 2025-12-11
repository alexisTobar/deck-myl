import { Link, useNavigate } from "react-router-dom";

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
        <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
            {/* LOGO QUE LLEVA AL INICIO */}
            <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 hover:opacity-80 transition">
                Deck-MyL 🛡️
            </Link>

            <div className="flex items-center gap-6">

                {/* ENLACES PÚBLICOS DEL MENÚ */}
                <div className="hidden md:flex gap-4 text-sm font-medium text-slate-300">
                    <Link to="/" className="hover:text-orange-400 transition">Inicio</Link>
                    {/* El constructor ahora es una sección aparte */}
                    <Link to="/builder" className="hover:text-orange-400 transition">Constructor</Link>
                </div>

                {/* ZONA DE USUARIO */}
                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                    {token ? (
                        <>
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-xs text-slate-400">Gladiador</span>
                                <span className="text-sm font-bold text-white">{user?.username || "Usuario"}</span>
                            </div>

                            <Link
                                to="/my-decks"
                                className="text-slate-300 hover:text-white font-bold text-sm transition hover:bg-slate-800 px-3 py-2 rounded"
                            >
                                📂 Mis Mazos
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
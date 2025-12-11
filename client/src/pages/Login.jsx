import { useState } from "react";
import { Link } from "react-router-dom";
// 1. IMPORTAR LA VARIABLE DE CONFIGURACIÓN
import BACKEND_URL from "../config"; 

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // 2. USAR LA VARIABLE EN LUGAR DE LOCALHOST
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "/";
            } else { setError(data.error || "Credenciales incorrectas"); }
        } catch (err) { setError("Error de conexión"); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
            <div className="absolute w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -bottom-20 -right-20"></div>

            <div className="bg-slate-800/80 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 backdrop-blur-xl relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2">Deck-MyL</h1>
                    <p className="text-slate-400 text-sm">Ingresa a tu cuenta de Gladiador</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-200 p-3 rounded-lg mb-6 text-sm text-center border border-red-500/30 flex items-center justify-center gap-2 animate-bounce">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                        <input type="email" required placeholder="tu@correo.com" className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition text-white placeholder-slate-600" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
                        <input type="password" required placeholder="••••••••" className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition text-white placeholder-slate-600" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition transform hover:-translate-y-1 flex justify-center items-center">
                        {loading ? <span className="animate-spin">⏳</span> : "Iniciar Sesión"}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-2">¿Nuevo en el reino?</p>
                    <Link to="/register" className="text-orange-400 hover:text-orange-300 font-bold hover:underline transition">Crear cuenta gratis</Link>
                </div>
            </div>
        </div>
    );
}

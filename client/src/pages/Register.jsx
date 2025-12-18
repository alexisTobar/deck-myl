import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google'; // IMPORTAR
import BACKEND_URL from "../config"; 

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");

    // --- MANEJO GOOGLE (Redirige al Login para completar perfil si es nuevo) ---
    // Esto es un truco inteligente: Si se registran con Google aquí, 
    // hacemos lo mismo que en Login.
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();

            if (data.isNew) {
                // Si es nuevo, lo mandamos al Login pero con un estado para que complete perfil
                // O simplemente le decimos que vaya al login para terminar.
                // Para simplificar, si usan Google en registro y son nuevos,
                // guardamos datos temporales o redirigimos.
                alert("Cuenta de Google detectada. Por favor completa tu perfil en la pantalla de Login.");
                navigate("/login"); 
            } else {
                localStorage.setItem('token', data.token);
                navigate("/");
            }
        } catch (error) {
            console.error("Error Google", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert("¡Registro exitoso! Ahora inicia sesión.");
                navigate("/login");
            } else {
                setError(data.error || "Error al registrarse");
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
             {/* Reutilizamos tus fondos animados */}
             <div className="absolute w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>

            <div className="bg-slate-800/80 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 backdrop-blur-xl relative z-10">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6">Crear Cuenta</h2>

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm text-center border border-red-500/50">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Usuario</label>
                        <input
                            type="text" required
                            className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 focus:outline-none text-white"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                        <input
                            type="email" required
                            className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 focus:outline-none text-white"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
                        <input
                            type="password" required
                            className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 focus:outline-none text-white"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition shadow-lg mt-4">
                        Registrarse
                    </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 text-xs uppercase tracking-widest">O</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                </div>

                {/* BOTÓN GOOGLE */}
                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Register Failed')}
                        theme="filled_black"
                        shape="pill"
                        text="signup_with"
                        width="300"
                    />
                </div>

                <p className="text-center text-slate-400 text-sm">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-orange-400 hover:underline font-bold">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google'; 
import BACKEND_URL from "../config"; 

export default function Login() {
    const navigate = useNavigate();

    // --- ESTADOS LOGIN NORMAL ---
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // --- ESTADOS GOOGLE ---
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [googleData, setGoogleData] = useState(null); 
    // 1. Agregamos 'cl' al estado inicial
    const [profileData, setProfileData] = useState({ username: '', age: '', cl: '' });

    // MANEJO RESPUESTA DE GOOGLE (Paso 1)
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();

            if (data.isNew) {
                setGoogleData({ email: data.email, googleId: data.googleId });
                setShowCompleteProfile(true);
                setLoading(false);
            } else {
                localStorage.setItem('token', data.token);
                if(data.user) localStorage.setItem('user', JSON.stringify(data.user));
                navigate("/"); 
            }
        } catch (error) {
            console.error("Error Google Login", error);
            setError("Error al conectar con Google");
            setLoading(false);
        }
    };

    // COMPLETAR PERFIL (Paso 2 - Incluye CL)
    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Limpiar errores previos

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: googleData.email, 
                    googleId: googleData.googleId,
                    username: profileData.username,
                    age: profileData.age,
                    cl: profileData.cl // <--- 2. Enviamos el CL
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                navigate("/");
            } else {
                // Aquí mostramos el mensaje exacto que nos da el servidor
                setError(data.msg || "Error al registrar.");
            }
        } catch (error) { 
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    // LOGIN MANUAL (Sin cambios)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
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
                    <p className="text-slate-400 text-sm">
                        {showCompleteProfile ? "¡Casi listo, Gladiador!" : "Ingresa a tu cuenta"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-200 p-3 rounded-lg mb-6 text-sm text-center border border-red-500/30 flex items-center justify-center gap-2 animate-bounce">
                        ⚠️ {error}
                    </div>
                )}

                {!showCompleteProfile ? (
                    /* --- LOGIN NORMAL --- */
                    <>
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
                        
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-700 flex-1"></div>
                            <span className="text-slate-500 text-xs uppercase tracking-widest">O continúa con</span>
                            <div className="h-px bg-slate-700 flex-1"></div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} theme="filled_black" shape="pill" text="continue_with" width="300" />
                        </div>

                        <div className="mt-8 text-center pt-6 border-t border-slate-700/50">
                            <p className="text-slate-400 text-sm mb-2">¿Nuevo en el reino?</p>
                            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-bold hover:underline transition">Crear cuenta gratis</Link>
                        </div>
                    </>
                ) : (
                    /* --- FORMULARIO COMPLETAR PERFIL (CON CL) --- */
                    <form onSubmit={handleCompleteProfile} className="space-y-4 animate-fade-in">
                        <p className="text-slate-400 text-center text-sm mb-4">Elige tu nombre de batalla.</p>
                        
                        {/* Nickname */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Usuario (Nick)</label>
                            <input 
                                type="text" required placeholder="Ej: MagoOscuro99" 
                                className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 text-white" 
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} 
                            />
                        </div>

                        {/* Edad y CL en la misma fila */}
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Edad</label>
                                <input 
                                    type="number" required placeholder="25" min="10" max="99"
                                    className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 text-white" 
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })} 
                                />
                            </div>
                            <div className="w-2/3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CL / Ciudad</label>
                                <input 
                                    type="text" required placeholder="Ej: Santiago" 
                                    className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-600 focus:border-orange-500 text-white" 
                                    value={profileData.cl}
                                    onChange={(e) => setProfileData({ ...profileData, cl: e.target.value })} 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition mt-4">
                            {loading ? "Registrando..." : "Completar Registro 🚀"}
                        </button>
                        
                        <button type="button" onClick={() => setShowCompleteProfile(false)} className="w-full text-slate-400 hover:text-white text-sm mt-2">
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
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
        setError(""); 

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: googleData.email, 
                    googleId: googleData.googleId,
                    username: profileData.username,
                    age: profileData.age,
                    cl: profileData.cl 
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                navigate("/");
            } else {
                setError(data.msg || "Error al registrar.");
            }
        } catch (error) { 
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    // LOGIN MANUAL
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
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900 relative overflow-hidden font-sans transition-colors duration-500">
            {/* Fondo Decorativo */}
            <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl -bottom-20 -right-20"></div>

            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 backdrop-blur-xl relative z-10 animate-fade-in">
                
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-orange-400 dark:to-red-600 mb-2 uppercase italic tracking-tighter">Forja-Deck</h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">
                        {showCompleteProfile ? "¡Casi listo, Gladiador!" : "Acceso a la Forja"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-600 dark:text-red-200 p-3 rounded-xl mb-6 text-[10px] font-black uppercase text-center border border-red-500/30 flex items-center justify-center gap-2 animate-bounce">
                        ⚠️ {error}
                    </div>
                )}

                {!showCompleteProfile ? (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Correo Electrónico</label>
                                <input 
                                    type="email" required placeholder="TU@EMAIL.COM" 
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 focus:border-blue-600 dark:focus:border-orange-500 transition-all text-slate-900 dark:text-white font-bold text-sm" 
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contraseña</label>
                                    
                                    {/* ✅ ENLACE DE RECUPERACIÓN AÑADIDO */}
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-[9px] font-black text-blue-600 dark:text-orange-400 uppercase tracking-widest hover:underline italic"
                                    >
                                        ¿La olvidaste?
                                    </Link>
                                </div>
                                <input 
                                    type="password" required placeholder="••••••••" 
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 focus:border-blue-600 dark:focus:border-orange-500 transition-all text-slate-900 dark:text-white font-bold text-sm" 
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 dark:bg-gradient-to-r dark:from-orange-600 dark:to-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 dark:shadow-orange-900/20 transition-all transform active:scale-95 flex justify-center items-center uppercase tracking-widest italic text-sm">
                                {loading ? "Procesando..." : "Ingresar"}
                            </button>
                        </form>
                        
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">O</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        </div>

                        <div className="flex justify-center scale-90 md:scale-100">
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} theme="filled_blue" shape="pill" text="continue_with" />
                        </div>

                        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <p className="text-slate-400 text-[10px] font-black uppercase mb-2 tracking-widest">¿Nuevo Invocador?</p>
                            <Link to="/register" className="text-blue-600 dark:text-orange-400 font-black uppercase text-xs hover:underline transition italic tracking-tighter">Crear Cuenta de Batalla</Link>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleCompleteProfile} className="space-y-4 animate-fade-in">
                        <p className="text-slate-400 text-center text-[10px] font-black uppercase tracking-widest mb-4">Finaliza tu perfil de gladiador</p>
                        
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nickname</label>
                            <input 
                                type="text" required placeholder="MAGO_OSCURO" 
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold uppercase text-sm" 
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} 
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Edad</label>
                                <input 
                                    type="number" required placeholder="25" min="10" max="99"
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-sm" 
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })} 
                                />
                            </div>
                            <div className="w-2/3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Código (CL)</label>
                                <input 
                                    type="text" required placeholder="CL000" 
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold uppercase text-sm" 
                                    value={profileData.cl}
                                    onChange={(e) => setProfileData({ ...profileData, cl: e.target.value })} 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-blue-600 dark:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-4 uppercase tracking-widest text-sm italic">
                            {loading ? "Registrando..." : "Completar Forja"}
                        </button>
                        
                        <button type="button" onClick={() => setShowCompleteProfile(false)} className="w-full text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 transition-colors">
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
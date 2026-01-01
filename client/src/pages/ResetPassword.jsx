import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
import { Lock, Save, ShieldAlert, CheckCircle } from "lucide-react";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) return setError("MÍNIMO 6 CARACTERES");
        if (password !== confirmPassword) return setError("LAS CLAVES NO COINCIDEN");
        
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError("EL ENLACE EXPIRO O ES INVÁLIDO");
            }
        } catch (err) { setError("ERROR DE CONEXIÓN"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-6 transition-colors duration-500">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-10 shadow-2xl">
                {!success ? (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg"><Lock className="text-white" size={20}/></div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Cambio de <span className="text-blue-600">Clave</span></h2>
                        </div>
                        
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 border-l-4 border-blue-600 pl-4 italic">Establece tu nueva contraseña para ingresar.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="password" required placeholder="NUEVA CONTRASEÑA" 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold uppercase text-sm text-slate-900 dark:text-white"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <input 
                                type="password" required placeholder="REPETIR CONTRASEÑA" 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-blue-600 font-bold uppercase text-sm text-slate-900 dark:text-white"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            {error && (
                                <div className="bg-red-500/10 p-3 rounded-xl flex items-center gap-2 text-red-500 text-[9px] font-black uppercase border border-red-500/20">
                                    <ShieldAlert size={14}/> {error}
                                </div>
                            )}
                            
                            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 italic">
                                {loading ? "Actualizando Forja..." : <><Save size={18}/> Actualizar Clave</>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-2">¡Completado!</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tu clave ha sido actualizada. Redirigiendo...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
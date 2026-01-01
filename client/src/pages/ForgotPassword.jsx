import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BACKEND_URL from "../config";
import { Mail, ArrowLeft, Send, ShieldCheck, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase() })
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
            } else {
                setError(data.msg || "Error al procesar solicitud");
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-6 transition-colors duration-500">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-10 shadow-2xl">
                {!sent ? (
                    <>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2">Recuperar <span className="text-blue-600">Acceso</span></h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 italic text-center">Te enviaremos un correo para establecer una contraseña manual.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="email" required placeholder="TU CORREO REGISTRADO" 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm uppercase"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                    <AlertCircle size={16} />
                                    <p className="text-[10px] font-black uppercase italic">{error}</p>
                                </div>
                            )}
                            
                            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 italic">
                                {loading ? "Buscando Invocador..." : <><Send size={18}/> Enviar Enlace</>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><ShieldCheck size={40} /></div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2 italic">Enlace Enviado</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-8">Revisa tu correo para realizar el cambio de contraseña.</p>
                        <button onClick={() => setSent(false)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">¿No recibiste nada? Reintentar</button>
                    </div>
                )}
                
                <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest italic">
                    <ArrowLeft size={14}/> Volver al login
                </Link>
            </div>
        </div>
    );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import BACKEND_URL from "../config"; 
import Swal from "sweetalert2"; // ✅ Importamos SweetAlert2

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");

    const swalConfig = {
        background: '#1e293b',
        color: '#f1f5f9',
        confirmButtonColor: '#ea580c',
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();

            if (data.isNew) {
                Swal.fire({
                    icon: 'info',
                    title: '¡Buena po!',
                    text: 'Cachamos tu cuenta de Google. Ahora completa tu perfil en el Login para terminar.',
                    ...swalConfig
                });
                navigate("/login"); 
            } else {
                localStorage.setItem('token', data.token);
                Swal.fire({
                    icon: 'success',
                    title: '¡Wena!',
                    text: 'Entrando directo al Deck-MyL.',
                    timer: 1500,
                    showConfirmButton: false,
                    ...swalConfig
                });
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
                Swal.fire({
                    icon: 'success',
                    title: '¡Bacán!',
                    text: 'Te registraste de pana. Ahora inicia sesión.',
                    ...swalConfig
                });
                navigate("/login");
            } else {
                setError(data.error || "Error al registrarse");
                Swal.fire({
                    icon: 'error',
                    title: 'Chuta, algo falló',
                    text: data.error || 'Revisa que los datos estén bien puestos.',
                    ...swalConfig
                });
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'El servidor está durmiendo parece, intenta de nuevo.',
                ...swalConfig
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
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
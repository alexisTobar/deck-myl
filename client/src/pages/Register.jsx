import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 1. IMPORTAMOS LA VARIABLE INTELIGENTE
import BACKEND_URL from "../config"; 

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 2. USAMOS LA VARIABLE AQUÍ
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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-orange-500 mb-6">Crear Cuenta</h2>

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm text-center border border-red-500/50">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Usuario</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-orange-500 focus:outline-none"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-orange-500 focus:outline-none"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-orange-500 focus:outline-none"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded transition shadow-lg mt-4">
                        Registrarse
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-orange-400 hover:underline">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}

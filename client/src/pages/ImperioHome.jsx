import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ImperioHome() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://api.myl.cl/static/cards/162/001.png')] bg-cover bg-center opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-6xl font-black text-orange-500 mb-4 uppercase italic">Era Imperio</h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">Domina el metajuego actual y construye estrategias con las últimas ediciones oficiales.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/imperio/builder" className="px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-full font-bold shadow-lg transition">🛠️ Crear Mazo</Link>
                        <Link to="/imperio/community" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold border border-slate-500 transition">🌍 Comunidad</Link>
                    </div>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-orange-500 uppercase">Recursos de Imperio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition">
                        <h3 className="text-xl font-bold mb-2">📜 Banlist Imperio</h3>
                        <p className="text-slate-400 text-sm mb-4">Revisa las cartas restringidas y prohibidas para el formato competitivo actual.</p>
                        <a href="https://blog.myl.cl/banlists-actualizadas/" target="_blank" className="text-orange-400 font-bold hover:underline">Ver Banlist Oficial →</a>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition">
                        <h3 className="text-xl font-bold mb-2">⚖️ DAR (Reglas Oficiales)</h3>
                        <p className="text-slate-400 text-sm mb-4">Documento actualizado de arbitraje y reglas para torneos de Imperio.</p>
                        <a href="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" target="_blank" className="text-orange-400 font-bold hover:underline">Descargar PDF →</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
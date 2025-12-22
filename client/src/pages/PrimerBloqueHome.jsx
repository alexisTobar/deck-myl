import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PrimerBloqueHome() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans">
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp')] bg-cover bg-center opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/80 to-[#0B1120]"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-6xl font-black text-yellow-500 mb-4 uppercase">Primer Bloque</h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">Revive la nostalgia del 2003. Arma tu mazo de Caballeros, Dragones o Sombras.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/primer-bloque/builder" className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-full font-bold shadow-lg transition">🛡️ Armar Mazo</Link>
                        <Link to="/primer-bloque/community" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold border border-slate-500 transition">🌍 Comunidad</Link>
                    </div>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 uppercase tracking-widest">Compendio Legendario</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-yellow-500 transition">
                        <h3 className="text-xl font-bold mb-2">❓ FAQ Primer Bloque</h3>
                        <p className="text-slate-400 text-sm mb-4">Aclara dudas sobre mecánicas clásicas como Furia o Exhumación.</p>
                        <a href="https://drive.google.com/drive/folders/1i1y725whp728kCk92_Y01_ngB1ZS4EYM?usp=drive_link" target="_blank" className="text-yellow-500 font-bold hover:underline">Ver Preguntas Frecuentes →</a>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-yellow-500 transition">
                        <h3 className="text-xl font-bold mb-2">📜 Formatos Clásicos</h3>
                        <p className="text-slate-400 text-sm mb-4">Información sobre formatos como Racial, Luz/Oscuridad y otros de PB.</p>
                        <span className="text-slate-500 text-xs font-bold uppercase italic">Próximamente...</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
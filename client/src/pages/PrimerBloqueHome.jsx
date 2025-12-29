import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Star, Trophy, Sword, ScrollText, Play, Instagram, BookOpen } from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/espada_sagrada.png" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/helenica.png" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/hijos_de_daana.png" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-orange-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/dominios_de_ra.png" }
];

export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-yellow-500">
            {/* HERO - NOSTALGIA PURA */}
            <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp')] bg-cover bg-fixed bg-center opacity-25 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/60 to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1,2,3].map(i => <Star key={i} size={16} fill="#eab308" className="text-yellow-500" />)}
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 mb-6 uppercase tracking-tighter italic">
                        PRIMER BLOQUE
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed italic">
                        "Donde la leyenda comenzó." Revive el formato que forjó a los mejores gladiadores.
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <button onClick={() => setShowModal(true)} className="px-12 py-5 bg-yellow-600 hover:bg-yellow-500 text-black rounded-2xl font-black shadow-[0_0_30px_rgba(202,138,4,0.4)] transition-all hover:scale-105 uppercase italic text-xl flex items-center gap-3">
                            <Sword size={24} /> Entrar a la Forja
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN YOUTUBE - LOS SABIOS DEL FORMATO */}
            <section className="max-w-7xl mx-auto px-6 py-20 border-t border-yellow-500/10">
                <div className="flex items-center justify-between mb-16">
                    <div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Cronistas de <span className="text-yellow-500">PB</span></h2>
                        <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Aprende de los mejores jugadores en YouTube</p>
                    </div>
                    <Play className="text-red-600 animate-pulse" size={40} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PBVideoCard title="Tutorial de Mecánicas PB" author="Academia MyL" />
                    <PBVideoCard title="Deck Tech: Caballeros" author="El Meta MyL" />
                    <PBVideoCard title="Estrategia Dragón PB" author="Santuario MyL" />
                    <PBVideoCard title="Combo Infinito PB" author="Cartas MyL" />
                </div>
            </section>

            {/* SECCIÓN RECURSOS Y BANEADAS */}
            <section className="bg-slate-900/40 py-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ResourceCard 
                        title="Reglas Clásicas"
                        desc="Manual de reglas específico para el formato Primer Bloque Extendido."
                        icon={<ScrollText className="text-blue-400" />}
                        link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc"
                    />
                    <ResourceCard 
                        title="Banlist Racial"
                        desc="Lista de cartas limitadas por raza para un juego equilibrado."
                        icon={<Trophy className="text-red-500" />}
                        link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque"
                    />
                    <ResourceCard 
                        title="Historias PB"
                        desc="Descubre el trasfondo de los personajes de Espada Sagrada y Helénica."
                        icon={<BookOpen className="text-green-500" />}
                        link="https://blog.myl.cl/"
                    />
                </div>
            </section>

            {/* FOOTER SOCIAL */}
            <footer className="py-20 border-t border-slate-800 text-center">
                <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] mb-8">Comunidad WarningDeck</p>
                <div className="flex justify-center gap-10">
                    <a href="https://www.instagram.com/myl_oficial/" className="text-slate-400 hover:text-yellow-500 transition-colors"><Instagram size={32} /></a>
                    <a href="https://blog.myl.cl/" className="text-slate-400 hover:text-yellow-500 transition-colors font-black text-2xl italic tracking-tighter">BLOG MYL</a>
                </div>
            </footer>

            {/* MODAL DE SELECCIÓN (EL MISMO QUE TENÍAS PERO CON ESTILO MEJORADO) */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-center mb-8 text-yellow-500">Selecciona tu Edición</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MAIN_EDITIONS.map((ed) => (
                                <button key={ed.id} onClick={() => navigate("/primer-bloque/builder", { state: { initialEdition: ed.id } })} className="relative h-32 rounded-2xl overflow-hidden group border border-white/10 hover:border-yellow-500 transition-all shadow-2xl">
                                    <img src={ed.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-500" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} mix-blend-multiply opacity-60`}></div>
                                    <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl tracking-widest">{ed.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PBVideoCard({ title, author }) {
    return (
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-yellow-500/50 transition-all cursor-pointer group">
            <div className="h-40 bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors relative">
                <Play size={32} className="text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-[10px] font-black rounded-md uppercase">YT</div>
            </div>
            <div className="p-6">
                <h4 className="font-black text-sm uppercase leading-tight mb-2 tracking-tight line-clamp-2">{title}</h4>
                <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest opacity-70">{author}</p>
            </div>
        </div>
    );
}

function ResourceCard({ title, desc, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="p-8 bg-slate-950/60 rounded-3xl border border-slate-800 hover:border-white/20 transition-all group flex flex-col items-center text-center">
            <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="text-xl font-black uppercase italic mb-2 tracking-tighter">{title}</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
        </a>
    );
}
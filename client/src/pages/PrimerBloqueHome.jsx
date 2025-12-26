import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Star } from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "bg-blue-600 hover:bg-blue-500" },
    { id: "helenica", label: "Helénica", color: "bg-red-600 hover:bg-red-500" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "bg-green-600 hover:bg-green-500" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "bg-yellow-600 hover:bg-yellow-500 text-black" }
];

export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const selectEdition = (id) => {
        // Redirigimos al constructor pasando la edición seleccionada en el estado
        navigate("/primer-bloque/builder", { state: { initialEdition: id } });
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-yellow-500 selection:text-black">
            {/* HERO SECTION */}
            <div className="relative h-[650px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp')] bg-cover bg-fixed bg-center opacity-30 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent"></div>
                
                <div className="relative z-10 text-center px-4">
                    <span className="text-yellow-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block">Formato Clásico</span>
                    <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-6 uppercase tracking-tighter italic">
                        Primer Bloque
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Regresa a las raíces de Mitos y Leyendas. Invocaciones ancestrales, dragones milenarios y la estrategia que definió una era.
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <button 
                            onClick={() => setShowModal(true)} 
                            className="px-10 py-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-black shadow-[0_0_20px_rgba(202,138,4,0.4)] transition-all hover:scale-105 active:scale-95 uppercase italic"
                        >
                            🛡️ Forjar Mazo
                        </button>
                        <Link to="/community" className="px-10 py-4 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 rounded-xl font-black border border-slate-600 transition-all hover:scale-105 active:scale-95 uppercase italic">
                            🌍 Explorar Arena
                        </Link>
                    </div>
                </div>
            </div>

            {/* MODAL DE SELECCIÓN DE EDICIÓN */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <Star className="mx-auto text-yellow-500 mb-2" fill="currentColor" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Elige tu Relato</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Selecciona una edición principal para comenzar</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {MAIN_EDITIONS.map((ed) => (
                                <button
                                    key={ed.id}
                                    onClick={() => selectEdition(ed.id)}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg border-2 border-transparent hover:border-white ${ed.color}`}
                                >
                                    {ed.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* RECURSOS PRO */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <CardInfo title="FAQ Clásico" icon="?" color="text-yellow-500" link="https://docs.google.com/forms/..." />
                    <CardInfo title="Restricciones" icon="⚔️" color="text-red-500" link="https://blog.myl.cl/..." />
                    <CardInfo title="Documento DAR" icon="⚖️" color="text-blue-500" link="https://drive.google.com/..." />
                </div>
            </section>
        </div>
    );
}

function CardInfo({ title, icon, color, link }) {
    return (
        <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-yellow-500/50 transition-all relative overflow-hidden">
            <div className={`absolute -right-8 -top-8 ${color} opacity-10 text-9xl font-black`}>{icon}</div>
            <h3 className={`text-2xl font-black mb-4 ${color} italic uppercase`}>{title}</h3>
            <a href={link} target="_blank" rel="noreferrer" className={`${color} font-black hover:gap-4 transition-all uppercase text-sm tracking-widest flex items-center gap-2`}>
                Ver Más <span>→</span>
            </a>
        </div>
    );
}
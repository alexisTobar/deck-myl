import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Star } from "lucide-react";

// ✅ Configuración con imágenes decorativas para las ediciones
const MAIN_EDITIONS = [
    { 
        id: "espada_sagrada", 
        label: "Espada Sagrada", 
        color: "from-blue-600 to-blue-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/espada_sagrada.png" 
    },
    { 
        id: "helenica", 
        label: "Helénica", 
        color: "from-red-600 to-red-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/helenica.png" 
    },
    { 
        id: "hijos_de_daana", 
        label: "Hijos de Daana", 
        color: "from-green-600 to-green-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/hijos_de_daana.png" 
    },
    { 
        id: "dominios_de_ra", 
        label: "Dominios de Ra", 
        color: "from-yellow-600 to-orange-900", 
        img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/dominios_de_ra.png" 
    }
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
                
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                    <span className="text-yellow-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">Formato Clásico</span>
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

            {/* MODAL DE SELECCIÓN DE EDICIÓN CON IMÁGENES */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-yellow-500/30 w-full max-w-2xl rounded-[2.5rem] p-8 relative shadow-2xl overflow-hidden">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-50">
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <Star className="mx-auto text-yellow-500 mb-2" fill="currentColor" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Elige tu Edicion</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Selecciona una edición principal para comenzar a construir tu deck</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MAIN_EDITIONS.map((ed) => (
                                <button
                                    key={ed.id}
                                    onClick={() => selectEdition(ed.id)}
                                    className={`relative group h-32 rounded-2xl overflow-hidden border-2 border-white/5 hover:border-yellow-500 transition-all active:scale-95 shadow-xl`}
                                >
                                    {/* Imagen de fondo */}
                                    <img 
                                        src={ed.img} 
                                        alt={ed.label} 
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700" 
                                    />
                                    {/* Overlay gradiente */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} mix-blend-multiply opacity-50`}></div>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    
                                    {/* Texto centrado */}
                                    <div className="relative h-full flex items-center justify-center">
                                        <span className="text-xl font-black uppercase italic tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                            {ed.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN DE RECURSOS PRO */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-yellow-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-yellow-500/10 text-9xl font-black group-hover:scale-110 transition-transform">?</div>
                        <h3 className="text-2xl font-black mb-4 text-yellow-500 italic uppercase">FAQ Clásico</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">¿Dudas sobre Furia, Exhumación o el daño de los Oros? Consulta el compendio oficial de reglas clásicas.</p>
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdsaGsdcxvUXKx5dufVXFJiLdRzaNkjhKBNEKCVzwIHmUm-HA/viewform" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-yellow-500 font-black hover:gap-4 transition-all uppercase text-sm tracking-widest">
                            Feedback <span>→</span>
                        </a>
                    </div>

                    {/* Banlist */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-red-500/10 text-9xl font-black group-hover:scale-110 transition-transform">⚔️</div>
                        <h3 className="text-2xl font-black mb-4 text-red-500 italic uppercase">Restricciones</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">Mantén el juego justo. Revisa la lista de cartas prohibidas y limitadas para el formato PB Extendido.</p>
                        <a href="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" className="inline-flex items-center gap-2 text-red-500 font-black hover:gap-4 transition-all uppercase text-sm tracking-widest">
                            Ver Banlist <span>→</span>
                        </a>
                    </div>

                    {/* DAR */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-blue-500/10 text-9xl font-black group-hover:scale-110 transition-transform">⚖️</div>
                        <h3 className="text-2xl font-black mb-4 text-blue-500 italic uppercase">Documento DAR</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">El reglamento oficial de arbitraje (DAR) adaptado para torneos de Primer Bloque.</p>
                        <a href="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" className="inline-flex items-center gap-2 text-blue-500 font-black hover:gap-4 transition-all uppercase text-sm tracking-widest">
                            Descargar DAR <span>→</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
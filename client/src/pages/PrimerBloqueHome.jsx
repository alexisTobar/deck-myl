import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Star, Hammer, Users, FileText, Scale, Trophy, Zap, 
    Sword, Instagram, Youtube, Twitter, Target, Crown, ChevronRight, PlayCircle, ArrowRight, Heart
} from "lucide-react";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } }
};

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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060912] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-blue-100 transition-colors duration-500 relative">
            
            {/* ✨ TUS PARTÍCULAS ORIGINALES */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="gold-particles opacity-20"></div>
            </div>

            {/* 🖼️ TU IMAGEN DE FONDO ORIGINAL ANIMADA */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" 
                    className="w-full h-full object-cover blur-[1px]" 
                />
            </div>

            <section className="relative h-screen flex items-center justify-center border-b border-slate-200 dark:border-white/5 z-10 px-4">
                <div className="text-center max-w-6xl">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-6">
                        <Star size={32} className="text-blue-600 animate-pulse" fill="currentColor" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-7xl md:text-[11rem] font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-sm"
                    >
                        PRIMER<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">BLOQUE</span>
                    </motion.h1>

                    <motion.p {...fadeInUp} className="text-lg md:text-3xl text-slate-500 dark:text-slate-300 mb-12 max-w-3xl mx-auto italic font-light leading-relaxed">
                        Donde nació la leyenda. Revive las batallas ancestrales con el poder del código de <span className="text-blue-600 font-bold">ForjaDeck</span>.
                    </motion.p>

                    <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button onClick={() => setShowModal(true)} className="group relative px-14 py-7 bg-blue-600 text-white rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-xl shadow-blue-600/20 overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3">
                                <Sword size={28} /> ENTRAR A LA FORJA
                            </span>
                        </button>
                        <Link to="/community" className="px-14 py-7 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl font-black transition-all hover:bg-blue-600/10 flex items-center justify-center gap-3 uppercase italic text-2xl text-slate-700 dark:text-slate-200 shadow-sm">
                            <Users size={28} /> COMUNIDAD
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* SECCIÓN TIER LIST */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-blue-600 mb-6" size={48} />
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Tier List <span className="text-blue-600">Racial</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed italic font-medium">El estado del metajuego en las arenas según la comunidad.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RaceRank name="Defensor" power="95%" color="bg-blue-600" />
                        <RaceRank name="Héroe" power="93%" color="bg-indigo-600" />
                        <RaceRank name="Faerie" power="88%" color="bg-blue-400" />
                        <RaceRank name="Titán" power="82%" color="bg-slate-400" />
                    </div>
                </motion.div>
            </section>

            {/* SECCIÓN YOUTUBE (MEJORADA PARA LIVE) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-slate-200 dark:border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="text-left">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Sabios del <span className="text-blue-600">Relato</span></h2>
                        <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Aprende de los cronistas legendarios</p>
                    </div>
                    <div className="flex items-center gap-4 text-red-600 font-black uppercase text-sm">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </span>
                        <Youtube size={24} /> En Vivo / Recientes
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <YTCard title="Elevadoh" channelId="elevadoh" mode="live" />
                    <YTCard title="Coliseo Mitero" channelId="coliseomitero" mode="live" />
                    <YTCard title="Dragon Dorado" channelId="DragonDoradoMyL" mode="uploads" />
                    <YTCard title="Mitos y Leyendas" channelId="myloficial" mode="live" />
                </div>
            </section>

            {/* RECURSOS */}
            <section className="bg-white dark:bg-slate-950/50 py-32 border-y border-slate-200 dark:border-white/10 relative z-10 transition-colors">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ResourceBox 
                        title="Banlist Racial"
                        desc="Revisa las restricciones de cartas para cada raza en PB Extendido."
                        icon={<Trophy size={48} className="text-blue-600" />}
                        link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque"
                        btnText="Ver Banlist"
                    />
                    <ResourceBox 
                        title="Manual DAR"
                        desc="Reglamento de arbitraje original adaptado para torneos modernos."
                        icon={<Scale size={48} className="text-blue-600" />}
                        link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc"
                        btnText="Descargar DAR"
                    />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white dark:bg-black py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-light italic uppercase tracking-tighter text-slate-900 dark:text-white">Forja<span className="text-blue-600 font-black">Deck</span></h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] mt-2 italic">Resguardando la Llama Clásica</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-base bg-slate-50 dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                            Hecho con <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" /> por <span className="text-blue-600 font-bold">Alexis Tobar</span>
                        </p>
                        <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest italic border-l-4 border-blue-600 pl-4">Colaboración: Juegos Vikingos</p>
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#0c111d] border border-slate-200 dark:border-blue-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={32} /></button>
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-blue-600 text-center mb-10">Selecciona tu Edición</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MAIN_EDITIONS.map((ed) => (
                                    <button key={ed.id} onClick={() => navigate("/primer-bloque/builder", { state: { initialEdition: ed.id } })} className="relative h-32 rounded-2xl overflow-hidden group border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-all">
                                        <img src={ed.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" alt={ed.label} />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} opacity-60`}></div>
                                        <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl text-white">{ed.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// SUBCOMPONENTES
function RaceRank({ name, power, color }) {
    return (
        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-10 ${color} rounded-full`}></div>
                <span className="text-xl font-black uppercase italic tracking-tighter text-slate-700 dark:text-slate-200">{name}</span>
            </div>
            <div className="text-right text-blue-600 font-black text-2xl">{power}</div>
        </div>
    );
}

// ✅ YTCard ACTUALIZADO: Permite capturar "Live" o "Uploads"
function YTCard({ title, channelId, mode = "uploads" }) {
    // Si el modo es 'live', intentamos cargar el stream actual
    // Si no hay stream activo, YouTube mostrará el último video o el canal
    const embedUrl = mode === "live" 
        ? `https://www.youtube.com/embed/live_stream?channel=${channelId}`
        : `https://www.youtube.com/embed?listType=user_uploads&list=${channelId}`;

    return (
        <div className="space-y-4 group">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest italic">{title}</h3>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-white ${mode === 'live' ? 'bg-red-600 animate-pulse' : 'bg-slate-600'}`}>
                    {mode === 'live' ? 'Capturando Vivo...' : 'Últimos Videos'}
                </span>
            </div>
            <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-slate-200 dark:border-white/5 shadow-2xl bg-black group-hover:border-blue-500/30 transition-all">
                <iframe 
                    className="w-full h-full" 
                    src={embedUrl} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function ResourceBox({ title, desc, icon, link, btnText }) {
    return (
        <div className="p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center gap-6 group">
            <div className="group-hover:scale-125 transition-transform duration-500">{icon}</div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed italic">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="px-10 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white rounded-full font-black transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ChevronRight size={14} />
            </a>
        </div>
    );
}
import { useState, useEffect } from "react"; // ✅ useEffect agregado
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BACKEND_URL from "../config"; // ✅ Importada la configuración
import { 
    X, Star, Hammer, Users, Scale, Trophy, Zap, 
    Sword, Instagram, Youtube, Twitter, Target, Crown, ChevronRight, PlayCircle, Newspaper, ArrowRight, Heart, Sparkles
} from "lucide-react";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function ImperioHome() {
    const navigate = useNavigate();
    const [tierList, setTierList] = useState([]); // ✅ Estado para Tier List real
    const [latestCards, setLatestCards] = useState([]); // ✅ Estado para carrusel

    // ✅ FETCH DE DATOS DINÁMICOS PARA ERA IMPERIO
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Traer Tier List real de Imperio
                const resTier = await fetch(`${BACKEND_URL}/api/decks/stats/tier-list?format=imperio`);
                if (resTier.ok) setTierList(await resTier.json());

                // Traer cartas recién agregadas por el Admin para Imperio
                const resLatest = await fetch(`${BACKEND_URL}/api/cards/latest?format=imperio`);
                if (resLatest.ok) setLatestCards(await resLatest.json());
            } catch (error) {
                console.error("Error cargando datos de Imperio:", error);
            }
        };
        fetchData();
    }, []);

    const rankColors = ["bg-red-600", "bg-orange-600", "bg-yellow-600", "bg-slate-400"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070504] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-blue-100 transition-colors duration-500 relative">
            
            {/* ✨ TUS PARTÍCULAS DE FUEGO ORIGINALES */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="fire-particles opacity-20"></div>
            </div>

            {/* 🐉 TU DRAGÓN DE FONDO ORIGINAL */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-15">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    src="https://api.myl.cl/static/cards/162/001.png" 
                    className="w-full h-full object-cover blur-[2px]" 
                />
            </div>

            <section className="relative min-h-screen flex items-center justify-center border-b border-slate-200 dark:border-white/5 z-10 px-4 py-20">
                <div className="text-center w-full max-w-6xl mx-auto">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-10">
                        <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Zap size={28} className="text-blue-600 animate-pulse" fill="currentColor" />
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="flex flex-col items-center leading-none">
                            <span className="text-4xl md:text-6xl font-extralight uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-2">
                                Era
                            </span>
                            <span className="text-[14vw] md:text-[11rem] font-black uppercase tracking-tighter italic text-slate-900 dark:text-white drop-shadow-2xl">
                                IMPERIO<span className="text-blue-600">.</span>
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p {...fadeInUp} className="text-base md:text-2xl text-slate-500 dark:text-slate-300 mb-12 max-w-2xl mx-auto italic font-medium leading-relaxed px-4 border-l-2 border-blue-600/30">
                        Domina el poder del presente. El campo de batalla oficial analizado por <span className="text-blue-600 font-bold">ForjaDeck</span>.
                    </motion.p>

                    <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/imperio/builder" className="group w-full sm:w-auto relative px-14 py-6 bg-blue-600 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/40 overflow-hidden text-center">
                            <span className="relative z-10 font-black uppercase italic text-xl flex items-center justify-center gap-3">
                                <Sword size={22} /> FORJAR MAZO
                            </span>
                        </Link>
                        <Link to="/community" className="w-full sm:w-auto px-14 py-6 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl font-black transition-all hover:bg-blue-600/10 flex items-center justify-center gap-3 uppercase italic text-xl text-slate-700 dark:text-slate-200 shadow-sm text-center">
                            <Users size={22} /> COMUNIDAD
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ✅ NUEVA SECCIÓN: RECIÉN AGREGADAS IMPERIO (CARRUSEL) */}
            {latestCards.length > 0 && (
                <section className="py-20 bg-slate-50/50 dark:bg-white/5 relative z-10 overflow-hidden border-y border-slate-200 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6 mb-10">
                        <div className="flex items-center gap-4">
                            <Sparkles className="text-orange-500" />
                            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Últimas <span className="text-orange-600">Cartas</span></h2>
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <motion.div 
                            className="flex gap-6 px-6"
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        >
                            {[...latestCards, ...latestCards].map((card, idx) => (
                                <div key={idx} className="min-w-[180px] md:min-w-[220px] group">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-white/10 group-hover:border-orange-500 transition-all">
                                        <img src={card.imgUrl || card.img} className="w-full h-full object-cover" alt={card.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <p className="text-white font-black text-xs uppercase italic">{card.name}</p>
                                            <p className="text-orange-400 text-[10px] font-bold uppercase">{card.edicion || card.edition}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F8FAFC] dark:from-[#070504] to-transparent z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F8FAFC] dark:from-[#070504] to-transparent z-10"></div>
                    </div>
                </section>
            )}

            {/* ✅ SECCIÓN RADAR DINÁMICA (TIER LIST REAL) */}
            <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-blue-600 mb-6" size={48} />
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Radar de <span className="text-blue-600">Razas</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">Tendencia real en ForjaDeck basada en los mazos Imperio de la comunidad.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tierList.length > 0 ? (
                            tierList.map((race, index) => (
                                <RaceRank 
                                    key={race.name} 
                                    name={race.name} 
                                    power={race.power} 
                                    color={rankColors[index] || "bg-slate-500"} 
                                />
                            ))
                        ) : (
                            <div className="col-span-2 p-10 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl text-center text-slate-400 italic">
                                Sincronizando datos de la Arena Imperio...
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* SECCIÓN ANALISTAS */}
            <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10 border-t border-slate-200 dark:border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <div className="text-left">
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Analistas del <span className="text-blue-600">Meta</span></h2>
                        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px] italic">Contenido destacado de la comunidad</p>
                    </div>
                    <div className="flex items-center gap-4 text-red-600 font-black uppercase text-sm">
                        <Youtube size={24} /> Youtube Live
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <YTCard title="Sombras y Oscuridad" videoId="z-hekxgmP2I" />
                    <YTCard title="Mitos y Leyendas Oficial" videoId="u-am6kIUP_A" />
                </div>
            </section>

            {/* RECURSOS */}
            <section className="bg-white dark:bg-slate-950/50 py-20 md:py-32 border-y border-slate-200 dark:border-white/10 relative z-10 transition-colors">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-center md:text-left">
                    <ResourceBox 
                        title="Banlist Oficial"
                        desc="Consulta la lista actualizada de cartas restringidas para el formato Imperio."
                        icon={<Trophy size={48} className="text-blue-600" />}
                        link="https://blog.myl.cl/banlists-actualizadas/"
                        btnText="Ver Banlist"
                    />
                    <ResourceBox 
                        title="Manual DAR"
                        desc="El estándar de arbitraje oficial para torneos nacionales y Premier."
                        icon={<Scale size={48} className="text-blue-600" />}
                        link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view"
                        btnText="Descargar DAR"
                    />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white dark:bg-black py-16 md:py-20 border-t border-slate-200 dark:border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-light italic uppercase tracking-tighter text-slate-900 dark:text-white">Forja<span className="text-blue-600 font-black">Deck</span></h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] mt-2 italic">El Poder del Presente</p>
                        <div className="flex justify-center md:justify-start gap-8 mt-8">
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-all scale-110"><Instagram size={24}/></a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-all scale-110"><Youtube size={24}/></a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-all scale-110"><Twitter size={24}/></a>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-base bg-slate-50 dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                            Hecho con <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" /> por <span className="text-blue-600 font-bold">Alexis Tobar</span>
                        </p>
                        <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest italic border-l-4 border-blue-600 pl-4">Colaboración: Juegos Vikingos</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// SUBCOMPONENTES
function RaceRank({ name, power, color }) {
    return (
        <div className="bg-white dark:bg-white/5 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-10 ${color} rounded-full`}></div>
                <span className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-700 dark:text-slate-200">{name}</span>
            </div>
            <div className="text-right text-blue-600 font-black text-xl md:text-2xl group-hover:scale-110 transition-transform">{power}</div>
        </div>
    );
}

function YTCard({ title, videoId }) {
    return (
        <div className="space-y-4 group w-full">
            <div className="flex justify-between items-center px-2 md:px-4">
                <h3 className="text-xs md:text-sm font-black text-blue-600 uppercase tracking-widest italic">{title}</h3>
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-white bg-slate-600">
                    SABIO
                </span>
            </div>
            <div className="relative pt-[56.25%] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-slate-200 dark:border-white/5 shadow-2xl bg-black group-hover:border-blue-500/30 transition-all">
                <iframe 
                    className="absolute top-0 left-0 w-full h-full" 
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={title}
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
        <div className="p-8 md:p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center gap-4 md:gap-6 group">
            <div className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">{icon}</div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed italic">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white rounded-full font-black transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ArrowRight size={14} />
            </a>
        </div>
    );
}
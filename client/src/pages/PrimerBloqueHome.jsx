import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Hammer, Users, FileText, Scale, Trophy, Zap, 
  Newspaper, Sword, Instagram, Youtube, Twitter, Target, 
  PlayCircle, Crown, ScrollText
} from "lucide-react";

// ✅ Animaciones Locales unificadas
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
        <div className="min-h-screen bg-[#060912] text-white font-sans selection:bg-yellow-500 overflow-x-hidden relative">
            
            {/* ✨ EFECTO DE PARTÍCULAS DORADAS PB */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="gold-particles"></div>
            </div>

            {/* 🐉 FONDO DINÁMICO: DRAGÓN PB */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1], rotate: [-2, 0, -2] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" 
                    className="w-full h-full object-cover blur-[1px]" 
                />
            </div>

            {/* HERO SECTION LEGENDARIO */}
            <section className="relative h-screen flex items-center justify-center border-b border-yellow-500/10 z-10 px-4">
                <motion.div initial="initial" animate="animate" variants={staggerContainer} className="text-center max-w-6xl">
                    <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                        <div className="px-6 py-2 rounded-full bg-yellow-600/10 border border-yellow-500/40 text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 shadow-lg">
                            <Star size={14} className="animate-spin-slow" fill="currentColor" /> Formato Clásico PB Extendido
                        </div>
                    </motion.div>
                    
                    <motion.h1 variants={fadeInUp} className="text-7xl md:text-[11rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_20px_50px_rgba(234,179,8,0.3)]">
                        PRIMER BLOQUE
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto italic font-light">
                        Donde nació la leyenda. Revive las batallas ancestrales con el poder del código original.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button onClick={() => setShowModal(true)} className="group relative px-14 py-6 bg-yellow-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 italic"></div>
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3 text-black">
                                <Sword size={26} /> Entrar a la Forja
                            </span>
                        </button>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-yellow-600/10 hover:border-yellow-500/50 flex items-center justify-center gap-3 uppercase italic text-2xl text-slate-200">
                            <Users size={26} /> Comunidad
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* 📊 SECCIÓN RADAR: RANKING DE RAZAS PB */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-yellow-500 mb-6" size={48} />
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Tier List <span className="text-yellow-500">Racial</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed italic">El estado del metajuego en las arenas de Primer Bloque Extendido según la comunidad.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RaceRank name="Defensor" power="95%" trend="up" color="bg-blue-400" />
                        <RaceRank name="Héroe" power="93%" trend="up" color="bg-red-500" />
                        <RaceRank name="Faerie" power="88%" trend="down" color="bg-pink-500" />
                        <RaceRank name="Titán" power="82%" trend="up" color="bg-yellow-400" />
                    </div>
                </motion.div>
            </section>

            {/* 📡 FEED DE YOUTUBE PB (Basado en tus links) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Sabios del <span className="text-yellow-500">Relato</span></h2>
                        <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Aprende de los cronistas legendarios</p>
                    </div>
                    <div className="flex items-center gap-4 text-red-600 font-black uppercase text-sm">
                        <Youtube size={24} /> Youtube Live
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <YTCardPB title="Elevadoh" channelId="elevadoh" />
                    <YTCardPB title="Coliseo Mitero" channelId="coliseomitero" />
                    <YTCardPB title="Dragon Dorado MyL" channelId="DragonDoradoMyL" />
                    <YTCardPB title="Mitos y Leyendas" channelId="myloficial" />
                </div>
            </section>

            {/* 📚 RECURSOS ANCESTRALES */}
            <section className="bg-slate-950/50 py-32 border-y border-yellow-500/10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ResourceBoxPB 
                        title="Banlist Racial"
                        desc="Mantén el equilibrio en tus duelos. Revisa las restricciones de cartas para cada raza en PB Extendido."
                        icon={<Trophy size={48} />}
                        link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque"
                        btnText="Ver Banlist"
                    />
                    <ResourceBoxPB 
                        title="Manual DAR"
                        desc="El reglamento de arbitraje original adaptado para los torneos modernos de Primer Bloque."
                        icon={<Scale size={48} />}
                        link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc"
                        btnText="Descargar DAR"
                    />
                </div>
            </section>

            {/* 📱 FOOTER PB RESPONSIVO */}
            <footer className="bg-black py-20 border-t border-white/5 relative z-10 text-center md:text-left">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Warning<span className="text-yellow-500">Deck</span></h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-6">Resguardando la llama de Primer Bloque</p>
                        <div className="flex justify-center md:justify-start gap-8">
                            <a href="https://www.instagram.com/myl_oficial/" className="text-slate-400 hover:text-yellow-500 transition-all scale-125"><Instagram /></a>
                            <a href="https://www.youtube.com/@myloficial" className="text-slate-400 hover:text-yellow-500 transition-all scale-125"><Youtube /></a>
                            <a href="#" className="text-slate-400 hover:text-yellow-500 transition-all scale-125"><Twitter /></a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-4">Mecánicas</h4>
                            <ul className="text-slate-400 space-y-2 text-sm font-bold italic uppercase">
                                <li>Furia</li>
                                <li>Inhumación</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-4">Soporte</h4>
                            <ul className="text-slate-400 space-y-2 text-sm font-bold italic uppercase">
                                <li>Feedback</li>
                                <li>Reglas</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-20 text-[10px] text-slate-800 font-black uppercase tracking-[0.5em]">
                    WarningDeck • Rescatando el Origen
                </div>
            </footer>

            {/* MODAL DE EDICIÓN CON ANIMACIÓN */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c111d] border border-yellow-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-yellow-500 text-center mb-10">Inicia tu Leyenda</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MAIN_EDITIONS.map((ed) => (
                                    <button key={ed.id} onClick={() => navigate("/primer-bloque/builder", { state: { initialEdition: ed.id } })} className="relative h-32 rounded-2xl overflow-hidden group border border-white/10 hover:border-yellow-500 transition-all shadow-2xl">
                                        <img src={ed.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" alt={ed.label} />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} mix-blend-multiply opacity-70`}></div>
                                        <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl tracking-widest drop-shadow-xl">{ed.label}</div>
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

// --- SUBCOMPONENTES ---

function RaceRank({ name, power, trend, color }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-10 ${color} rounded-full`}></div>
                <span className="text-xl font-black uppercase italic tracking-tighter text-slate-200">{name}</span>
            </div>
            <div className="text-right">
                <div className="text-2xl font-black text-white leading-none">{power}</div>
                <span className={`text-[9px] font-black ${trend === 'up' ? 'text-green-500' : 'text-red-500'} uppercase tracking-widest`}>
                    {trend === 'up' ? '↑ Rising' : '↓ Falling'}
                </span>
            </div>
        </div>
    );
}

function YTCardPB({ title, channelId }) {
    return (
        <div className="space-y-4 group">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest italic">{title}</h3>
                <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Último Video</span>
            </div>
            <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-black group-hover:border-yellow-500/30 transition-all">
                <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed?listType=user_uploads&list=${channelId}`} 
                    title={title} frameBorder="0" allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function ResourceBoxPB({ title, desc, icon, link, btnText }) {
    return (
        <div className="p-10 bg-slate-900/40 rounded-[3rem] border border-white/5 hover:border-yellow-500/30 transition-all flex flex-col items-center text-center gap-6 group">
            <div className="text-yellow-500 group-hover:scale-125 transition-transform duration-500">{icon}</div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed italic">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="px-10 py-3 bg-slate-800 hover:bg-yellow-600 hover:text-black rounded-full font-black transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ChevronRight size={14} />
            </a>
        </div>
    );
}
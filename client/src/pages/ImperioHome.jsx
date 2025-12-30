import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Star, Hammer, Users, Scale, Trophy, Zap, 
  Sword, Instagram, Youtube, Twitter, Target, Crown, ChevronRight, PlayCircle, Newspaper, Camera, Globe, Layout
} from "lucide-react";

// ✅ 1. Definición de Animaciones (Evita que el componente falle si no las encuentra)
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

export default function ImperioHome() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ 2. Lógica de Sincronización de Mazos (Lo que pediste de PB)
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            if (d.format === "imperio") {
                setNombreMazo(d.name || "");
                setEditingDeckId(d._id);
                
                const uniqueCards = [];
                d.cards.forEach(c => {
                    const existing = uniqueCards.find(x => x.slug === c.slug);
                    if (existing) {
                        existing.cantidad += (c.quantity || c.cantidad || 1);
                    } else {
                        uniqueCards.push({
                            ...c,
                            cantidad: c.quantity || c.cantidad || 1,
                            imgUrl: c.imgUrl || c.imageUrl || "https://via.placeholder.com/250x350"
                        });
                    }
                });
                setMazo(uniqueCards);
            }
        }
    }, [location.state]);

    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans overflow-x-hidden selection:bg-orange-600 relative">
            
            {/* ✨ EFECTO DE PARTÍCULAS (Z-0) */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="fire-particles"></div>
            </div>

            {/* 🐉 DRAGÓN DE FONDO (Z-0) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-15">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    src="https://api.myl.cl/static/cards/162/001.png" 
                    className="w-full h-full object-cover blur-[1px]" 
                    alt=""
                />
            </div>

            {/* 🏰 HERO SECTION (Z-10) */}
            <section className="relative h-screen flex items-center justify-center border-b border-orange-500/10 z-10 px-4">
                <div className="text-center max-w-6xl">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-6">
                        <Zap size={32} fill="#f97316" className="text-orange-500 animate-pulse" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-7xl md:text-[11rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_0_50px_rgba(249,115,22,0.6)]"
                    >
                        IMPERIO
                    </motion.h1>

                    <motion.p {...fadeInUp} className="text-lg md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto italic font-light leading-relaxed">
                        Domina el poder del presente. Las mecánicas más complejas en el campo de batalla oficial.
                    </motion.p>

                    <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/imperio/builder" className="group relative px-14 py-7 bg-orange-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-orange-600/20 overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3 text-white">
                                <Sword size={28} /> FORJAR MAZO
                            </span>
                        </Link>
                        <Link to="/community" className="px-14 py-7 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-orange-600/10 flex items-center justify-center gap-3 uppercase italic text-2xl text-slate-200">
                            <Users size={28} /> COMUNIDAD
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 📊 RADAR DE RAZAS */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-orange-500 mb-6" size={48} />
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Radar de <span className="text-orange-500">Razas</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed italic">Tendencia de uso en torneos recientes y popularidad en la arena oficial.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RaceRank name="Caballero" power="98%" trend="up" color="bg-blue-600" />
                        <RaceRank name="Dragón" power="92%" trend="up" color="bg-red-600" />
                        <RaceRank name="Sombra" power="85%" trend="down" color="bg-purple-600" />
                        <RaceRank name="Eterno" power="79%" trend="up" color="bg-emerald-600" />
                    </div>
                </motion.div>
            </section>

            {/* 🎥 VIDEOS YOUTUBE (Embeds directos para que no fallen) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Analistas del <span className="text-orange-500">Meta</span></h2>
                    </div>
                    <div className="flex items-center gap-4 text-red-600 font-black uppercase text-sm">
                        <Youtube size={24} /> Youtube Live
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <YTCard title="Sombras y Oscuridad" url="z-hekxgmP2I?si=AnbR17cXSuxJfvv9" />
                    <YTCard title="Mitos y Leyendas" url="u-am6kIUP_A?si=2oN8E5WCMWwAzN4a" />
                </div>
            </section>

            {/* ⚖️ RECURSOS */}
            <section className="bg-slate-900/50 py-32 border-y border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
                    <ResourceBox 
                        title="Banlist Oficial"
                        desc="Consulta la lista actualizada de cartas restringidas y prohibidas."
                        icon={<Trophy size={48} />}
                        link="https://blog.myl.cl/banlists-actualizadas/"
                        btnText="Ver Banlist"
                    />
                    <ResourceBox 
                        title="Manual DAR"
                        desc="El estándar de arbitraje oficial para torneos nacionales."
                        icon={<Scale size={48} />}
                        link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view"
                        btnText="Descargar DAR"
                    />
                </div>
            </section>

            {/* 📱 FOOTER */}
            <footer className="bg-black py-20 border-t border-white/5 relative z-10 text-center md:text-left">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Warning<span className="text-orange-500">Deck</span></h2>
                        <div className="flex justify-center md:justify-start gap-8">
                            <Instagram className="text-slate-400 hover:text-orange-500 cursor-pointer" />
                            <Youtube className="text-slate-400 hover:text-orange-500 cursor-pointer" />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-800 font-black uppercase tracking-[0.5em]">WarningDeck © 2025 • Imperio</p>
                </div>
            </footer>
        </div>
    );
}

// ✅ SUBCOMPONENTES (Definidos aquí mismo para asegurar que el Home cargue)

function RaceRank({ name, power, trend, color }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-10 ${color} rounded-full`}></div>
                <span className="text-xl font-black uppercase italic tracking-tighter">{name}</span>
            </div>
            <div className="text-right text-orange-500 font-black text-2xl">{power}</div>
        </div>
    );
}

function YTCard({ title, url }) {
    return (
        <div className="space-y-4 group">
            <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest italic px-4">{title}</h3>
            <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-black group-hover:border-orange-500/30 transition-all">
                <iframe 
                    width="100%" height="100%" 
                    src={`https://www.youtube.com/embed/${url}`} 
                    title={title} frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function ResourceBox({ title, desc, icon, link, btnText }) {
    return (
        <div className="p-10 bg-slate-900/40 rounded-[3rem] border border-white/5 hover:border-orange-500/30 transition-all flex flex-col items-center text-center gap-6 group">
            <div className="text-orange-500 group-hover:scale-125 transition-transform duration-500">{icon}</div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed italic">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-black transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ChevronRight size={14} />
            </a>
        </div>
    );
}
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Hammer, Users, FileText, Scale, Trophy, Zap, Newspaper, PlayCircle,
  TrendingUp, Star, Crown, Target, ChevronRight, Youtube, Instagram, Twitter
} from "lucide-react";

// ✅ Definición de animaciones directamente en el archivo para evitar errores
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
    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans overflow-x-hidden selection:bg-orange-600 relative">
            
            {/* 🐉 FONDO DINÁMICO DE DRAGONES */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ y: [0, -20, 0], rotate: [12, 10, 12] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    src="https://api.myl.cl/static/cards/162/001.png" 
                    className="absolute -top-20 -right-40 w-[1000px] blur-[1px]" 
                />
            </div>

            {/* HERO SECTION (Visible inmediatamente) */}
            <section className="relative h-screen flex items-center justify-center border-b border-orange-500/10">
                <motion.div 
                    initial="initial" 
                    animate="animate" 
                    variants={staggerContainer} 
                    className="relative z-10 text-center px-4"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
                        <Zap size={14} className="animate-pulse" /> Sincronizado con Metajuego 2025
                    </motion.div>
                    
                    <motion.h1 variants={fadeInUp} className="text-7xl md:text-[12rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_20px_50px_rgba(249,115,22,0.3)]">
                        IMPERIO
                    </motion.h1>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                        <Link to="/imperio/builder" className="px-12 py-6 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all hover:scale-110 shadow-2xl">
                            <Hammer size={26} /> CREAR DECK
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* 🔥 HALL OF FAME: DECKS MÁS VOTADOS */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none"><span className="text-orange-500">Hall</span> of Fame</h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs italic">Estrategias que están dominando la temporada</p>
                    </div>
                    <Link to="/community" className="text-orange-500 font-black flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm">Ver Decks <TrendingUp size={16}/></Link>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DeckVotadoCard title="Kaiju Control" author="MasterPro" votes="1.2k" color="border-red-500" />
                    <DeckVotadoCard title="Mecha Aggro" author="MylPlayer" votes="950" color="border-blue-500" />
                    <DeckVotadoCard title="Sombra Midrange" author="DarkKnight" votes="840" color="border-purple-500" />
                </div>
            </section>

            {/* 🎥 CRONISTAS YOUTUBE (Tus links) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-16"><span className="text-orange-500">Youtube</span> Imperio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreatorItem name="Sombras y Oscuridad" channel="@Sombras_y_Oscuridad" link="https://www.youtube.com/@Sombras_y_Oscuridad" />
                    <CreatorItem name="Mitos y Leyendas Oficial" channel="@myloficial" link="https://www.youtube.com/@myloficial" />
                </div>
            </section>

            {/* ⚖️ RECURSOS */}
            <section className="bg-slate-900/30 py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <RuleCard title="Banlist" icon={<Trophy />} link="https://blog.myl.cl/banlists-actualizadas/" />
                    <RuleCard title="DAR Oficial" icon={<Scale />} link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" />
                    <RuleCard title="Blog MyL" icon={<Newspaper />} link="https://blog.myl.cl/" />
                </div>
            </section>
        </div>
    );
}

// Sub-componentes Imperio
function DeckVotadoCard({ title, author, votes, color }) {
    return (
        <motion.div whileHover={{ y: -10 }} className={`bg-white/5 p-8 rounded-[2.5rem] border-l-4 ${color} relative overflow-hidden group shadow-2xl`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity"><Crown size={60} /></div>
            <h4 className="text-2xl font-black uppercase italic mb-2 text-white">{title}</h4>
            <p className="text-slate-500 font-bold mb-6 text-sm italic">Creado por: {author}</p>
            <div className="flex items-center gap-4 text-orange-500 font-black">
                <Star size={20} fill="currentColor" />
                <span className="text-2xl">{votes} VOTOS</span>
            </div>
        </motion.div>
    );
}

function CreatorItem({ name, channel, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-orange-600/10 transition-all group">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><PlayCircle size={32} /></div>
                <div>
                    <h4 className="text-2xl font-black uppercase italic">{name}</h4>
                    <p className="text-red-500 font-bold tracking-widest">{channel}</p>
                </div>
            </div>
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
        </a>
    );
}

function RuleCard({ title, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="p-12 bg-white/5 rounded-[3rem] border border-white/10 hover:border-orange-500 transition-all group block">
            <div className="text-orange-500 mb-6 flex justify-center group-hover:scale-125 transition-transform">{icon}</div>
            <h4 className="text-3xl font-black uppercase italic">{title}</h4>
        </a>
    );
}
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Hammer, Users, FileText, Scale, Trophy, Zap, Newspaper, PlayCircle,
  TrendingUp, Star, Flame, Eye, Crown, Target
} from "lucide-react";

// Variantes de animación
const containerVariants = {
  animate: { transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans overflow-x-hidden selection:bg-orange-600">
            
            {/* 🐉 FONDO DINÁMICO */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ y: [0, -20, 0], rotate: [12, 10, 12] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    src="https://api.myl.cl/static/cards/162/001.png" 
                    className="absolute -top-20 -right-40 w-[1000px] blur-[1px]" 
                />
            </div>

            {/* HERO SECTION (1er Scroll) */}
            <section className="relative h-screen flex items-center justify-center border-b border-orange-500/10">
                <motion.div initial="initial" animate="animate" variants={containerVariants} className="relative z-10 text-center px-4">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
                        <Zap size={14} className="animate-pulse" /> Sincronizado con Metajuego 2025
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-8xl md:text-[13rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_20px_50px_rgba(249,115,22,0.3)]">
                        IMPERIO
                    </motion.h1>
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                        <Link to="/imperio/builder" className="px-12 py-6 bg-orange-600 rounded-2xl font-black text-2xl flex items-center gap-3 hover:scale-110 transition-transform shadow-orange-600/20 shadow-2xl">
                            <Hammer size={26} /> CREAR DECK
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* 🔥 HALL OF FAME: DECKS MÁS VOTADOS (2do Scroll) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none"><span className="text-orange-500">Hall</span> of Fame</h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs italic">Estrategias que están dominando la temporada</p>
                    </div>
                    <Link to="/community" className="text-orange-500 font-black flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm">Ver todos los Decks <TrendingUp size={16}/></Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DeckVotadoCard title="Kaiju Control" author="MasterPro" votes="1.2k" color="border-red-500" />
                    <DeckVotadoCard title="Mecha Aggro" author="MylPlayer" votes="950" color="border-blue-500" />
                    <DeckVotadoCard title="Sombra Midrange" author="DarkKnight" votes="840" color="border-purple-500" />
                </div>
            </section>

            {/* 💎 THE MOST WANTED: CARTAS TOP (3er Scroll) */}
            <section className="bg-slate-900/30 py-32 border-y border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-16 text-center">Top <span className="text-orange-500">Cartas</span> Imperio</h2>
                    <div className="flex flex-wrap justify-center gap-12">
                        <TopCardImg url="https://api.myl.cl/static/cards/162/004.png" name="Carta Legendaria 1" />
                        <TopCardImg url="https://api.myl.cl/static/cards/162/005.png" name="Carta Legendaria 2" />
                        <TopCardImg url="https://api.myl.cl/static/cards/162/010.png" name="Carta Legendaria 3" />
                        <TopCardImg url="https://api.myl.cl/static/cards/162/012.png" name="Carta Legendaria 4" />
                    </div>
                </div>
            </section>

            {/* 🎥 COMUNIDAD Y RECURSOS (4to Scroll) */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter">Cronistas <span className="text-orange-500">Youtube</span></h2>
                        <CreatorItem name="Sombras y Oscuridad" channel="@Sombras_y_Oscuridad" />
                        <CreatorItem name="Mitos y Leyendas Oficial" channel="@myloficial" />
                    </div>
                    <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 flex flex-col justify-center">
                        <Target className="text-orange-500 mb-6" size={48} />
                        <h3 className="text-4xl font-black uppercase italic mb-6">Reglamento Pro</h3>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">Descarga el DAR oficial y consulta la banlist para que tus mazos sean legales en torneos Premier.</p>
                        <div className="flex gap-4">
                            <a href="https://blog.myl.cl/banlists-actualizadas/" className="px-6 py-3 bg-orange-600 rounded-xl font-bold uppercase text-xs">Banlist</a>
                            <a href="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" className="px-6 py-3 bg-slate-800 rounded-xl font-bold uppercase text-xs">DAR Oficial</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Componentes Reutilizables
function DeckVotadoCard({ title, author, votes, color }) {
    return (
        <motion.div whileHover={{ y: -10 }} className={`bg-[#111] p-8 rounded-[2.5rem] border-l-4 ${color} relative overflow-hidden group shadow-2xl`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity"><Crown size={60} /></div>
            <h4 className="text-2xl font-black uppercase italic mb-2 text-white">{title}</h4>
            <p className="text-slate-500 font-bold mb-6 text-sm italic">Creado por: {author}</p>
            <div className="flex items-center gap-4 text-orange-500">
                <Star size={20} fill="currentColor" />
                <span className="font-black text-2xl">{votes}</span>
                <span className="text-slate-600 uppercase text-[10px] font-black tracking-widest">Votos de la Comunidad</span>
            </div>
        </motion.div>
    );
}

function TopCardImg({ url, name }) {
    return (
        <motion.div whileHover={{ scale: 1.1, rotate: 2 }} className="w-48 relative group cursor-pointer">
            <img src={url} className="rounded-xl shadow-2xl border border-white/10 group-hover:border-orange-500 transition-all" alt={name} />
            <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
        </motion.div>
    );
}

function CreatorItem({ name, channel }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"><PlayCircle size={24} /></div>
                <div>
                    <h4 className="font-black uppercase italic">{name}</h4>
                    <p className="text-red-500 text-xs font-bold">{channel}</p>
                </div>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-orange-500" />
        </div>
    );
}
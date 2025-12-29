import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // ✅ Importamos Framer Motion
import { 
  Hammer, Users, FileText, Scale, Trophy, Zap, Newspaper, PlayCircle
} from "lucide-react";

// Variantes de animación para reutilizar
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans overflow-x-hidden selection:bg-orange-600">
            
            {/* 🐉 DRAGONES CON MOVIMIENTO PARALAJE */}
            <motion.div 
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 0.15, x: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="fixed top-20 -right-40 z-0 pointer-events-none hidden lg:block"
            >
                <img src="https://api.myl.cl/static/cards/162/001.png" className="w-[900px] blur-[1px] rotate-12" alt="" />
            </motion.div>

            {/* HERO SECTION CON ANIMACIÓN DE ENTRADA */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-orange-500/10">
                <motion.div 
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="relative z-10 text-center px-4 max-w-6xl"
                >
                    <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                        <div className="px-6 py-2 rounded-full bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3">
                            <Zap size={14} className="animate-pulse text-orange-500" /> Meta Actual: Kaiju vs Mecha
                        </div>
                    </motion.div>

                    <motion.h1 
                        variants={fadeInUp}
                        className="text-8xl md:text-[14rem] font-black text-white mb-4 uppercase tracking-tighter italic leading-none drop-shadow-2xl"
                    >
                        IMPERIO
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto font-light italic">
                        Domina el presente. Accede a las estrategias de los campeones nacionales.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/imperio/builder" className="group relative px-14 py-6 bg-orange-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3">
                                <Hammer size={26} /> Crear Deck
                            </span>
                        </Link>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-orange-600/10 flex items-center justify-center gap-3 uppercase italic text-2xl">
                            <Users size={26} /> Comunidad
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* 🎥 YOUTUBERS CON EFECTO HOVER 3D */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 mb-16"
                >
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Analistas del <span className="text-orange-500">Meta</span></h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreatorCard 
                        name="Sombras y Oscuridad" 
                        link="https://www.youtube.com/@Sombras_y_Oscuridad"
                        tag="Destacado Imperio"
                    />
                    <CreatorCard 
                        name="Mitos y Leyendas Oficial" 
                        link="https://www.youtube.com/@myloficial"
                        tag="Canal Oficial"
                    />
                </div>
            </section>

            {/* ⚖️ RECURSOS CON SCROLL REVEAL */}
            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
                className="bg-slate-900/30 py-32 border-y border-white/5"
            >
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RuleCard variants={fadeInUp} title="Banlist" icon={<Trophy />} link="https://blog.myl.cl/banlists-actualizadas/" />
                    <RuleCard variants={fadeInUp} title="DAR" icon={<Scale />} link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" />
                    <RuleCard variants={fadeInUp} title="Blog" icon={<Newspaper />} link="https://blog.myl.cl/" />
                </div>
            </motion.section>
        </div>
    );
}

// Sub-componentes Imperio con Framer Motion
function CreatorCard({ name, link, tag }) {
    return (
        <motion.a 
            whileHover={{ y: -10, scale: 1.02 }}
            href={link} target="_blank" 
            className="group relative p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:border-orange-500/50 transition-colors overflow-hidden"
        >
            <div className="relative z-10">
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{tag}</span>
                <h3 className="text-4xl font-black uppercase italic mt-2 mb-4">{name}</h3>
                <div className="flex items-center gap-2 text-white/50 font-bold uppercase text-xs">
                    Ver Canal <PlayCircle size={16} />
                </div>
            </div>
        </motion.a>
    );
}

function RuleCard({ title, icon, link, variants }) {
    return (
        <motion.a 
            variants={variants}
            href={link} target="_blank" 
            className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-orange-500 transition-all text-center group"
        >
            <div className="text-orange-500 mb-6 flex justify-center group-hover:scale-125 transition-transform">{icon}</div>
            <h4 className="text-2xl font-black uppercase italic">{title}</h4>
        </motion.a>
    );
}
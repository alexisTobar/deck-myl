import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Hammer, Users, FileText, Scale, Trophy, Zap, Newspaper, PlayCircle,
  TrendingUp, ChevronRight, Youtube, Instagram, Twitter, Target, Flame, Box
} from "lucide-react";

// Variantes de animación para el scroll
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
        <div className="min-h-screen bg-[#070504] text-white font-sans selection:bg-orange-600 relative overflow-x-hidden">
            
            {/* 🐉 DECORACIÓN DE FONDO: DRAGONES ANIMADOS (Z-INDEX 0) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ y: [0, -25, 0], rotate: [12, 10, 12] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    src="https://api.myl.cl/static/cards/162/001.png" 
                    className="absolute -top-20 -right-40 w-[600px] md:w-[1000px] blur-[1px]" 
                />
                <motion.img 
                    animate={{ y: [0, 20, 0], rotate: [-12, -10, -12] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    src="https://api.myl.cl/static/cards/162/003.png" 
                    className="absolute -bottom-20 -left-40 w-[500px] md:w-[800px] blur-[2px]" 
                />
            </div>

            {/* HERO SECTION - MÁXIMO IMPACTO */}
            <section className="relative h-screen flex items-center justify-center border-b border-orange-500/10 z-10 px-4">
                <motion.div 
                    initial="initial" 
                    animate="animate" 
                    variants={staggerContainer} 
                    className="text-center max-w-6xl"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mb-8 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Flame size={14} className="animate-pulse" /> Sincronizado con Metajuego 2025
                    </motion.div>
                    
                    <motion.h1 
                        variants={fadeInUp}
                        className="text-7xl md:text-[13rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_20px_60px_rgba(249,115,22,0.4)]"
                    >
                        IMPERIO
                    </motion.h1>

                    <motion.p 
                        variants={fadeInUp}
                        className="text-lg md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto font-light italic leading-relaxed"
                    >
                        Domina el poder del presente. Las mecánicas más complejas, las ediciones más recientes y el espíritu competitivo oficial.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/imperio/builder" className="group relative px-14 py-6 bg-orange-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(234,88,12,0.4)] overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3">
                                <Hammer size={26} /> Forjar Mazo
                            </span>
                        </Link>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-orange-600/10 hover:border-orange-500/50 flex items-center justify-center gap-3 uppercase italic text-2xl text-slate-200">
                            <Users size={26} /> Comunidad
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* 📊 SECCIÓN RADAR: RANKING DE RAZAS REALES */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-orange-500 mb-6" size={48} />
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Radar de <span className="text-orange-500">Razas</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed">Tendencia de uso en torneos recientes y popularidad en la comunidad WarningDeck.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RaceRank name="Caballero" power="98%" trend="up" color="bg-blue-600" />
                        <RaceRank name="Dragón" power="92%" trend="up" color="bg-red-600" />
                        <RaceRank name="Sombra" power="85%" trend="down" color="bg-purple-600" />
                        <RaceRank name="Eterno" power="79%" trend="up" color="bg-emerald-600" />
                    </div>
                </motion.div>
            </section>

            {/* 🎥 SECCIÓN YOUTUBE: ÚLTIMOS VIDEOS DINÁMICOS */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Últimas <span className="text-orange-500">Crónicas</span></h2>
                        <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Contenido actualizado de los sabios del reino</p>
                    </div>
                    <Link to="https://www.youtube.com/@myloficial" target="_blank" className="text-orange-500 font-black flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm">Ver Canales Oficiales <Youtube size={18}/></Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <YTCard title="Sombras y Oscuridad" channelId="Sombras_y_Oscuridad" />
                    <YTCard title="MyL Oficial" channelId="myloficial" />
                </div>
            </section>

            {/* ⚖️ RECURSOS Y BANLIST */}
            <section className="bg-slate-900/30 py-32 border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ResourceBox 
                        title="Banlist Oficial"
                        desc="Consulta la lista actualizada de cartas restringidas y prohibidas para asegurar la integridad de tus duelos competitivos."
                        icon={<FileText size={48} />}
                        link="https://blog.myl.cl/banlists-actualizadas/"
                        btnText="Ver Listado"
                    />
                    <ResourceBox 
                        title="Reglamento DAR"
                        desc="El Documento de Arbitraje y Reglas (DAR) es el estándar para todo torneo oficial de Mitos y Leyendas Imperio."
                        icon={<Scale size={48} />}
                        link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view"
                        btnText="Descargar PDF"
                    />
                </div>
            </section>

            {/* 📰 NOVEDADES DEL BLOG */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex items-center gap-4 mb-12">
                    <Newspaper className="text-orange-500" size={32} />
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Novedades del <span className="text-orange-500">Blog MyL</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <NewsCard title="Balance de Metajuego: Nuevas Erratas" date="2025" category="Reglas" link="https://blog.myl.cl/" />
                    <NewsCard title="Review: KVSM Titanes" date="2025" category="Análisis" link="https://blog.myl.cl/" />
                    <NewsCard title="Nacional Imperio: Sedes confirmadas" date="2025" category="Torneo" link="https://blog.myl.cl/" />
                </div>
            </section>

            {/* 📱 FOOTER ÉPICO RESPONSIVO */}
            <footer className="bg-black py-20 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Warning<span className="text-orange-500">Deck</span></h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-6">Tu forja de mazos definitiva</p>
                        <div className="flex justify-center md:justify-start gap-8">
                            <a href="https://www.instagram.com/myl_oficial/" className="text-slate-400 hover:text-orange-500 transition-all scale-125"><Instagram /></a>
                            <a href="https://www.youtube.com/@myloficial" className="text-slate-400 hover:text-orange-500 transition-all scale-125"><Youtube /></a>
                            <a href="#" className="text-slate-400 hover:text-orange-500 transition-all scale-125"><Twitter /></a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-12 text-center md:text-right">
                        <div>
                            <h4 className="text-orange-500 font-black uppercase text-xs tracking-widest mb-4">Formato</h4>
                            <ul className="text-slate-400 space-y-2 text-sm font-bold italic">
                                <li>IMPERIO</li>
                                <li>PRIMER BLOQUE</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-orange-500 font-black uppercase text-xs tracking-widest mb-4">Legal</h4>
                            <ul className="text-slate-400 space-y-2 text-sm font-bold italic">
                                <li>TÉRMINOS</li>
                                <li>REGLAMENTO</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-20 text-[10px] text-slate-800 font-black uppercase tracking-[0.5em]">
                    WarningDeck no es una web oficial de Mitos y Leyendas.
                </div>
            </footer>
        </div>
    );
}

// --- SUBCOMPONENTES ---

function RaceRank({ name, power, trend, color }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-orange-500/50 transition-all">
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

function YTCard({ title, channelId }) {
    return (
        <div className="space-y-4 group">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest italic">{title}</h3>
                <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Último Video</span>
            </div>
            <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-black group-hover:border-orange-500/30 transition-all">
                <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed?listType=user_uploads&list=${channelId}`} 
                    title={title} frameBorder="0" allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function ResourceBox({ title, desc, icon, link, btnText }) {
    return (
        <div className="p-10 bg-slate-950/60 rounded-[3rem] border border-white/5 hover:border-orange-500/30 transition-all flex flex-col items-center text-center gap-6 group">
            <div className="text-orange-500 group-hover:scale-125 transition-transform duration-500">{icon}</div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed italic">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="px-10 py-3 bg-slate-800 hover:bg-orange-600 rounded-full font-black transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ChevronRight size={14} />
            </a>
        </div>
    );
}

function NewsCard({ title, date, category, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="group bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-orange-500 transition-all">
            <span className="text-orange-500 text-[10px] font-black tracking-widest uppercase">{category}</span>
            <h4 className="text-xl font-black mt-2 mb-6 group-hover:text-orange-400 transition-colors uppercase italic leading-tight">{title}</h4>
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
                <span>{date}</span>
                <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
        </a>
    );
}
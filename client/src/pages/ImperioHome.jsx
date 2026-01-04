import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Star, Hammer, Users, Scale, Trophy, Zap, 
    Sword, Instagram, Youtube, Twitter, Target, Crown, ChevronRight, PlayCircle, Newspaper, ArrowRight, Heart
} from "lucide-react";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

export default function ImperioHome() {
    const navigate = useNavigate();

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
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-4 md:mb-6">
                        <Zap size={32} className="text-blue-600 animate-pulse" fill="currentColor" />
                    </motion.div>
                    
                    {/* 📱 MEJORA: Título con clamp para evitar desbordamiento en móvil */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-[14vw] sm:text-[12vw] md:text-[10rem] font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic leading-[0.9] break-words"
                    >
                        ERA<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IMPERIO</span>
                    </motion.h1>

                    <motion.p {...fadeInUp} className="text-base md:text-3xl text-slate-500 dark:text-slate-300 mb-10 md:mb-12 max-w-3xl mx-auto italic font-medium leading-relaxed px-2">
                        Domina el poder del presente. El campo de batalla oficial analizado por <span className="text-blue-600 font-bold">ForjaDeck</span>.
                    </motion.p>

                    <motion.div {...fadeInUp} className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center w-full px-4">
                        <Link to="/imperio/builder" className="w-full sm:w-auto group relative px-8 md:px-14 py-5 md:py-7 bg-blue-600 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 overflow-hidden text-center">
                            <span className="relative z-10 font-black uppercase italic text-xl md:text-2xl flex items-center justify-center gap-3">
                                <Sword size={24} /> FORJAR MAZO
                            </span>
                        </Link>
                        <Link to="/community" className="w-full sm:w-auto px-8 md:px-14 py-5 md:py-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl font-black transition-all hover:bg-blue-600/10 flex items-center justify-center gap-3 uppercase italic text-xl md:text-2xl text-slate-700 dark:text-slate-200 shadow-sm text-center">
                            <Users size={24} /> COMUNIDAD
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* SECCIÓN RADAR */}
            <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10">
                <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 text-left">
                        <Target className="text-blue-600 mb-6" size={48} />
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Radar de <span className="text-blue-600">Razas</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">Tendencia de uso en torneos recientes y popularidad en la arena oficial.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RaceRank name="Caballero" power="98%" color="bg-blue-600" />
                        <RaceRank name="Dragón" power="92%" color="bg-indigo-600" />
                        <RaceRank name="Sombra" power="85%" color="bg-blue-400" />
                        <RaceRank name="Eterno" power="79%" color="bg-slate-400" />
                    </div>
                </motion.div>
            </section>

            {/* SECCIÓN ANALISTAS */}
            <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10 border-t border-slate-200 dark:border-white/5">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:after:mb-16 gap-6">
                    <div className="text-left">
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Analistas del <span className="text-blue-600">Meta</span></h2>
                        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px] italic">Contenido destacado de la comunidad</p>
                    </div>
                    <div className="flex items-center gap-4 text-red-600 font-black uppercase text-sm">
                        <Youtube size={24} /> Youtube Live
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <YTCard title="Sombras y Oscuridad" videoSrc="https://www.youtube.com/embed/z-hekxgmP2I?si=AnbR17cXSuxJfvv9" />
                    <YTCard title="Mitos y Leyendas Oficial" videoSrc="https://www.youtube.com/embed/u-am6kIUP_A?si=2oN8E5WCMWwAzN4a" />
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

function YTCard({ title, videoSrc }) {
    return (
        <div className="space-y-4 group w-full">
            <div className="flex justify-between items-center px-2 md:px-4">
                <h3 className="text-xs md:text-sm font-black text-blue-600 uppercase tracking-widest italic">{title}</h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter">Último Video</span>
            </div>
            <div className="relative pt-[56.25%] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-4 border-slate-200 dark:border-white/5 shadow-2xl bg-black group-hover:border-blue-500/30 transition-all">
                <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={videoSrc} 
                    frameBorder="0" 
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
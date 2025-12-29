import { Link } from "react-router-dom";
import { 
  Hammer, Users, FileText, Scale, Trophy, TrendingUp, 
  ChevronRight, Youtube, Newspaper, Flame, Zap, 
  Instagram, Target, Award, PlayCircle
} from "lucide-react";

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans selection:bg-orange-600 overflow-x-hidden relative">
            
            {/* ✨ EFECTO DE PARTÍCULAS DE FUEGO */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="fire-particles"></div>
            </div>

            {/* HERO SECTION PRO */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden border-b border-orange-500/10">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-600/5 via-transparent to-[#070504]"></div>
                <div className="relative z-10 text-center px-4 max-w-6xl animate-reveal">
                    <div className="flex justify-center mb-6">
                        <div className="px-6 py-2 rounded-full bg-orange-600/10 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 shadow-lg">
                            <Zap size={14} className="animate-pulse text-orange-500" /> Meta Actual: Kaiju vs Mecha Titanes
                        </div>
                    </div>
                    <h1 className="text-8xl md:text-[14rem] font-black text-white mb-4 uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                        IMPERIO
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto font-light italic">
                        Domina el presente. Accede a las estrategias de los campeones nacionales.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/imperio/builder" className="group relative px-14 py-6 bg-orange-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3 text-white">
                                <Hammer size={26} /> Crear Deck
                            </span>
                        </Link>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-orange-600/10 flex items-center justify-center gap-3 uppercase italic text-2xl">
                            <Users size={26} /> Comunidad
                        </Link>
                    </div>
                </div>
            </div>

            {/* 🎥 RADAR DE CREADORES: IMPERIO (Basado en tus links) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex items-center gap-4 mb-16">
                    <Youtube className="text-red-600" size={40} />
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter">Analistas del <span className="text-orange-500">Meta</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreatorLargeCard 
                        name="Sombras y Oscuridad" 
                        desc="Duelos en vivo, unboxings y análisis profundo del meta Imperio."
                        link="https://www.youtube.com/@Sombras_y_Oscuridad"
                        tag="Destacado Imperio"
                        color="orange"
                    />
                    <CreatorLargeCard 
                        name="Mitos y Leyendas Oficial" 
                        desc="Transmisiones de Torneos Nacionales y Premier de Imperio."
                        link="https://www.youtube.com/@myloficial"
                        tag="Canal Oficial"
                        color="orange"
                    />
                </div>
            </section>

            {/* ⚖️ ZONA COMPETITIVA */}
            <section className="bg-slate-900/30 py-32 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RuleCard title="Banlist Imperio" icon={<Trophy />} desc="Cartas prohibidas y restringidas para 2025." link="https://blog.myl.cl/banlists-actualizadas/" />
                    <RuleCard title="Reglamento DAR" icon={<Scale />} desc="Documento de Arbitraje y Reglas oficial." link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" />
                    <RuleCard title="Blog MyL" icon={<Newspaper />} desc="Novedades oficiales del reino." link="https://blog.myl.cl/" />
                </div>
            </section>

            <footer className="py-20 text-center border-t border-white/5">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">WarningDeck x Mitos y Leyendas</p>
            </footer>
        </div>
    );
}

function CreatorLargeCard({ name, desc, link, tag, color }) {
    return (
        <a href={link} target="_blank" className="group relative p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:border-orange-500/50 transition-all overflow-hidden">
            <div className="relative z-10">
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{tag}</span>
                <h3 className="text-3xl font-black uppercase italic mt-2 mb-4">{name}</h3>
                <p className="text-slate-400 mb-8 max-w-sm">{desc}</p>
                <div className="flex items-center gap-2 text-white font-bold uppercase text-xs">
                    Ver Canal <PlayCircle size={16} />
                </div>
            </div>
            <Youtube className="absolute -right-10 -bottom-10 text-white/5 group-hover:text-red-600/10 transition-colors" size={240} />
        </a>
    );
}

function RuleCard({ title, icon, desc, link }) {
    return (
        <a href={link} target="_blank" className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-orange-500 transition-all text-center group">
            <div className="text-orange-500 mb-6 flex justify-center group-hover:scale-125 transition-transform">{icon}</div>
            <h4 className="text-2xl font-black uppercase italic mb-4">{title}</h4>
            <p className="text-slate-500 text-sm">{desc}</p>
        </a>
    );
}
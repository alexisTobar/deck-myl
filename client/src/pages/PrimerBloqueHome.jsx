import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  X, Star, Hammer, Users, FileText, Scale, Trophy, 
  Youtube, Newspaper, Sword, Instagram, PlayCircle, Scroll
} from "lucide-react";

export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060912] text-white font-sans selection:bg-yellow-500 overflow-x-hidden relative">
            
            {/* ✨ EFECTO DE PARTÍCULAS DORADAS */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="gold-particles"></div>
            </div>

            {/* HERO SECTION LEGENDARIO */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden border-b border-yellow-500/10">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 via-transparent to-[#060912]"></div>
                <div className="relative z-10 text-center px-4 max-w-6xl animate-reveal">
                    <div className="flex justify-center mb-6">
                        <div className="px-6 py-2 rounded-full bg-yellow-600/10 border border-yellow-500/40 text-yellow-500 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 shadow-lg">
                            <Star size={14} className="animate-spin-slow text-yellow-500" fill="currentColor" /> Formato Clásico PB Extendido
                        </div>
                    </div>
                    <h1 className="text-8xl md:text-[11rem] font-black text-white mb-4 uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                        PRIMER BLOQUE
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto font-light italic">
                        Revive las batallas de Espada Sagrada y Helénica. El origen de todo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button onClick={() => setShowModal(true)} className="group relative px-14 py-6 bg-yellow-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3 text-black">
                                <Sword size={26} /> Forjar Mazo
                            </span>
                        </button>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl font-black transition-all hover:bg-yellow-600/10 flex items-center justify-center gap-3 uppercase italic text-2xl">
                            <Users size={26} /> Explorar Arena
                        </Link>
                    </div>
                </div>
            </div>

            {/* 📡 RADAR COMUNIDAD PB (Basado en tus creadores) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex items-center gap-4 mb-16">
                    <Youtube className="text-red-600" size={40} />
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Cronistas del <span className="text-yellow-500">Primer Bloque</span></h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PBCreatorCard name="Coliseo Mitero" tag="Torneos Raciales" link="https://www.youtube.com/@coliseomitero" />
                    <PBCreatorCard name="Elevadoh" tag="Contenido Humor & Decks" link="https://www.youtube.com/@elevadoh" />
                    <PBCreatorCard name="Dragón Dorado MyL" tag="Reviews y Análisis" link="https://www.youtube.com/@DragonDoradoMyL" />
                </div>
            </section>

            {/* 📚 RECURSOS ANCESTRALES */}
            <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5">
                <RuleCard title="Banlist PB" icon={<Trophy />} desc="Restricciones raciales actualizadas para 2025." link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" />
                <RuleCard title="Documento DAR PB" icon={<Scale />} desc="Reglas competitivas para el formato clásico." link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" />
                <RuleCard title="Blog MyL" icon={<Scroll />} desc="Relatos y noticias del formato clásico." link="https://blog.myl.cl/" />
            </section>

            <footer className="py-20 text-center border-t border-white/5 bg-black/20">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">Resguardando la Llama Clásica</p>
            </footer>
        </div>
    );
}

function PBCreatorCard({ name, tag, link }) {
    return (
        <a href={link} target="_blank" className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-yellow-500 transition-all group flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Youtube size={28} />
            </div>
            <h4 className="text-xl font-black uppercase italic mb-2">{name}</h4>
            <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">{tag}</span>
        </a>
    );
}

function RuleCard({ title, icon, desc, link }) {
    return (
        <a href={link} target="_blank" className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-yellow-500 transition-all text-center group">
            <div className="text-yellow-500 mb-6 flex justify-center group-hover:scale-125 transition-transform">{icon}</div>
            <h4 className="text-2xl font-black uppercase italic mb-4">{title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </a>
    );
}
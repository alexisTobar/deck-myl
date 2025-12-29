import { Link } from "react-router-dom";
import { 
  Hammer, Users, FileText, Scale, Trophy, TrendingUp, 
  Package, ChevronRight, Youtube, Newspaper, ExternalLink, 
  Flame, Zap, Info, Instagram, Twitter
} from "lucide-react";

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-[#070504] text-white font-sans selection:bg-orange-600 overflow-x-hidden">
            
            {/* 🐉 DRAGÓN ANIMADO DE FONDO (DISEÑO WEB) */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
                <div className="absolute top-20 -right-20 animate-float-slow">
                    <img src="https://api.myl.cl/static/cards/162/001.png" className="w-[800px] blur-[2px] rotate-12" alt="dragon" />
                </div>
                <div className="absolute -bottom-40 -left-40 animate-float-slower">
                    <img src="https://api.myl.cl/static/cards/162/003.png" className="w-[600px] blur-[3px] -rotate-12" alt="dragon" />
                </div>
            </div>

            {/* HERO SECTION - REVELACIÓN GRADUAL */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden border-b border-orange-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 max-w-5xl animate-reveal">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-600/10 border border-orange-500/30 text-orange-500 text-xs font-black uppercase tracking-[0.4em] mb-8 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <Flame size={16} className="animate-pulse" /> Master Workshop
                    </div>
                    <h1 className="text-8xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-100 to-orange-600 mb-8 uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                        IMPERIO
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light italic">
                        Domina el poder del presente. Las mecánicas más complejas en el campo de batalla oficial.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/imperio/builder" className="group relative px-12 py-6 bg-orange-600 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(234,88,12,0.3)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 font-black uppercase italic text-xl flex items-center gap-3">
                                <Hammer size={24} /> Forjar Mazo
                            </span>
                        </Link>
                        <Link to="/community" className="px-12 py-6 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl font-black transition-all hover:bg-slate-700/60 hover:scale-105 flex items-center justify-center gap-3 uppercase italic text-xl">
                            <Users size={24} /> Comunidad
                        </Link>
                    </div>
                </div>

                {/* SCROLL INDICATOR */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-1 h-12 rounded-full bg-gradient-to-b from-orange-500 to-transparent"></div>
                </div>
            </div>

            {/* SECCIÓN NOVEDADES - BLOG MYL */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                    <div className="reveal-on-scroll">
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Últimas <span className="text-orange-500">Crónicas</span></h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <Newspaper size={18} /> Feed oficial desde blog.myl.cl
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <NewsCard title="Banlist Imperio Enero 2025" category="Reglas" date="Hoy" link="https://blog.myl.cl/banlists-actualizadas/" />
                    <NewsCard title="Anuncio Nacional Imperio" category="Torneo" date="Ayer" link="https://blog.myl.cl/" />
                    <NewsCard title="Review: KVSM Titanes" category="Análisis" date="3 días" link="https://blog.myl.cl/" />
                </div>
            </section>

            {/* ZONA PRO - COMPETITIVO */}
            <section className="bg-[#0f0d0c] py-32 border-y border-orange-500/10 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter">Área de <span className="text-orange-500">Arbitraje</span></h2>
                        <p className="text-slate-400 text-xl leading-relaxed">Todo gladiador necesita conocer las leyes de la arena. Accede a los documentos oficiales de arbitraje y cartas restringidas.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ResourceLink title="Documento DAR" icon={<Scale />} link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" />
                            <ResourceLink title="Banlist Oficial" icon={<FileText />} link="https://blog.myl.cl/banlists-actualizadas/" />
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-orange-600 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <img src="https://api.myl.cl/static/cards/162/004.png" className="relative rounded-3xl border border-white/5 shadow-2xl transition-transform group-hover:-rotate-2 group-hover:scale-105 duration-500" alt="rules" />
                    </div>
                </div>
            </section>

            {/* RADAR DE COMUNIDAD - YOUTUBE */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">Radar de <span className="text-orange-500">Guerra</span></h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Influencers y Creadores de Imperio</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CreatorCard name="Caja de Cartón" type="Análisis" channel="@cajadecarton" />
                    <CreatorCard name="Torneo de Maestros" type="Meta" channel="@maestrosmyl" />
                    <CreatorCard name="Bazar de Cartas" type="Spoilers" channel="@bazardecartas" />
                    <CreatorCard name="WarningDeck" type="Estrategia" channel="Official" />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Warning<span className="text-orange-500">Deck</span></h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Tu forja de mazos definitiva</p>
                    </div>
                    <div className="flex gap-8">
                        <SocialIcon icon={<Instagram />} link="https://www.instagram.com/myl_oficial/" />
                        <SocialIcon icon={<Youtube />} link="https://www.youtube.com/@mitosyleyendasoficial" />
                        <SocialIcon icon={<Twitter />} link="#" />
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Sub-componentes Estilizados
function NewsCard({ title, category, date, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="group p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-all hover:-translate-y-2">
            <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">{category}</span>
            <h4 className="text-2xl font-black mt-3 mb-6 italic uppercase leading-tight group-hover:text-orange-400">{title}</h4>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold text-xs uppercase">{date}</span>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <ChevronRight size={18} />
                </div>
            </div>
        </a>
    );
}

function ResourceLink({ title, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
            <div className="text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-black uppercase italic tracking-tighter text-lg">{title}</span>
        </a>
    );
}

function CreatorCard({ name, type, channel }) {
    return (
        <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 text-center group hover:bg-orange-600/10 transition-all duration-500">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                <Youtube size={32} />
            </div>
            <h4 className="text-xl font-black uppercase italic mb-2">{name}</h4>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{type}</p>
            <span className="text-red-500 font-black text-sm tracking-tight">{channel}</span>
        </div>
    );
}

function SocialIcon({ icon, link }) {
    return (
        <a href={link} className="text-slate-500 hover:text-orange-500 transition-all hover:scale-125">
            {icon}
        </a>
    );
}
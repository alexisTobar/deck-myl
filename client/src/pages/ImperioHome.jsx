import { Link } from "react-router-dom";
import { 
  Hammer, Users, FileText, Scale, Trophy, TrendingUp, 
  Package, ChevronRight, Youtube, Share2, Newspaper, ExternalLink 
} from "lucide-react";

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-600">
            {/* HERO SECTION - IMPACTO VISUAL */}
            <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://api.myl.cl/static/cards/162/001.png')] bg-cover bg-fixed bg-center opacity-20 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-600/20 border border-orange-500/50 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                        <TrendingUp size={14} /> Metajuego Activo 2025
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-200 to-orange-600 mb-6 uppercase tracking-tighter italic leading-none">
                        IMPERIO
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-300 mb-10 leading-relaxed font-medium">
                        El formato definitivo de Mitos y Leyendas. Estrategia avanzada, mecánicas dinámicas y el poder de las últimas ediciones.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/imperio/builder" className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-3 uppercase italic text-lg">
                            <Hammer size={24} /> Forjar Nueva Estrategia
                        </Link>
                        <Link to="/community" className="px-10 py-5 bg-slate-800/40 backdrop-blur-md border border-slate-700 hover:bg-slate-700 rounded-2xl font-black transition-all hover:scale-105 flex items-center justify-center gap-3 uppercase italic text-lg text-slate-200">
                            <Users size={24} /> Ver Decks Globales
                        </Link>
                    </div>
                </div>
            </div>

            {/* SECCIÓN NOVEDADES - INTEGRACIÓN BLOG MYL */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex items-center gap-4 mb-12">
                    <Newspaper className="text-orange-500" size={32} />
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Últimas <span className="text-orange-500">Novedades</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <NewsCard 
                        title="Balance de Metajuego: Nuevas Erratas"
                        date="20 Dic 2024"
                        category="REGLAS"
                        link="https://blog.myl.cl/banlists-actualizadas/"
                    />
                    <NewsCard 
                        title="Anuncio Próxima Edición: Secretos del Desierto"
                        date="15 Dic 2024"
                        category="LANZAMIENTO"
                        link="https://blog.myl.cl/"
                    />
                </div>
            </section>

            {/* SECCIÓN COMPETITIVA - BANLIST Y REGLAS */}
            <section className="bg-slate-900/50 py-24 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ResourceBox 
                        title="Cartas Restringidas"
                        desc="Consulta la banlist oficial para torneos de formato Imperio."
                        icon={<FileText size={48} />}
                        link="https://blog.myl.cl/banlists-actualizadas/"
                        btnText="Ver Banlist"
                    />
                    <ResourceBox 
                        title="Reglamento DAR"
                        desc="El estándar de arbitraje para competencias de alto nivel."
                        icon={<Scale size={48} />}
                        link="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view"
                        btnText="Descargar DAR"
                    />
                </div>
            </section>

            {/* SECCIÓN CREATIVO - YOUTUBERS Y COMUNIDAD */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Estrategas de la <span className="text-orange-500">Red</span></h2>
                    <p className="text-slate-400 uppercase tracking-[0.2em] text-sm">Contenido destacado en YouTube y Redes</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <YoutubeCreator name="Caja de Cartón" subs="Imperio & Meta" channel="@cajadecarton" />
                    <YoutubeCreator name="Torneo de Maestros" subs="Análisis Pro" channel="@maestrosmyl" />
                    <YoutubeCreator name="Bazar de Cartas" subs="Nuevas Colecciones" channel="@bazardecartas" />
                </div>

                {/* SOCIAL LINKS */}
                <div className="mt-20 p-10 bg-gradient-to-r from-orange-600 to-orange-900 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-900/20">
                    <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Sigue el Juego Oficial</h3>
                        <p className="text-orange-100 font-medium">Entérate de todo en las redes de Mitos y Leyendas.</p>
                    </div>
                    <div className="flex gap-4">
                        <SocialBtn label="Instagram" link="https://www.instagram.com/myl_oficial/" />
                        <SocialBtn label="Facebook" link="https://www.facebook.com/mitosyleyendasoficial" />
                    </div>
                </div>
            </section>
        </div>
    );
}

// Sub-componentes para Imperio
function NewsCard({ title, date, category, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="group bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-orange-500 transition-all">
            <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">{category}</span>
            <h4 className="text-2xl font-black mt-2 mb-4 group-hover:text-orange-400 transition-colors uppercase italic">{title}</h4>
            <div className="flex justify-between items-center text-slate-500 text-sm">
                <span>{date}</span>
                <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
        </a>
    );
}

function ResourceBox({ title, desc, icon, link, btnText }) {
    return (
        <div className="p-10 bg-slate-950 rounded-[3rem] border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col items-start gap-6 group">
            <div className="text-orange-500 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-3xl font-black uppercase italic">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
            <a href={link} target="_blank" rel="noreferrer" className="px-8 py-3 bg-slate-800 hover:bg-orange-600 rounded-full font-black transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
                {btnText} <ExternalLink size={14} />
            </a>
        </div>
    );
}

function YoutubeCreator({ name, subs, channel }) {
    return (
        <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col items-center text-center group hover:bg-slate-800 transition-all">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <Youtube size={40} color="white" />
            </div>
            <h4 className="text-xl font-black uppercase italic">{name}</h4>
            <p className="text-slate-500 text-sm mb-4">{subs}</p>
            <span className="text-red-500 font-bold text-xs tracking-widest">{channel}</span>
        </div>
    );
}

function SocialBtn({ label, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="px-6 py-3 bg-black/30 backdrop-blur-md hover:bg-black/50 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
            {label}
        </a>
    );
}
import { Link } from "react-router-dom";
import { 
  Hammer, 
  Users, 
  FileText, 
  Scale, 
  Trophy, 
  TrendingUp, 
  Package,
  ChevronRight 
} from "lucide-react";

export default function ImperioHome() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-600">
            {/* HERO SECTION IMPERIO */}
            <div className="relative h-[650px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://api.myl.cl/static/cards/162/001.png')] bg-cover bg-fixed bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                    <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">Metajuego Actual</span>
                    <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-600 mb-6 uppercase tracking-tighter italic leading-none">
                        Imperio
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Domina el poder del presente. Las mecánicas más complejas, las ediciones más recientes y el espíritu competitivo oficial.
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <Link to="/imperio/builder" className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black shadow-[0_0_25px_rgba(234,88,12,0.4)] transition-all hover:scale-105 active:scale-95 uppercase italic flex items-center gap-2">
                            <Hammer size={20} strokeWidth={2.5} /> Crear Mazo
                        </Link>
                        <Link to="/community" className="px-10 py-4 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 rounded-xl font-black border border-slate-600 transition-all hover:scale-105 active:scale-95 uppercase italic flex items-center gap-2">
                            <Users size={20} /> Comunidad
                        </Link>
                    </div>
                </div>
            </div>

            {/* SECCIÓN RECURSOS OFICIALES */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Banlist */}
                    <div className="group relative bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-[2.5rem] border border-slate-800 hover:border-orange-500 transition-all duration-500 overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText size={160} />
                        </div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <h3 className="text-3xl font-black text-white italic uppercase">Banlist <span className="text-orange-500">Oficial</span></h3>
                            <FileText className="text-orange-500" size={40} />
                        </div>
                        <p className="text-slate-400 mb-8 text-lg relative z-10">Consulta la lista actualizada de cartas restringidas y prohibidas para asegurar la integridad de tus duelos competitivos.</p>
                        <a href="https://blog.myl.cl/banlists-actualizadas/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600/10 text-orange-500 border border-orange-600/30 rounded-full font-black hover:bg-orange-600 hover:text-white transition-all relative z-10 uppercase text-xs tracking-widest">
                            Ver Listado Actualizado <ChevronRight size={16} />
                        </a>
                    </div>

                    {/* DAR */}
                    <div className="group relative bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-[2.5rem] border border-slate-800 hover:border-orange-500 transition-all duration-500 overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scale size={160} />
                        </div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <h3 className="text-3xl font-black text-white italic uppercase">Reglamento <span className="text-orange-500">DAR</span></h3>
                            <Scale className="text-orange-500" size={40} />
                        </div>
                        <p className="text-slate-400 mb-8 text-lg relative z-10">El Documento de Arbitraje y Reglas (DAR) es el estándar para todo torneo oficial de Mitos y Leyendas Imperio.</p>
                        <a href="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600/10 text-orange-500 border border-orange-600/30 rounded-full font-black hover:bg-orange-600 hover:text-white transition-all relative z-10 uppercase text-xs tracking-widest">
                            Descargar PDF Reglas <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* SECCIÓN TORNEOS Y CREADORES */}
            <section className="bg-slate-900/30 py-24 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="text-left">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Creadores de <span className="text-orange-500">Imperio</span></h2>
                            <p className="text-slate-500 mt-4 font-medium uppercase tracking-widest text-xs">La vanguardia estratégica del metajuego.</p>
                        </div>
                        <Link to="/community" className="text-orange-500 font-bold uppercase tracking-widest hover:underline flex items-center gap-2 text-sm">
                            Ver todos los decks <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <CreatorItem name="Torneo de Maestros" desc="Análisis de los mazos ganadores de los últimos Premier." icon={<Trophy className="text-orange-500" size={32} />} />
                        <CreatorItem name="Meta MyL" desc="Estadísticas de uso y porcentajes de victoria de cada raza." icon={<TrendingUp className="text-orange-500" size={32} />} />
                        <CreatorItem name="Bazar de Cartas" desc="Revisión de spoilers y nuevas colecciones oficiales." icon={<Package className="text-orange-500" size={32} />} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function CreatorItem({ name, desc, icon }) {
    return (
        <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 hover:border-orange-500/50 transition-all group cursor-default">
            <div className="mb-6 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <h4 className="text-xl font-black mb-3 uppercase italic text-white">{name}</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
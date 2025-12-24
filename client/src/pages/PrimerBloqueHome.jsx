import { Link } from "react-router-dom";
import { 
  Shield, 
  Globe, 
  HelpCircle, 
  Zap, 
  Scale, 
  Youtube, 
  Users, 
  Instagram, 
  ChevronRight 
} from "lucide-react";

export default function PrimerBloqueHome() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-yellow-500 selection:text-black">
            {/* HERO SECTION CON EFECTO PROFUNDO */}
            <div className="relative h-[650px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp')] bg-cover bg-fixed bg-center opacity-30 scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                    <span className="text-yellow-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">Formato Clásico</span>
                    <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 mb-6 uppercase tracking-tighter italic leading-none">
                        Primer Bloque
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Regresa a las raíces de Mitos y Leyendas. Invocaciones ancestrales, dragones milenarios y la estrategia que definió una era.
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <Link to="/primer-bloque/builder" className="px-10 py-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-black shadow-[0_0_20px_rgba(202,138,4,0.4)] transition-all hover:scale-105 active:scale-95 uppercase italic flex items-center gap-2">
                            <Shield size={20} strokeWidth={2.5} /> Forjar Mazo
                        </Link>
                        <Link to="/community" className="px-10 py-4 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 rounded-xl font-black border border-slate-600 transition-all hover:scale-105 active:scale-95 uppercase italic flex items-center gap-2">
                            <Globe size={20} /> Explorar Arena
                        </Link>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DE RECURSOS PRO */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Tarjeta FAQ */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-yellow-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-yellow-500 opacity-5 group-hover:opacity-10 transition-opacity">
                            <HelpCircle size={180} />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-2xl font-black text-yellow-500 italic uppercase">FAQ Clásico</h3>
                           <HelpCircle className="text-yellow-500" size={28} />
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">¿Dudas sobre Furia, Exhumación o el daño de los Oros? Consulta el compendio oficial de reglas clásicas.</p>
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdsaGsdcxvUXKx5dufVXFJiLdRzaNkjhKBNEKCVzwIHmUm-HA/viewform" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-yellow-500 font-black hover:gap-4 transition-all uppercase text-xs tracking-widest">
                            Feedback <ChevronRight size={16} />
                        </a>
                    </div>

                    {/* Tarjeta Banlist */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-red-500 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={180} />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-red-500 italic uppercase">Restricciones</h3>
                            <Zap className="text-red-500" size={28} />
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">Mantén el juego justo. Revisa la lista de cartas prohibidas y limitadas para el formato PB Extendido.</p>
                        <a href="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-red-500 font-black hover:gap-4 transition-all uppercase text-xs tracking-widest">
                            Ver Banlist <ChevronRight size={16} />
                        </a>
                    </div>

                    {/* Tarjeta DAR */}
                    <div className="group bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scale size={180} />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-blue-500 italic uppercase">Documento DAR</h3>
                            <Scale className="text-blue-500" size={28} />
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">El reglamento oficial de arbitraje (DAR) adaptado para torneos de Primer Bloque.</p>
                        <a href="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-500 font-black hover:gap-4 transition-all uppercase text-xs tracking-widest">
                            Descargar DAR <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* SECCIÓN CREADORES DE CONTENIDO */}
            <section className="bg-slate-950/50 py-24 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Ecos de la <span className="text-yellow-500">Comunidad</span></h2>
                    <p className="text-slate-500 mb-16 max-w-xl mx-auto font-medium uppercase tracking-widest text-xs">Sigue a los maestros que mantienen viva la llama de Primer Bloque.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <CreatorCard name="Mitos y Leyendas" platform="YouTube" color="bg-red-600" icon={<Youtube size={24} />} link="https://www.youtube.com/@MitosyLeyendasOficial" />
                        <CreatorCard name="Clan del Sur" platform="Comunidad" color="bg-blue-600" icon={<Users size={24} />} link="#" />
                        <CreatorCard name="Casita del MyL" platform="Análisis" icon={<FileText size={24} />} color="bg-orange-600" link="#" />
                        <CreatorCard name="Nostalgia MyL" platform="Instagram" icon={<Instagram size={24} />} color="bg-purple-600" link="#" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function CreatorCard({ name, platform, color, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="group p-6 bg-slate-900/50 rounded-3xl border border-slate-800 hover:-translate-y-2 transition-all">
            <div className={`w-12 h-12 ${color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform text-white`}>
                {icon}
            </div>
            <h4 className="font-black text-white text-sm uppercase italic">{name}</h4>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{platform}</span>
        </a>
    );
}
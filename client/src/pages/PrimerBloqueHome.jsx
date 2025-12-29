import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  X, Star, Hammer, Users, FileText, Scale, Trophy, 
  ChevronRight, Youtube, Newspaper, ExternalLink, 
  Scroll, Sword, Instagram, Twitter 
} from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/espada_sagrada.png" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/helenica.png" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/hijos_de_daana.png" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-orange-900", img: "https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp@main/dominios_de_ra.png" }
];

export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060912] text-white font-sans selection:bg-yellow-500 overflow-x-hidden">
            
            {/* 🐉 DRAGÓN ANIMADO DE FONDO (DISEÑO WEB) */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
                <div className="absolute top-20 -right-20 animate-float-slow">
                    <img src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" className="w-[800px] blur-[2px] rotate-12" alt="dragon" />
                </div>
                <div className="absolute -bottom-40 -left-40 animate-float-slower">
                    <img src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es23.webp" className="w-[600px] blur-[3px] -rotate-12" alt="dragon" />
                </div>
            </div>

            {/* HERO SECTION */}
            <div className="relative h-screen flex items-center justify-center overflow-hidden border-b border-yellow-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent"></div>
                
                <div className="relative z-10 text-center px-4 max-w-5xl animate-reveal">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-600/10 border border-yellow-500/30 text-yellow-500 text-xs font-black uppercase tracking-[0.4em] mb-8 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        <Scroll size={16} className="animate-pulse" /> Formato Clásico
                    </div>
                    <h1 className="text-8xl md:text-[11rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-yellow-600 mb-8 uppercase tracking-tighter italic leading-none drop-shadow-2xl">
                        PRIMER BLOQUE
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light italic">
                        "Donde la leyenda comenzó." Revive la gloria de las primeras ediciones de Mitos y Leyendas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button onClick={() => setShowModal(true)} className="group relative px-12 py-6 bg-yellow-600 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(202,138,4,0.3)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 font-black uppercase italic text-xl flex items-center gap-3 text-black">
                                <Sword size={24} /> Entrar a la Forja
                            </span>
                        </button>
                        <Link to="/community" className="px-12 py-6 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl font-black transition-all hover:bg-slate-700/60 hover:scale-105 flex items-center justify-center gap-3 uppercase italic text-xl text-white">
                            <Users size={24} /> Explorar Arena
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-1 h-12 rounded-full bg-gradient-to-b from-yellow-500 to-transparent"></div>
                </div>
            </div>

            {/* SECCIÓN NOVEDADES */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Últimos <span className="text-yellow-500">Relatos</span></h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <Newspaper size={18} /> Crónicas de Primer Bloque
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <NewsCard title="Banlist PB Racial 2025" category="Reglas" date="Hoy" link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" />
                    <NewsCard title="Torneo Épico: El Regreso del Dragón" category="Evento" date="Ayer" link="https://blog.myl.cl/" />
                    <NewsCard title="Estrategias: Espada Sagrada Meta" category="Análisis" date="4 días" link="https://blog.myl.cl/" />
                </div>
            </section>

            {/* ZONA PRO - COMPETITIVO */}
            <section className="bg-[#090d16] py-32 border-y border-yellow-500/10 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter">Sabiduría <span className="text-yellow-500">Ancestral</span></h2>
                        <p className="text-slate-400 text-xl leading-relaxed">Las reglas originales adaptadas al juego moderno. Descarga los reglamentos y consulta la banlist racial de PB.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ResourceLink title="Documento DAR PB" icon={<Scale />} link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" />
                            <ResourceLink title="Banlist Racial" icon={<Trophy />} link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" />
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-yellow-600 rounded-3xl blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <img src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" className="relative rounded-3xl border border-white/5 shadow-2xl transition-transform group-hover:rotate-2 group-hover:scale-105 duration-500" alt="classic" />
                    </div>
                </div>
            </section>

            {/* RADAR DE COMUNIDAD */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">Cronistas <span className="text-yellow-500">Legendarios</span></h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Cargadores de la llama clásica</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CreatorCard name="Academia MyL" type="Tutoriales" channel="@academia" color="yellow" />
                    <CreatorCard name="El Meta Clásico" type="Análisis" channel="@elmeta" color="yellow" />
                    <CreatorCard name="Santuario MyL" type="Nostalgia" channel="@santuario" color="yellow" />
                    <CreatorCard name="WarningDeck PB" type="Forja" channel="Official" color="yellow" />
                </div>
            </section>

            {/* MODAL DE SELECCIÓN */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                    <div className="bg-[#0c111d] border border-yellow-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="text-center mb-10">
                            <Star className="mx-auto text-yellow-500 mb-4 animate-spin-slow" fill="currentColor" size={40} />
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-yellow-500 leading-none">Inicia tu Leyenda</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Selecciona la edición que despertará tu poder</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MAIN_EDITIONS.map((ed) => (
                                <button key={ed.id} onClick={() => navigate("/primer-bloque/builder", { state: { initialEdition: ed.id } })} className="relative h-32 rounded-2xl overflow-hidden group border border-white/10 hover:border-yellow-500 transition-all shadow-2xl">
                                    <img src={ed.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} mix-blend-multiply opacity-70`}></div>
                                    <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl tracking-widest drop-shadow-xl">{ed.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="bg-black py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Warning<span className="text-yellow-500">Deck</span></h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Resguardando la llama de Primer Bloque</p>
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

// Reutilizamos componentes NewsCard, ResourceLink, CreatorCard con leves cambios de color
function NewsCard({ title, category, date, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="group p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-2">
            <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">{category}</span>
            <h4 className="text-2xl font-black mt-3 mb-6 italic uppercase leading-tight group-hover:text-yellow-400">{title}</h4>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold text-xs uppercase">{date}</span>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-yellow-600 transition-colors group-hover:text-black">
                    <ChevronRight size={18} />
                </div>
            </div>
        </a>
    );
}

function ResourceLink({ title, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
            <div className="text-yellow-500 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-black uppercase italic tracking-tighter text-lg">{title}</span>
        </a>
    );
}

function CreatorCard({ name, type, channel }) {
    return (
        <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 text-center group hover:bg-yellow-600/10 transition-all duration-500">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                <Youtube size={32} />
            </div>
            <h4 className="text-xl font-black uppercase italic mb-2">{name}</h4>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{type}</p>
            <span className="text-yellow-500 font-black text-sm tracking-tight">{channel}</span>
        </div>
    );
}

function SocialIcon({ icon, link }) {
    return (
        <a href={link} className="text-slate-500 hover:text-yellow-500 transition-all hover:scale-125">
            {icon}
        </a>
    );
}
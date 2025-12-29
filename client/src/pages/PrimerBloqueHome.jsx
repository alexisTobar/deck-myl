import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  X, Star, Hammer, Users, Scale, Trophy, Sword, PlayCircle,
  TrendingUp, Scroll, Crown, ChevronRight, Youtube
} from "lucide-react";

// ✅ Animaciones Locales
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

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
        <div className="min-h-screen bg-[#060912] text-white font-sans overflow-x-hidden selection:bg-yellow-500 relative">
            
            {/* 🐉 DRAGÓN PB DE FONDO */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" 
                    className="w-full h-full object-cover" 
                />
            </div>

            {/* HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center border-b border-yellow-500/10">
                <div className="relative z-10 text-center px-4 max-w-6xl">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center gap-2 mb-6">
                        <Star size={32} fill="#eab308" className="text-yellow-500 animate-pulse" />
                    </motion.div>
                    
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-[11rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_0_40px_rgba(234,179,8,0.4)]">
                        PRIMER BLOQUE
                    </motion.h1>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-12">
                        <button onClick={() => setShowModal(true)} className="px-14 py-7 bg-yellow-600 hover:bg-yellow-500 text-black rounded-2xl font-black text-2xl flex items-center gap-3 transition-all hover:scale-110 shadow-2xl shadow-yellow-600/20">
                            <Sword size={28} /> ENTRAR A LA FORJA
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* 🏛️ HALL OF HEROES: DECKS PB */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Hall of <span className="text-yellow-500">Heroes</span></h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs italic">Decks raciales que han marcado historia</p>
                    </div>
                    <Link to="/community" className="text-yellow-500 font-black flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm">Explorar Arena <TrendingUp size={16}/></Link>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DeckVotadoCardPB title="Caballero Blitz" author="OldSchoolKing" votes="2.5k" color="border-yellow-500" />
                    <DeckVotadoCardPB title="Dragón Control" author="DragonMaster" votes="1.8k" color="border-red-600" />
                    <DeckVotadoCardPB title="Sombras Eternas" author="PB_Lover" votes="1.5k" color="border-blue-900" />
                </div>
            </section>

            {/* 📡 CRONISTAS YOUTUBE PB (Tus links) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 border-t border-white/5">
                <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-16">Sabios del <span className="text-yellow-500">Relato</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CreatorCardPB name="Coliseo Mitero" link="https://www.youtube.com/@coliseomitero" />
                    <CreatorCardPB name="Elevadoh" link="https://www.youtube.com/@elevadoh" />
                    <CreatorCardPB name="Dragon Dorado" link="https://www.youtube.com/@DragonDoradoMyL" />
                </div>
            </section>

            {/* 📚 RECURSOS */}
            <section className="bg-slate-950/50 py-32 border-y border-yellow-500/10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ResourceCardPB title="Banlist Racial" icon={<Trophy />} link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" />
                    <ResourceCardPB title="Reglamento DAR" icon={<Scroll />} link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" />
                </div>
            </section>

            {/* MODAL DE EDICIÓN (Visible al hacer clic) */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                    <div className="bg-[#0c111d] border border-yellow-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={32} /></button>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-yellow-500 text-center mb-10">Inicia tu Leyenda</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MAIN_EDITIONS.map((ed) => (
                                <button key={ed.id} onClick={() => navigate("/primer-bloque/builder", { state: { initialEdition: ed.id } })} className="relative h-32 rounded-2xl overflow-hidden group border border-white/10 hover:border-yellow-500 transition-all">
                                    <img src={ed.img} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${ed.color} opacity-60`}></div>
                                    <div className="relative h-full flex items-center justify-center font-black uppercase italic text-xl">{ed.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DeckVotadoCardPB({ title, author, votes, color }) {
    return (
        <motion.div whileHover={{ scale: 1.05 }} className={`bg-[#0a0d14] p-8 rounded-[2.5rem] border-l-4 ${color} relative overflow-hidden group shadow-2xl`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity"><Crown size={60} /></div>
            <h4 className="text-2xl font-black uppercase italic mb-2 text-white">{title}</h4>
            <p className="text-slate-500 font-bold mb-6 text-sm">Maestro: {author}</p>
            <div className="text-yellow-500 font-black text-2xl uppercase italic flex items-center gap-2"><Star size={20} fill="currentColor" /> {votes}</div>
        </motion.div>
    );
}

function CreatorCardPB({ name, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-yellow-600/10 transition-all">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><PlayCircle size={24} /></div>
            <h4 className="text-xl font-black uppercase italic">{name}</h4>
        </a>
    );
}

function ResourceCardPB({ title, icon, link }) {
    return (
        <a href={link} target="_blank" rel="noreferrer" className="p-12 bg-white/5 rounded-[3rem] border border-white/10 hover:border-yellow-500 transition-all text-center group block">
            <div className="text-yellow-500 mb-6 flex justify-center group-hover:scale-125 transition-transform">{icon}</div>
            <h4 className="text-3xl font-black uppercase italic">{title}</h4>
        </a>
    );
}
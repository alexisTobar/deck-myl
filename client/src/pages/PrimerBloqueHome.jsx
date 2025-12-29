import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  X, Star, Hammer, Users, Scale, Trophy, Sword, PlayCircle,
  TrendingUp, Scroll, Eye, Crown, Target, BookOpen
} from "lucide-react";

// Estructura idéntica, pero con identidad PB
export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060912] text-white font-sans overflow-x-hidden selection:bg-yellow-500">
            
            {/* 🐉 FONDO LEYENDA */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                <motion.img 
                    animate={{ scale: [1, 1.05, 1], rotate: [-2, 0, -2] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" 
                    className="w-full h-full object-cover" 
                />
            </div>

            {/* HERO SECTION PB (1er Scroll) */}
            <section className="relative h-screen flex items-center justify-center border-b border-yellow-500/10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center px-4 max-w-6xl">
                    <div className="flex justify-center gap-2 mb-6">
                        <Star size={24} fill="#eab308" className="text-yellow-500 animate-pulse" />
                    </div>
                    <h1 className="text-7xl md:text-[11rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_0_40px_rgba(234,179,8,0.4)]">
                        PRIMER BLOQUE
                    </h1>
                    <p className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto italic font-light">"Donde la leyenda comenzó." Revive el origen de Mitos y Leyendas.</p>
                    <div className="flex justify-center">
                        <button onClick={() => setShowModal(true)} className="px-14 py-7 bg-yellow-600 rounded-2xl font-black text-2xl flex items-center gap-3 hover:scale-110 transition-all text-black shadow-yellow-600/20 shadow-2xl">
                            <Sword size={28} /> ENTRAR A LA FORJA
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* 🏛️ HALL OF HEROES: DECKS PB (2do Scroll) */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Hall of <span className="text-yellow-500">Heroes</span></h2>
                        <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs italic">Decks raciales que han marcado historia</p>
                    </div>
                    <Link to="/community" className="text-yellow-500 font-black flex items-center gap-2 uppercase text-sm">Explorar Arena <TrendingUp size={16}/></Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DeckVotadoCardPB title="Caballero Blitz" author="OldSchoolKing" votes="2.5k" color="border-yellow-500" />
                    <DeckVotadoCardPB title="Dragón Control" author="DragonMaster" votes="1.8k" color="border-red-600" />
                    <DeckVotadoCardPB title="Sombras Eternas" author="PB_Lover" votes="1.5k" color="border-blue-900" />
                </div>
            </section>

            {/* 🏺 ANCIENT ARTIFACTS: CARTAS PB (3er Scroll) */}
            <section className="bg-blue-950/20 py-32 border-y border-yellow-500/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-16 text-center">Cartas <span className="text-yellow-500">Icónicas</span> PB</h2>
                    <div className="flex flex-wrap justify-center gap-12 opacity-80">
                        <TopCardImgPB url="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" name="Legendaria 1" />
                        <TopCardImgPB url="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es23.webp" name="Legendaria 2" />
                        <TopCardImgPB url="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es12.webp" name="Legendaria 3" />
                    </div>
                </div>
            </section>

            {/* 📡 CRONISTAS Y REGLAS (4to Scroll) */}
            <section className="max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-6">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-10">Sabios del <span className="text-yellow-500">Relato</span></h2>
                        <CreatorItemPB name="Coliseo Mitero" channel="@coliseomitero" />
                        <CreatorItemPB name="Elevadoh" channel="@elevadoh" />
                        <CreatorItemPB name="Dragon Dorado MyL" channel="@DragonDoradoMyL" />
                    </div>
                    <div className="bg-[#0c111d] p-12 rounded-[3rem] border border-yellow-500/20 flex flex-col justify-center">
                        <Scroll className="text-yellow-500 mb-6" size={48} />
                        <h3 className="text-4xl font-black uppercase italic mb-6">Leyes Ancestrales</h3>
                        <p className="text-slate-400 text-lg mb-8 italic leading-relaxed">Consulta la Banlist Racial y el DAR Clásico para mantener la esencia del juego original en cada duelo.</p>
                        <div className="flex flex-wrap gap-4">
                            <a href="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" className="px-8 py-4 bg-yellow-600 rounded-xl font-black text-black uppercase text-xs italic">Ver Banlist</a>
                            <a href="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" className="px-8 py-4 bg-slate-800 rounded-xl font-black text-white uppercase text-xs italic">Descargar DAR</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Componentes PB
function DeckVotadoCardPB({ title, author, votes, color }) {
    return (
        <motion.div whileHover={{ y: -10 }} className={`bg-[#0a0d14] p-8 rounded-[2.5rem] border-l-4 ${color} relative overflow-hidden group shadow-2xl`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity"><Star size={60} /></div>
            <h4 className="text-2xl font-black uppercase italic mb-2 text-white">{title}</h4>
            <p className="text-slate-500 font-bold mb-6 text-sm italic">Maestro: {author}</p>
            <div className="flex items-center gap-4 text-yellow-500">
                < स्टार size={20} fill="currentColor" />
                <span className="font-black text-2xl">{votes}</span>
                <span className="text-slate-600 uppercase text-[10px] font-black tracking-widest">Respeto Ganado</span>
            </div>
        </motion.div>
    );
}

function TopCardImgPB({ url, name }) {
    return (
        <motion.div whileHover={{ scale: 1.1, rotate: -2 }} className="w-56 relative group cursor-pointer shadow-yellow-500/10 shadow-2xl">
            <img src={url} className="rounded-xl border border-white/5 group-hover:border-yellow-500 transition-all" alt={name} />
        </motion.div>
    );
}

function CreatorItemPB({ name, channel }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-yellow-600/10 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"><PlayCircle size={24} /></div>
                <div>
                    <h4 className="font-black uppercase italic">{name}</h4>
                    <p className="text-yellow-500 text-xs font-bold">{channel}</p>
                </div>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-yellow-500" />
        </div>
    );
}
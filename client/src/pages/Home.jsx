import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ✅ IMPORTACIÓN PARA GRÁFICOS PROFESIONALES
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import BACKEND_URL from "../config";
import { 
    Sword, ScrollText, Zap, TrendingUp, ShieldCheck, Users, ArrowRight, Heart, Star, 
    ShoppingBag, Instagram, ExternalLink, PlusCircle, X, Camera, Sparkles, UserPlus, BarChart3, LayoutGrid, Lock, AlertTriangle, ShieldAlert, ImageOff
} from "lucide-react";
import { toast } from "sonner";

export default function HomePortal() {
    const navigate = useNavigate();
    const [pbTrending, setPbTrending] = useState([]);
    const [impTrending, setImpTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState([]);
    const [selectedMetaCard, setSelectedMetaCard] = useState(null);
    const [showMetaModal, setShowMetaModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [newPlayerData, setNewPlayerData] = useState({ name: "", instagram: "", logo: "" });

    // ✅ ESTADO PARA CARTAS RESTRINGIDAS
    const [bannedCards, setBannedCards] = useState([]);
    const carouselRef = useRef(null);

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";

    useEffect(() => {
        const fetchTrendingData = async () => {
            setLoading(true);
            try {
                // 1. Cargar estadísticas Top 10 (USAMOS ESTE MISMO FLUJO PARA LAS RESTRINGIDAS)
                const resPb = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=primer_bloque`);
                if (resPb.ok) {
                    const dataPb = await resPb.json();
                    const filteredPb = dataPb.filter(c => c.format === 'primer_bloque');
                    setPbTrending(filteredPb.slice(0, 10));

                    // ✅ REPARACIÓN MESTRA: Sacamos las restringidas de la misma data que el Top 10
                    // Así nos aseguramos que si la imagen se ve abajo, se vea arriba también.
                    const restricted = filteredPb.filter(c => c.restriction && c.restriction !== "none");
                    setBannedCards(restricted);
                }

                const resImp = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=imperio`);
                if (resImp.ok) {
                    const dataImp = await resImp.json();
                    setImpTrending(dataImp.filter(c => c.format === 'imperio').slice(0, 10));
                }
            } catch (error) { 
                console.error("Error stats:", error); 
            } finally { 
                setLoading(false); 
            }
        };

        const fetchPlayers = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/community-links`);
                if (res.ok) setPlayers(await res.json());
            } catch (error) { console.error(error); }
        };

        fetchTrendingData();
        fetchPlayers();
    }, []);

    const getRestrictionLabel = (type) => {
        if (type === "banned" || type === "prohibited") return { text: "Prohibida", color: "bg-red-600" };
        if (type === "limited1") return { text: "1 Copia", color: "bg-orange-600" };
        if (type === "limited2") return { text: "2 Copias", color: "bg-yellow-500 text-black" };
        return { text: "Restringida", color: "bg-slate-700" };
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#06080F] text-slate-900 dark:text-white pb-20 transition-colors duration-500 overflow-x-hidden">
            
            {/* HERO SECTION */}
            <header className="w-full max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
                <div className="flex justify-center mb-8 px-4">
                    <img src={LOGO_NEGRO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain dark:hidden" />
                    <img src={LOGO_BLANCO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain hidden dark:block" />
                </div>
            </header>

            {/* BOTONES FORMATO */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                <FormatCard title="Primer Bloque" onClick={() => navigate("/primer-bloque")} img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?quality=70&width=1200" icon={<ScrollText />} />
                <FormatCard title="Imperio" onClick={() => navigate("/imperio")} img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg" icon={<Sword />} />
            </div>

            {/* ✅ SECCIÓN REPARADA: CARRUSEL DE BANEADAS (ARRIBA DEL TOP 10) */}
            {bannedCards.length > 0 && (
                <section className="w-full mb-24 py-12 bg-slate-100/50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6 mb-10 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} />
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                            Restricciones <span className="text-blue-600">Oficiales</span>
                        </h3>
                    </div>
                    
                    <div className="relative flex overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={carouselRef}>
                        <motion.div 
                            className="flex gap-8"
                            drag="x"
                            dragConstraints={carouselRef}
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        >
                            {/* Renderizamos las cartas una a una desde la base de datos */}
                            {[...bannedCards, ...bannedCards].map((card, i) => {
                                const label = getRestrictionLabel(card.restriction);
                                return (
                                    <div key={`${card._id}-${i}`} className="w-44 md:w-60 shrink-0 select-none">
                                        <div className="relative group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 aspect-[3/4.2]">
                                            <img 
                                                src={card.imgUrl || card.img} 
                                                className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110" 
                                                alt={card.name} 
                                                onError={(e) => { e.target.src = "https://placehold.co/300x420/1e293b/white?text=Cargando..."; }}
                                            />
                                            <div className={`absolute top-4 right-4 px-3 py-1.5 ${label.color} text-white text-[9px] font-black uppercase rounded-xl shadow-xl z-10 border border-white/20`}>
                                                {label.text}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 text-center pointer-events-none">
                                                <p className="text-white text-xs font-black uppercase italic tracking-tighter leading-none">{card.name}</p>
                                                <p className="text-blue-400 text-[8px] font-bold uppercase mt-2 tracking-widest">{card.edition?.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* TOP 10 PB */}
            <section className="max-w-7xl mx-auto px-6 mb-24">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <TrendingUp className="text-blue-600" />
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Top 10 Primer Bloque</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {pbTrending.map((card, i) => (
                        <MetaCard key={i} card={card} index={i} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                    ))}
                </div>
            </section>

            {/* ... EL RESTO DEL CÓDIGO (TOP 10 IMPERIO, VIKINGOS, ETC) SE MANTIENE IGUAL ... */}
            <section className="max-w-7xl mx-auto px-6 mb-32 text-center md:text-left">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <TrendingUp className="text-blue-500" />
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Top 10 Imperio</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                    {impTrending.map((card, idx) => (
                        <MetaCard key={`imp-${idx}`} card={card} index={idx} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                    ))}
                </div>
            </section>
        </div>
    );
}

// COMPONENTES AUXILIARES
function MetaCard({ card, index, onClick }) {
    return (
        <motion.div whileHover={{ y: -8, scale: 1.02 }} onClick={onClick} className="cursor-pointer group bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl transition-all duration-500 text-center">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative shadow-inner">
                <img src={card.imgUrl || card.img} className="w-full h-full object-cover group-hover:scale-110" alt="card" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-lg">#{index + 1}</div>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase mb-1">{card.name}</h4>
        </motion.div>
    );
}

function FormatCard({ title, onClick, img, icon }) {
    return (
        <div onClick={onClick} className="group cursor-pointer relative h-64 md:h-80 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl transition-all">
            <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="format" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl mb-4 w-fit border border-white/10">{icon}</div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{title}</h2>
            </div>
        </div>
    );
}
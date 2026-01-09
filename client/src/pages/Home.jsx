import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import BACKEND_URL from "../config";
import { 
    Sword, ScrollText, Zap, TrendingUp, ShieldCheck, Users, ArrowRight, Heart, Star, 
    ShoppingBag, Instagram, ExternalLink, PlusCircle, X, Camera, Sparkles, UserPlus, BarChart3, LayoutGrid, Lock, ShieldAlert, ImageOff
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

    // ✅ ESTADO PARA LAS CARTAS BANEADAS
    const [bannedCards, setBannedCards] = useState([]);
    const carouselRef = useRef(null);

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                // 1. Cargar estadísticas Top 10
                const [resPb, resImp] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/decks/stats/meta?format=primer_bloque`),
                    fetch(`${BACKEND_URL}/api/decks/stats/meta?format=imperio`)
                ]);

                if (resPb.ok) setPbTrending((await resPb.json()).slice(0, 10));
                if (resImp.ok) setImpTrending((await resImp.json()).slice(0, 10));

                // ✅ 2. CARGAR CARTAS RESTRINGIDAS (INTENTO DOBLE)
                // Intentamos primero con el buscador que usas en el constructor
                let resCards = await fetch(`${BACKEND_URL}/api/cards/search?format=primer_bloque&limit=1000`);
                
                if (!resCards.ok) {
                    // Si falla, intentamos el endpoint general
                    resCards = await fetch(`${BACKEND_URL}/api/cards?format=primer_bloque`);
                }

                if (resCards.ok) {
                    const data = await resCards.json();
                    const rawCards = Array.isArray(data) ? data : (data.results || data.cards || []);
                    
                    // Filtramos exactamente como en tu constructor
                    const filtered = rawCards.filter(c => 
                        c.restriction && 
                        c.restriction !== "none" && 
                        c.restriction !== ""
                    );
                    
                    console.log("DEBUG: Cartas encontradas en total:", rawCards.length);
                    console.log("DEBUG: Cartas con restricción:", filtered.length);
                    
                    setBannedCards(filtered);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const getCardRestrictionStyle = (card) => {
        if (card.restriction === "banned") return { filter: "grayscale(100%)", label: "PROHIBIDA", color: "bg-red-600" };
        if (card.restriction === "limited1") return { filter: "none", label: "1 COPIA", color: "bg-orange-600" };
        if (card.restriction === "limited2") return { filter: "none", label: "2 COPIAS", color: "bg-yellow-500 text-black" };
        return { filter: "none", label: "RESTRINGIDA", color: "bg-slate-700" };
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#06080F] text-slate-900 dark:text-white pb-20 transition-colors duration-500 overflow-x-hidden">
            
            {/* HERO SECTION */}
            <header className="w-full max-w-7xl mx-auto px-6 pt-20 pb-12 text-center animate-in fade-in duration-1000">
                <div className="flex justify-center mb-8 px-4">
                    <img src={LOGO_NEGRO} alt="Logo" className="w-[85vw] max-w-[500px] h-auto dark:hidden" />
                    <img src={LOGO_BLANCO} alt="Logo" className="w-[85vw] max-w-[500px] h-auto hidden dark:block" />
                </div>
            </header>

            {/* BOTONES FORMATO */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                <FormatCard title="Primer Bloque" onClick={() => navigate("/primer-bloque")} img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?quality=70&width=1200" icon={<ScrollText />} />
                <FormatCard title="Imperio" onClick={() => navigate("/imperio")} img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg" icon={<Sword />} />
            </div>

            {/* ✅ CARRUSEL DE BANEADAS (OBLIGATORIO ARRIBA DEL TOP 10) */}
            <section className="w-full mb-24 py-12 bg-slate-100/50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-10 flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Lista de <span className="text-red-600">Restricciones DAR</span></h3>
                </div>
                
                <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={carouselRef}>
                    <motion.div 
                        className="flex gap-8 w-max"
                        drag="x"
                        dragConstraints={carouselRef}
                        animate={bannedCards.length > 0 ? { x: ["0%", "-50%"] } : {}}
                        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    >
                        {bannedCards.length > 0 ? (
                            [...bannedCards, ...bannedCards].map((card, i) => {
                                const style = getCardRestrictionStyle(card);
                                return (
                                    <div key={`${card._id}-${i}`} className="w-44 md:w-60 shrink-0 select-none">
                                        <div className="relative group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 aspect-[3/4.2]">
                                            <img 
                                                src={card.imgUrl || card.img} 
                                                style={{ filter: style.filter }}
                                                className="w-full h-full object-cover pointer-events-none transition-transform group-hover:scale-110 duration-700" 
                                                alt={card.name} 
                                                onError={(e) => { e.target.src = "https://placehold.co/300x420/1e293b/white?text=Imagen+No+Cargada"; }}
                                            />
                                            <div className={`absolute top-4 right-4 px-3 py-1.5 ${style.color} text-white text-[9px] font-black uppercase rounded-xl shadow-xl z-10 border border-white/20`}>
                                                {style.label}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 text-center pointer-events-none">
                                                <p className="text-white text-xs font-black uppercase italic tracking-tighter leading-none">{card.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            /* Loader mientras Mongo responde */
                            <div className="w-full flex justify-center items-center py-20 gap-4 text-slate-400">
                                <Sparkles className="animate-spin" />
                                <p className="font-black uppercase text-xs tracking-widest">Buscando cartas en la base de datos...</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

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
        </div>
    );
}

// ... (MetaCard y FormatCard iguales abajo)
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
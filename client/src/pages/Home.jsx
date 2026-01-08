import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import BACKEND_URL from "../config";
import { 
    Sword, ScrollText, Zap, TrendingUp, ShieldCheck, Users, ArrowRight, Heart, Star, 
    ShoppingBag, Instagram, ExternalLink, PlusCircle, X, Camera, Sparkles, UserPlus, BarChart3, LayoutList, Lock, ShieldAlert, ImageOff
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

    // ✅ ESTADO PARA LAS CARTAS RESTRINGIDAS CARGADAS DESDE MONGO
    const [bannedCards, setBannedCards] = useState([]);
    const carouselRef = useRef(null);

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";

    const RACE_COLORS = {
        "Caballero": "#3b82f6", "Dragón": "#ef4444", "Sombra": "#a855f7", 
        "Eterno": "#10b981", "Guerrero": "#f59e0b", "Faerie": "#ec4899",
        "Sacerdote": "#06b6d4", "Bestia": "#84cc16", "Héroe": "#f97316"
    };

    // ✅ EFECTO PARA CARGAR TODO EL CONTENIDO
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

                // ✅ 2. CARGAR CARTAS RESTRINGIDAS (LÓGICA DEL CONSTRUCTOR)
                const resCards = await fetch(`${BACKEND_URL}/api/cards/search?format=primer_bloque`);
                if (resCards.ok) {
                    const data = await resCards.json();
                    // Importante: Verificamos si los datos vienen en 'results' o son el array directo
                    const rawCards = Array.isArray(data) ? data : (data.results || []);
                    
                    // Filtramos exactamente por el campo 'restriction' que me pasaste del JSON
                    const filtered = rawCards.filter(c => 
                        c.restriction && 
                        c.restriction !== "none" && 
                        c.restriction !== ""
                    );
                    setBannedCards(filtered);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
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

        fetchHomeData();
        fetchPlayers();
    }, []);

    // ✅ LÓGICA VISUAL DE RESTRICCIÓN
    const getCardRestrictionStyle = (card) => {
        if (card.restriction === "banned") return { filter: "grayscale(100%)", label: "PROHIBIDA", color: "bg-red-600" };
        if (card.restriction === "limited1") return { filter: "none", label: "1 COPIA", color: "bg-orange-600" };
        if (card.restriction === "limited2") return { filter: "none", label: "2 COPIAS", color: "bg-yellow-500 text-black" };
        return { filter: "none", label: "RESTRINGIDA", color: "bg-blue-600" };
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#06080F] text-slate-900 dark:text-white pb-20 transition-colors duration-500 overflow-x-hidden">
            
            {/* HERO SECTION */}
            <header className="w-full max-w-7xl mx-auto px-6 pt-20 pb-12 text-center animate-in fade-in duration-1000">
                <div className="flex justify-center mb-8 px-4">
                    <img src={LOGO_NEGRO} alt="Logo" className="w-[85vw] max-w-[500px] h-auto dark:hidden" />
                    <img src={LOGO_BLANCO} alt="Logo" className="w-[85vw] max-w-[500px] h-auto hidden dark:block" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium italic opacity-80 px-4">Optimización de estrategias basada en el análisis de datos masivos.</p>
            </header>

            {/* BOTONES FORMATO */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                <FormatCard title="Primer Bloque" onClick={() => navigate("/primer-bloque")} img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?quality=70&width=1200" icon={<ScrollText />} />
                <FormatCard title="Imperio" onClick={() => navigate("/imperio")} img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg" icon={<Sword />} />
            </div>

            {/* ✅ CARRUSEL DE RESTRICCIONES (DRAG MANIPULABLE) */}
            {bannedCards.length > 0 && (
                <section className="w-full mb-24 py-12 bg-slate-100/50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 mb-10 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} />
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Lista de <span className="text-red-600">Restricciones DAR</span></h3>
                    </div>
                    
                    <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={carouselRef}>
                        <motion.div 
                            className="flex gap-8"
                            drag="x"
                            dragConstraints={carouselRef}
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        >
                            {/* Renderizamos las cartas de la base de datos duplicadas para el loop infinito */}
                            {[...bannedCards, ...bannedCards].map((card, i) => {
                                const style = getCardRestrictionStyle(card);
                                return (
                                    <div key={`${card._id}-${i}`} className="w-44 md:w-56 shrink-0 select-none">
                                        <div className="relative group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 aspect-[3/4.2]">
                                            <img 
                                                src={card.imgUrl || card.img} 
                                                style={{ filter: style.filter }}
                                                className="w-full h-full object-cover pointer-events-none transition-transform group-hover:scale-110 duration-700" 
                                                alt={card.name} 
                                                onError={(e) => { e.target.src = "https://placehold.co/300x420/1e293b/white?text=Cargando..."; }}
                                            />
                                            <div className={`absolute top-4 right-4 px-3 py-1.5 ${style.color} text-white text-[9px] font-black uppercase rounded-xl shadow-xl z-10 border border-white/20`}>
                                                {style.label}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-6 text-center pointer-events-none">
                                                <p className="text-white text-xs font-black uppercase italic tracking-tighter leading-none">{card.name}</p>
                                                <p className="text-blue-500 text-[8px] font-bold uppercase mt-2 tracking-widest">{card.edition?.replace('_', ' ')}</p>
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

            {/* TOP 10 IMPERIO */}
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

            {/* MODAL DETALLES */}
            <AnimatePresence>
                {showMetaModal && selectedMetaCard && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMetaModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
                            <button onClick={() => setShowMetaModal(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-white z-10"><X/></button>
                            <div className="p-8 md:p-12 bg-slate-50 dark:bg-black/20 flex justify-center items-center">
                                <img src={selectedMetaCard.imgUrl || selectedMetaCard.img} className="w-56 md:w-72 rounded-2xl shadow-2xl border-4 border-white dark:border-white/5" alt="meta" />
                            </div>
                            <div className="p-10 flex-1 flex flex-col justify-center">
                                <h3 className="text-4xl font-black uppercase italic text-slate-900 dark:text-white mb-6">{selectedMetaCard.name}</h3>
                                <div className="p-8 bg-blue-600/10 rounded-[2rem] border border-blue-600/20 mb-8 text-center">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Presencia en el Meta actual</p>
                                    <p className="text-6xl font-black text-blue-600">{selectedMetaCard.usageCount} <span className="text-xl opacity-50">Mazos</span></p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FOOTER */}
            <footer className="text-center py-20 bg-white dark:bg-[#0A0C10] border-t dark:border-white/5">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">ForjaDeck Database System • 2026</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">Hecho con <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> por Alexis Tobar</div>
            </footer>
        </div>
    );
}

// COMPONENTES AUXILIARES
function MetaCard({ card, index, onClick }) {
    return (
        <motion.div whileHover={{ y: -8, scale: 1.02 }} onClick={onClick} className="cursor-pointer group bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl transition-all duration-500 text-center">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative shadow-inner">
                <img src={card.imgUrl || card.img} className="w-full h-full object-cover group-hover:scale-110" alt="card" onError={(e) => { e.target.src = "https://placehold.co/200x280/1e293b/white?text=Cargando..."; }} />
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-lg">#{index + 1}</div>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase mb-1">{card.name}</h4>
        </motion.div>
    );
}

function FormatCard({ title, onClick, img, icon }) {
    return (
        <div onClick={onClick} className="group cursor-pointer relative h-64 md:h-80 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl transition-all">
            <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000" alt="format" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl mb-4 w-fit border border-white/10">{icon}</div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{title}</h2>
            </div>
        </div>
    );
}
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

    // ✅ ESTADO PARA CARTAS CON RESTRICCIÓN
    const [bannedCards, setBannedCards] = useState([]);
    const carouselRef = useRef(null);

    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";
    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";

    const RACE_COLORS = {
        "Caballero": "#3b82f6", "Dragón": "#ef4444", "Sombra": "#a855f7", 
        "Eterno": "#10b981", "Guerrero": "#f59e0b", "Faerie": "#ec4899",
        "Sacerdote": "#06b6d4", "Bestia": "#84cc16", "Héroe": "#f97316"
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Top 10 PB
                const resPb = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=primer_bloque`);
                if (resPb.ok) setPbTrending((await resPb.json()).slice(0, 10));

                // 2. Top 10 Imperio
                const resImp = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=imperio`);
                if (resImp.ok) setImpTrending((await resImp.json()).slice(0, 10));

                // 3. ✅ BUSCAR CARTAS BANEADAS/RESTRINGIDAS (LÓGICA REPARADA)
                // Llamamos a la búsqueda de cartas
                const resCards = await fetch(`${BACKEND_URL}/api/cards/search?format=primer_bloque`);
                if (resCards.ok) {
                    const allCards = await resCards.json();
                    const dataArray = Array.isArray(allCards) ? allCards : (allCards.results || []);
                    
                    // Filtramos solo las que tienen el campo restriction
                    const restricted = dataArray.filter(c => c.restriction && c.restriction !== "none");
                    setBannedCards(restricted);
                }

                // 4. Red de Invocadores
                const resP = await fetch(`${BACKEND_URL}/api/community-links`);
                if (resP.ok) setPlayers(await resP.json());

            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const getRestrictionLabel = (res) => {
        if (res === "banned" || res === "prohibited") return { text: "Prohibida", color: "bg-red-600" };
        if (res === "limited1") return { text: "1 Copia", color: "bg-orange-600" };
        if (res === "limited2") return { text: "2 Copias", color: "bg-yellow-500 text-black" };
        return { text: "Restringida", color: "bg-slate-700" };
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#06080F] text-slate-900 dark:text-white pb-20 transition-colors duration-500 overflow-x-hidden">
            
            {/* HERO */}
            <header className="w-full max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
                <div className="flex justify-center mb-8">
                    <img src={LOGO_NEGRO} className="w-[80vw] max-w-[550px] dark:hidden" alt="logo" />
                    <img src={LOGO_BLANCO} className="w-[80vw] max-w-[550px] hidden dark:block" alt="logo" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium italic">Análisis avanzado de metajuego y estrategias competitivas.</p>
            </header>

            {/* BOTONES FORMATO */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                <FormatCard title="Primer Bloque" onClick={() => navigate("/primer-bloque")} img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?quality=70&width=1200" icon={<ScrollText />} />
                <FormatCard title="Imperio" onClick={() => navigate("/imperio")} img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg" icon={<Sword />} />
            </div>

            {/* ✅ CARRUSEL DE BANEADAS (ARRIBA DEL TOP 10) */}
            {bannedCards.length > 0 && (
                <section className="w-full mb-24 py-10 bg-slate-100/50 dark:bg-white/5 relative">
                    <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Restricciones DAR</h3>
                    </div>

                    <div className="relative overflow-hidden cursor-grab active:cursor-grabbing" ref={carouselRef}>
                        <motion.div 
                            className="flex gap-6 px-6"
                            drag="x"
                            dragConstraints={{ right: 0, left: -2000 }} // Ajustable según cantidad
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        >
                            {/* Mostramos las cartas directo de la base de datos */}
                            {[...bannedCards, ...bannedCards].map((card, i) => {
                                const style = getRestrictionLabel(card.restriction);
                                return (
                                    <div key={`${card._id}-${i}`} className="w-40 md:w-52 shrink-0 select-none">
                                        <div className="relative group rounded-2xl overflow-hidden shadow-xl aspect-[3/4.2] bg-slate-200 dark:bg-slate-800">
                                            <img 
                                                src={card.imgUrl || card.img} 
                                                className="w-full h-full object-cover pointer-events-none" 
                                                alt={card.name} 
                                                onError={(e) => { e.target.src = "https://placehold.co/300x420/1e293b/white?text=Cargando..."; }}
                                            />
                                            <div className={`absolute top-3 right-3 px-2 py-1 ${style.color} text-white text-[8px] font-black rounded-lg uppercase z-10 shadow-lg`}>
                                                {style.text}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                <p className="text-white text-[10px] font-bold text-center">{card.name}</p>
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
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                    <TrendingUp className="text-blue-600" /> Top 10 Primer Bloque
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {pbTrending.map((card, i) => (
                        <MetaCard key={i} card={card} index={i} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                    ))}
                </div>
            </section>

            {/* TOP 10 IMPERIO */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                    <TrendingUp className="text-blue-500" /> Top 10 Imperio
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {impTrending.map((card, i) => (
                        <MetaCard key={i} card={card} index={i} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                    ))}
                </div>
            </section>

            {/* SECCIÓN JUEGOS VIKINGOS */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
                    <div className="flex-1 text-center md:text-left">
                         <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">Juegos <span className="text-blue-600">Vikingos</span></h2>
                         <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 italic">Tu tienda oficial para conseguir el mejor arsenal para tus mazos.</p>
                         <a href="https://www.juegosvikingos.cl" target="_blank" className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase italic text-sm hover:bg-blue-700 transition-all">Visitar Tienda <ExternalLink /></a>
                    </div>
                    <img src={VIKINGO_LOGO} className="w-48 md:w-80 animate-float" alt="vikingo" />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="text-center py-20 opacity-50 text-[10px] font-bold uppercase tracking-[0.5em]">
                ForjaDeck System • 2026
            </footer>

            {/* MODAL META (REPARADO) */}
            <AnimatePresence>
                {showMetaModal && selectedMetaCard && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMetaModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] overflow-hidden relative flex flex-col md:flex-row shadow-2xl">
                            <button onClick={() => setShowMetaModal(false)} className="absolute top-4 right-4 p-2 bg-black/10 rounded-full"><X/></button>
                            <div className="p-8 bg-slate-100 dark:bg-black/20 flex justify-center">
                                <img src={selectedMetaCard.imgUrl || selectedMetaCard.img} className="w-48 md:w-64 rounded-xl shadow-2xl" alt="meta" />
                            </div>
                            <div className="p-10 flex-1 overflow-y-auto max-h-[80vh]">
                                <h3 className="text-3xl font-black uppercase italic mb-4">{selectedMetaCard.name}</h3>
                                <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-600/20 mb-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Uso en el Meta actual</p>
                                    <p className="text-4xl font-black text-blue-600">{selectedMetaCard.usageCount} Mazos</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// COMPONENTES AUXILIARES
function MetaCard({ card, index, onClick }) {
    return (
        <motion.div whileHover={{ y: -5 }} onClick={onClick} className="cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-3xl border border-slate-200 dark:border-white/5 shadow-lg">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 relative">
                <img src={card.imgUrl || card.img} className="w-full h-full object-cover" alt="card" onError={(e) => e.target.src="https://placehold.co/200x280?text=MyL"} />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">#{index + 1}</div>
            </div>
            <p className="text-[10px] font-black uppercase text-center truncate">{card.name}</p>
        </motion.div>
    );
}

function FormatCard({ title, onClick, img, icon }) {
    return (
        <div onClick={onClick} className="group cursor-pointer relative h-64 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl transition-all">
            <img src={img} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="format" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-4 w-fit">{icon}</div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
            </div>
        </div>
    );
}
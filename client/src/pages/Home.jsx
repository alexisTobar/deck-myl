import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ✅ IMPORTACIÓN PARA GRÁFICOS PROFESIONALES
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

    // ✅ ESTADO PARA EL CARRUSEL DE RESTRICCIONES (COMO EN TU CONSTRUCTOR)
    const [bannedCards, setBannedCards] = useState([]);
    const carouselRef = useRef(null);

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";

    const RACE_COLORS = {
        "Caballero": "#3b82f6", "Dragón": "#ef4444", "Sombra": "#a855f7", 
        "Eterno": "#10b981", "Guerrero": "#f59e0b", "Faerie": "#ec4899",
        "Sacerdote": "#06b6d4", "Bestia": "#84cc16", "Héroe": "#f97316",
        "Híbrido": "#64748b", "Otros": "#94a3b8"
    };

    // ✅ LÓGICA VISUAL EXACTA DE TU CONSTRUCTOR
    const getCardStyle = (card) => {
        if (card.restriction === "banned") return { filter: "grayscale(100%)", label: "BAN", color: "bg-red-600" };
        if (card.restriction === "limited1") return { filter: "none", label: "1", color: "bg-orange-600" };
        if (card.restriction === "limited2") return { filter: "none", label: "2", color: "bg-yellow-500 text-black" };
        return { filter: "none", label: "!", color: "bg-blue-600" };
    };

    useEffect(() => {
        const fetchTrendingData = async () => {
            setLoading(true);
            try {
                // 1. Cargar estadísticas Top 10
                const resPb = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=primer_bloque`);
                if (resPb.ok) {
                    const dataPb = await resPb.json();
                    setPbTrending(dataPb.filter(c => c.format === 'primer_bloque').slice(0, 10));
                }
                const resImp = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=imperio`);
                if (resImp.ok) {
                    const dataImp = await resImp.json();
                    setImpTrending(dataImp.filter(c => c.format === 'imperio').slice(0, 10));
                }

                // ✅ 2. LÓGICA DEL CONSTRUCTOR: Buscar cartas restringidas en la base de datos
                const resCards = await fetch(`${BACKEND_URL}/api/cards/search?format=primer_bloque`);
                if (resCards.ok) {
                    const data = await resCards.json();
                    const allCards = Array.isArray(data) ? data : (data.results || []);
                    // Filtramos las que tengan restriction y usamos imgUrl para la imagen
                    const restricted = allCards.filter(c => c.restriction && c.restriction !== "none");
                    setBannedCards(restricted);
                }
            } catch (error) { console.error("Error stats:", error); } 
            finally { setLoading(false); }
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

    const handleSavePlayer = async (e) => {
        e.preventDefault();
        if (!newPlayerData.name || !newPlayerData.instagram) return toast.error("Completa los campos.");
        try {
            const res = await fetch(`${BACKEND_URL}/api/community-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlayerData)
            });
            if (res.ok) {
                toast.success("¡Éxito! ✅");
                setShowPlayerModal(false);
                setNewPlayerData({ name: "", instagram: "", logo: "" });
                const updated = await fetch(`${BACKEND_URL}/api/community-links`);
                setPlayers(await updated.json());
            }
        } catch (e) { toast.error("Error servidor."); }
    };

    const getChartData = (card) => {
        if (!card || !card.races || Object.keys(card.races).length === 0) return [];
        const total = Object.values(card.races).reduce((a, b) => a + b, 0);
        return Object.entries(card.races).map(([name, value]) => ({
            name: name, 
            value: Number(value), 
            percentage: ((value / total) * 100).toFixed(1),
            color: RACE_COLORS[name] || `#${Math.floor(Math.random()*16777215).toString(16)}`
        }));
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="900">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const goToCommunityDeck = (deck) => {
        if (deck.isPublic) {
            const path = selectedMetaCard?.format === 'primer_bloque' 
                ? "/primer-bloque/community" 
                : "/imperio/community";
            navigate(path, { state: { autoOpenDeckId: deck._id } });
        } else {
            toast.info("Este mazo es privado.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0A0C10] dark:via-[#0f172a] dark:to-[#0A0C10] flex flex-col items-center font-sans text-slate-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/30 overflow-x-hidden transition-colors duration-500">
            
            {/* HERO SECTION */}
            <header className="w-full max-w-7xl px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-400/10 border border-blue-600/10 dark:border-blue-400/20 rounded-full mb-8 shadow-sm">
                    <Star size={12} className="text-blue-600 dark:text-blue-400 fill-blue-600" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400">Versión Meta v3.5</span>
                </div>
                <div className="flex justify-center mb-8 px-4">
                    <img src={LOGO_NEGRO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain dark:hidden" />
                    <img src={LOGO_BLANCO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain hidden dark:block" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-80 px-4 text-center">Optimización de estrategias basada en el análisis de datos masivos de la comunidad.</p>
            </header>

            {/* BOTONES FORMATO */}
            <motion.main initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 z-10">
                <FormatCard title="Primer Bloque" desc="Domina el formato de los relatos clásicos." img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?auth=c2cc267add0246b4d52e7e6ba39dac28c0c11ebe4c806e386358c4a65968d094&quality=70&width=1200&height=544&smart=true" icon={<ScrollText size={28} className="text-blue-500" />} onClick={() => navigate("/primer-bloque")} delay="delay-150" />
                <FormatCard title="Imperio" desc="Metajuego actual y el pináculo del circuito competitivo." img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg?v=1761336400" icon={<Sword size={28} className="text-blue-600" />} onClick={() => navigate("/imperio")} delay="delay-300" />
            </motion.main>

            {/* ✅ SECCIÓN REPARADA: CARRUSEL DE RESTRICCIONES (CON DRAG) */}
            {bannedCards.length > 0 && (
                <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full mb-24 relative overflow-hidden bg-slate-100/50 dark:bg-white/5 py-12">
                    <div className="max-w-7xl mx-auto px-6 mb-10 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} />
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Restricciones DAR</h3>
                    </div>
                    
                    <div className="relative flex overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={carouselRef}>
                        <motion.div 
                            className="flex gap-6 w-max"
                            drag="x"
                            dragConstraints={carouselRef}
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                        >
                            {/* Unimos los datos reales de la BD duplicados para loop infinito */}
                            {[...bannedCards, ...bannedCards].map((card, i) => {
                                const style = getCardStyle(card);
                                return (
                                    <div key={`${card._id}-${i}`} className="w-40 md:w-56 shrink-0 select-none">
                                        <div className="relative group/card bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/5 aspect-[3/4.2]">
                                            <img 
                                                src={card.imgUrl || card.img} 
                                                style={{ filter: style.filter }}
                                                className="w-full h-full object-cover pointer-events-none transition-transform group-hover/card:scale-110 duration-700" 
                                                alt={card.name} 
                                                onError={(e) => { e.target.src = "https://placehold.co/300x420/1e293b/white?text=Cargando+Carta..."; }}
                                            />
                                            <div className={`absolute top-4 right-4 px-3 py-1.5 ${style.color} text-white text-[9px] font-black uppercase rounded-xl shadow-lg z-10 border border-white/20`}>
                                                {style.label}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                                                <p className="text-white text-xs font-bold whitespace-normal">{card.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </motion.section>
            )}

            {/* TOP 10 PB */}
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-24 text-center md:text-left">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <TrendingUp className="text-blue-600" />
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Top 10 Primer Bloque</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                    {loading ? [...Array(10)].map((_, n) => <div key={`pbl-${n}`} className="h-48 md:h-64 bg-slate-800/20 rounded-3xl animate-pulse" />) : 
                        pbTrending.map((card, idx) => (
                            <MetaCard key={`pb-${idx}`} card={card} index={idx} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                        ))
                    }
                </div>
            </motion.section>

            {/* TOP 10 IMPERIO */}
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-32 text-center md:text-left">
                <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <TrendingUp className="text-blue-500" />
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Top 10 Imperio</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                    {loading ? [...Array(10)].map((_, n) => <div key={`iml-${n}`} className="h-48 md:h-64 bg-slate-800/20 rounded-3xl animate-pulse" />) : 
                        impTrending.map((card, idx) => (
                            <MetaCard key={`imp-${idx}`} card={card} index={idx} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />
                        ))
                    }
                </div>
            </motion.section>

            {/* ... RESTO DEL CÓDIGO (MODAL, VIKINGOS, INVOCADORES) SE MANTIENE IGUAL ... */}
            <AnimatePresence>
                {showMetaModal && selectedMetaCard && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMetaModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-5xl bg-white dark:bg-[#0f172a] border border-white/10 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
                            <button onClick={() => setShowMetaModal(false)} className="absolute top-4 right-4 z-[2010] p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-blue-500 transition-all shadow-lg"><X size={20} /></button>
                            <div className="w-full md:w-2/5 p-6 md:p-8 bg-slate-50 dark:bg-black/20 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0">
                                <img src={selectedMetaCard.imgUrl || selectedMetaCard.img} className="w-full max-w-[140px] sm:max-w-[180px] md:max-w-[260px] rounded-xl md:rounded-2xl shadow-2xl border-2 md:border-4 border-white dark:border-white/5" alt="card" />
                            </div>
                            <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Racial Distribution Analysis</span>
                                    <h3 className="text-2xl md:text-4xl font-black uppercase italic text-slate-900 dark:text-white leading-tight mb-1">{selectedMetaCard.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedMetaCard.format?.replace('_',' ')}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Presencia Global</p>
                                        <p className="text-2xl font-black text-blue-500">{selectedMetaCard.usageCount} Mazos</p>
                                    </div>
                                    <div className="h-48 md:h-56 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={getChartData(selectedMetaCard)} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                                                    {getChartData(selectedMetaCard).map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SECCIÓN JUEGOS VIKINGOS */}
            <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full max-w-7xl px-6 mb-32">
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-1 shadow-2xl group">
                    <div className="bg-white dark:bg-[#0A0C10] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full mb-6">
                                <ShoppingBag size={14} className="text-orange-500" />
                                <span className="text-[10px] font-black uppercase text-orange-500">Official Store</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">Juegos <span className="text-blue-600">Vikingos</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg font-medium italic mx-auto md:mx-0">Encuentra las cartas más codiciadas y los últimos lanzamientos de Mitos y Leyendas.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href="https://www.juegosvikingos.cl" target="_blank" rel="noreferrer" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs flex gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 text-center">Visitar Tienda <ExternalLink size={18} /></a>
                                <a href="https://www.instagram.com/juegosvikingos" target="_blank" rel="noreferrer" className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black uppercase italic text-xs flex gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-center"><Instagram size={18} /> Instagram</a>
                            </div>
                        </div>
                        <div className="flex-1 order-1 md:order-2 flex justify-center">
                            <motion.img animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} src={VIKINGO_LOGO} className="w-full max-w-[200px] md:max-w-[280px] h-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.4)]" alt="vikingo" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* RED INVOCADORES */}
            <motion.section initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-32">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 justify-center md:justify-start"><Instagram className="text-pink-600" /> Red de Invocadores</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center md:text-left">Sigue a los mejores jugadores y comunidades</p>
                    </div>
                    <button onClick={() => setShowPlayerModal(true)} className="px-6 py-3 bg-white dark:bg-white/5 border border-pink-600/30 rounded-2xl font-black text-[10px] uppercase text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-lg flex items-center gap-2 active:scale-95"><PlusCircle size={18} /> Aparecer aquí</button>
                </div>
                <div className="flex gap-8 overflow-x-auto no-scrollbar py-6 px-2">
                    {players.map((p, i) => (
                        <motion.a whileHover={{ scale: 1.1, rotate: 5 }} key={i} href={p.instagram} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 min-w-[100px]">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-xl">
                                <div className="w-full h-full rounded-full border-[4px] border-white dark:border-[#0f172a] overflow-hidden">
                                    <img src={p.logo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="player" />
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 truncate w-full text-center">@{p.name}</span>
                        </motion.a>
                    ))}
                </div>
            </motion.section>

            <footer className="w-full py-20 bg-white dark:bg-[#0A0C10] border-t dark:border-white/5 text-center transition-colors">
                <img src={LOGO_BLANCO} className="h-10 w-auto mb-4 mx-auto hidden dark:block" alt="fd" />
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">ForjaDeck Database System • 2026</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">Hecho con <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> por Alexis Tobar</div>
            </footer>
        </div>
    );
}

// COMPONENTES AUXILIARES
function MetaCard({ card, index, onClick }) {
    return (
        <motion.div whileHover={{ y: -8, scale: 1.02 }} onClick={onClick} className="cursor-pointer group bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white dark:border-white/10 p-3 rounded-[1.5rem] hover:shadow-2xl transition-all duration-500 shadow-xl shadow-black/5 text-center">
            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 overflow-hidden relative shadow-inner">
                <img src={card.imgUrl || card.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="card" onError={(e) => e.target.src = "https://via.placeholder.com/200x280?text=MyL"} />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-lg">#{index + 1}</div>
            </div>
            <div className="px-1"><h4 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white truncate uppercase mb-1 leading-tight h-8 flex items-center justify-center">{card.name}</h4><div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase"><BarChart3 size={10} /> Análisis</div></div>
        </motion.div>
    );
}

function FormatCard({ title, desc, img, icon, onClick, delay }) {
    return (
        <div onClick={onClick} className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] dark:hover:shadow-blue-500/10 hover:border-blue-400 transition-all flex flex-col animate-in fade-in slide-in-from-bottom-10 ${delay}`}>
            <div className="h-48 md:h-72 relative overflow-hidden"><img src={img} className="w-full h-full object-cover group-hover:scale-110 opacity-90 dark:opacity-60 transition-transform duration-1000" alt="title" /><div className="absolute bottom-6 left-8 p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-2xl border border-slate-100 dark:border-white/10 group-hover:-translate-y-2 transition-transform duration-500">{icon}</div></div>
            <div className="p-8 md:p-10 pt-6"><h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{title}</h2><p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 leading-relaxed">{desc}</p><div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600">Crea tu Mazo <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" /></div></div>
        </div>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="text-center flex flex-col items-center group cursor-default px-4 transition-all">
            <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 text-blue-600 dark:text-blue-400">{icon}</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 italic">{title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-[220px] opacity-70 dark:opacity-60">{text}</p>
        </div>
    );
}
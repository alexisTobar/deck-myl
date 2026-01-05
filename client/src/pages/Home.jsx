import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import BACKEND_URL from "../config";
import { 
    Sword, ScrollText, Zap, TrendingUp, ShieldCheck, Users, ArrowRight, Heart, Star, 
    ShoppingBag, Instagram, ExternalLink, PlusCircle, X, Camera, Sparkles, UserPlus, BarChart3, LayoutList
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

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const LOGO_NEGRO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasnegas.png";
    const LOGO_BLANCO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/main/logoletrasblancas.png";

    const RACE_COLORS = {
        "Caballero": "#3b82f6", "Dragón": "#ef4444", "Sombra": "#a855f7", 
        "Eterno": "#10b981", "Guerrero": "#f59e0b", "Faerie": "#ec4899",
        "Sacerdote": "#06b6d4", "Bestia": "#84cc16", "Héroe": "#f97316",
        "Híbrido": "#64748b", "Otros": "#94a3b8"
    };

    useEffect(() => {
        const fetchTrendingData = async () => {
            setLoading(true);
            try {
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
            name: `${name} (${((value / total) * 100).toFixed(1)}%)`, 
            value: Number(value), 
            color: RACE_COLORS[name] || `#${Math.floor(Math.random()*16777215).toString(16)}`
        }));
    };

    // Renderizado de porcentajes en el gráfico
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0A0C10] dark:via-[#0f172a] dark:to-[#0A0C10] flex flex-col items-center font-sans text-slate-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/30 overflow-x-hidden transition-colors duration-500">
            
            {/* HERO SECTION */}
            <header className="w-full max-w-7xl px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-400/10 border border-blue-600/10 dark:border-blue-400/20 rounded-full mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Star size={12} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400">Versión Meta v3.5</span>
                </div>
                <div className="flex justify-center mb-8 px-4">
                    <img src={LOGO_NEGRO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain dark:hidden" />
                    <img src={LOGO_BLANCO} alt="Logo" className="w-[85vw] max-w-[500px] md:max-w-[650px] h-auto object-contain hidden dark:block" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-medium opacity-80 px-4 text-center">Optimización de estrategias basada en el análisis de datos masivos de la comunidad.</p>
            </header>

            {/* FORMAT CARDS */}
            <motion.main initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 z-10">
                <FormatCard title="Primer Bloque" desc="Domina el formato de los relatos clásicos." img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?auth=c2cc267add0246b4d52e7e6ba39dac28c0c11ebe4c806e386358c4a65968d094&quality=70&width=1200&height=544&smart=true" icon={<ScrollText size={28} className="text-blue-500" />} onClick={() => navigate("/primer-bloque")} delay="delay-150" />
                <FormatCard title="Imperio" desc="Metajuego actual y circuito competitivo." img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg?v=1761336400" icon={<Sword size={28} className="text-blue-600" />} onClick={() => navigate("/imperio")} delay="delay-300" />
            </motion.main>

            {/* SECCIÓN TOP 10 PB */}
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-24">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center justify-center md:justify-start gap-3"><ScrollText className="text-blue-600" size={24} /> Top 10 Primer Bloque</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-sm font-bold uppercase mt-1 tracking-widest leading-none">Cartas más populares en relatos clásicos</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6">
                    {loading ? [...Array(10)].map((_, n) => <div key={`pbl-${n}`} className="h-48 md:h-64 bg-slate-800/20 rounded-3xl animate-pulse" />) : 
                        pbTrending.map((card, idx) => <MetaCard key={`pb-meta-${idx}`} card={card} index={idx} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />)
                    }
                </div>
            </motion.section>

            {/* SECCIÓN TOP 10 IMPERIO */}
            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-32">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 border-b border-slate-200 dark:border-white/10 pb-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center justify-center md:justify-start gap-3"><Sword className="text-blue-600" size={24} /> Top 10 Imperio</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-sm font-bold uppercase mt-1 tracking-widest leading-none">Dominancia en el formato competitivo actual</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6">
                    {loading ? [...Array(10)].map((_, n) => <div key={`iml-${n}`} className="h-48 md:h-64 bg-slate-800/20 rounded-3xl animate-pulse" />) : 
                        impTrending.map((card, idx) => <MetaCard key={`imp-meta-${idx}`} card={card} index={idx} onClick={() => { setSelectedMetaCard(card); setShowMetaModal(true); }} />)
                    }
                </div>
            </motion.section>

            {/* MODAL DE ANÁLISIS PROFESIONAL */}
            <AnimatePresence>
                {showMetaModal && selectedMetaCard && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMetaModal(false)} className="absolute inset-0 bg-[#060912]/95 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                            <button onClick={() => setShowMetaModal(false)} className="absolute top-6 right-6 z-20 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-blue-500"><X size={20} /></button>
                            {/* LADO IZQUIERDO: CARTA */}
                            <div className="w-full md:w-[40%] p-8 bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                                <img src={selectedMetaCard.imgUrl || selectedMetaCard.img} className="w-full max-w-[240px] rounded-2xl shadow-2xl border-4 border-white dark:border-white/5" alt="card" />
                            </div>
                            {/* LADO DERECHO: DATOS */}
                            <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center overflow-y-auto max-h-[90vh]">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Racial Distribution Analysis</span>
                                    <h3 className="text-3xl font-black uppercase italic text-slate-900 dark:text-white leading-none mb-2">{selectedMetaCard.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedMetaCard.format?.replace('_',' ')}</p>
                                </div>
                                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 mb-6 text-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Frecuencia en Mazos</p>
                                    <p className="text-2xl font-black text-blue-500">{selectedMetaCard.usageCount}</p>
                                </div>
                                {/* GRÁFICO MEJORADO */}
                                <div className="h-72 w-full mb-8">
                                    {getChartData(selectedMetaCard).length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={getChartData(selectedMetaCard)} 
                                                    innerRadius={50} 
                                                    outerRadius={75} 
                                                    paddingAngle={5} 
                                                    dataKey="value" 
                                                    stroke="none"
                                                    label={renderCustomizedLabel}
                                                    labelLine={false}
                                                >
                                                    {getChartData(selectedMetaCard).map((e, i) => <Cell key={i} fill={e.color} />)}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }} 
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div className="h-full flex items-center justify-center text-slate-500 italic text-xs uppercase">Sin datos de raza</div>}
                                </div>
                                {/* TOP MAZOS INTERACTIVOS */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2 border-t border-white/5 pt-4">
                                        <LayoutList size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Fuentes Estratégicas (Click para ver):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMetaCard.featuredDecks?.map((deck, i) => (
                                            <button 
                                                key={i} 
                                                disabled={!deck.isPublic}
                                                onClick={() => deck.isPublic && navigate(`/community/deck/${deck._id}`)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all border flex items-center gap-2
                                                    ${deck.isPublic 
                                                        ? 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer' 
                                                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500 cursor-not-allowed opacity-60'}`}
                                            >
                                                {deck.name} {!deck.isPublic && <Lock size={10} />}
                                            </button>
                                        )) || <p className="text-[9px] text-slate-600">Analizando fuentes...</p>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SECCIÓN JUEGOS VIKINGOS */}
            <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full max-w-7xl px-6 mb-32">
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
                    <div className="bg-white dark:bg-[#0A0C10] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full mb-6"><ShoppingBag size={14} className="text-orange-500" /><span className="text-[10px] font-black uppercase text-orange-500">Official Store</span></div>
                            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">Juegos <span className="text-blue-600">Vikingos</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg font-medium italic text-center md:text-left mx-auto md:mx-0">
                                Encuentra las cartas más codiciadas y los últimos lanzamientos de Mitos y Leyendas. Calidad legendaria para invocadores reales.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href="https://www.juegosvikingos.cl" target="_blank" rel="noreferrer" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30">
                                    Visitar Tienda <ExternalLink size={18} />
                                </a>
                                <a href="https://www.instagram.com/juegosvikingos" target="_blank" rel="noreferrer" className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                    <Instagram size={18} /> Ver Instagram
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 order-1 md:order-2 flex justify-center">
                            <motion.img 
                                animate={{ y: [0, -20, 0] }} 
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                                src={VIKINGO_LOGO} 
                                className="w-full max-w-[280px] md:max-w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.4)]" 
                                alt="Vikingo"
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* RED INVOCADORES */}
            <motion.section initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full max-w-7xl px-6 mb-32">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 justify-center md:justify-start"><Instagram className="text-pink-600" /> Red de Invocadores</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sigue a los mejores jugadores y comunidades</p>
                    </div>
                    <button onClick={() => setShowPlayerModal(true)} className="group relative px-6 py-3 bg-white dark:bg-white/5 border border-pink-600/30 rounded-2xl font-black text-[10px] uppercase text-pink-600 overflow-hidden transition-all hover:bg-pink-600 hover:text-white shadow-lg flex items-center gap-2">
                        <PlusCircle size={18} /> Aparecer aquí
                    </button>
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

            {/* MODAL INVOCADOR */}
            <AnimatePresence>
                {showPlayerModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPlayerModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.8, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[3.5rem] shadow-2xl p-10 text-white text-center">
                            <UserPlus size={40} className="text-pink-600 mx-auto mb-6" />
                            <h3 className="text-4xl font-black uppercase italic mb-8">Únete al <span className="text-pink-600">Relato</span></h3>
                            <form onSubmit={handleSavePlayer} className="space-y-4">
                                <input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-pink-600 transition-all text-white" placeholder="Nombre" value={newPlayerData.name} onChange={e => setNewPlayerData({...newPlayerData, name: e.target.value})} />
                                <input type="url" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-pink-600 transition-all text-white" placeholder="Instagram URL" value={newPlayerData.instagram} onChange={e => setNewPlayerData({...newPlayerData, instagram: e.target.value})} />
                                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-pink-600 transition-all text-white" placeholder="Logo URL" value={newPlayerData.logo} onChange={e => setNewPlayerData({...newPlayerData, logo: e.target.value})} />
                                <button type="submit" className="w-full py-5 bg-pink-600 text-white rounded-3xl text-xs font-black uppercase italic tracking-[0.2em] shadow-lg hover:scale-[1.03] transition-all">Inyectar Leyenda</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CARACTERÍSTICAS */}
            <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full bg-white/60 dark:bg-[#0A0C10]/60 backdrop-blur-xl border-y dark:border-white/10 py-24 mb-20 transition-all">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
                    <Feature icon={<ShieldCheck size={32} className="text-blue-500" />} title="Validación DAR" text="Arquitectura de mazos protegida bajo las reglas vigentes." />
                    <Feature icon={<Zap size={32} className="text-blue-400" />} title="Motor Forja" text="Procesamiento en tiempo real de estadísticas y win-rates." />
                    <Feature icon={<Users size={32} className="text-blue-600" />} title="Networking" text="Conexión global entre constructores y coleccionistas." />
                </div>
            </motion.section>

            <footer className="w-full py-20 bg-white dark:bg-[#0A0C10] border-t dark:border-white/5 text-center transition-colors">
                <img src={LOGO_BLANCO} className="h-10 w-auto mb-4 mx-auto hidden dark:block" alt="fd" />
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">ForjaDeck Database System • 2026</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">Hecho con <Heart size={16} className="text-red-500 fill-red-500" /> por Alexis Tobar</div>
            </footer>
        </div>
    );
}

// COMPONENTES AUXILIARES
function MetaCard({ card, index, onClick }) {
    return (
        <motion.div whileHover={{ y: -8, scale: 1.02 }} onClick={onClick} className="cursor-pointer group bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white dark:border-white/10 p-3 rounded-[1.5rem] hover:shadow-2xl transition-all duration-500 shadow-xl shadow-black/5">
            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 overflow-hidden relative shadow-inner text-center">
                <img src={card.imgUrl || card.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="card" onError={(e) => e.target.src = "https://via.placeholder.com/200x280?text=MyL"} />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-lg">#{index + 1}</div>
            </div>
            <div className="text-center px-1"><h4 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white truncate uppercase mb-1 leading-tight h-8 flex items-center justify-center">{card.name}</h4><div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase"><BarChart3 size={10} /> Análisis</div></div>
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
        <div className="text-center flex flex-col items-center group cursor-default px-4">
            <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">{icon}</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 italic">{title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-[220px] opacity-70 dark:opacity-60">{text}</p>
        </div>
    );
}
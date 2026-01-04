import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BACKEND_URL from "../config";
import { 
    Sword, 
    ScrollText, 
    Zap, 
    TrendingUp, 
    ShieldCheck, 
    Users, 
    ArrowRight,
    Heart,
    Star,
    ShoppingBag,
    Instagram,
    ExternalLink,
    PlusCircle,
    X,
    Camera,
    Sparkles,
    UserPlus
} from "lucide-react";
import { toast } from "sonner";

export default function HomePortal() {
    const navigate = useNavigate();
    const [trendingCards, setTrendingCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState([]);
    
    // ✅ ESTADOS PARA EL NUEVO MODAL GALÁCTICO
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [newPlayerData, setNewPlayerData] = useState({ name: "", instagram: "", logo: "" });

    const VIKINGO_LOGO = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/main/vikingo.png";
    const FORJADECK_LOGO = "https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/refs/heads/main/forja.png";

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/decks/stats/meta`);
                if (res.ok) {
                    const data = await res.json();
                    setTrendingCards(data.slice(0, 4));
                }
            } catch (error) {
                console.error("Error cargando tendencias:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPlayers = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/community-links`);
                if (res.ok) {
                    const data = await res.json();
                    setPlayers(data);
                }
            } catch (error) { console.error(error); }
        };

        fetchTrending();
        fetchPlayers();
    }, []);

    const handleSavePlayer = async (e) => {
        e.preventDefault();
        if (!newPlayerData.name || !newPlayerData.instagram) {
            return toast.error("¡Ponele nombre y link po, no seai patúo! 😂");
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/community-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlayerData)
            });
            if (res.ok) {
                toast.success("¡Invocador inyectado con éxito! ✅");
                setShowPlayerModal(false);
                setNewPlayerData({ name: "", instagram: "", logo: "" });
                const updated = await fetch(`${BACKEND_URL}/api/community-links`);
                const data = await updated.json();
                setPlayers(data);
            }
        } catch (e) {
            toast.error("Chuta, falló el envío al servidor.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0A0C10] dark:via-[#0f172a] dark:to-[#0A0C10] flex flex-col items-center font-sans text-slate-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/30 overflow-x-hidden transition-colors duration-500">
            
            {/* --- HERO SECTION --- */}
            <header className="w-full max-w-7xl px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/5 dark:bg-blue-400/10 border border-blue-600/10 dark:border-blue-400/20 rounded-full mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Star size={12} className="text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400">Nueva Versión ForjaDeck v3.0</span>
                </div>
                
                {/* ✅ MEJORA: Logo oficial responsivo */}
                <div className="flex justify-center mb-6 px-4">
                    <motion.img 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        src={FORJADECK_LOGO}
                        alt="ForjaDeck Logo"
                        className="w-[85vw] max-w-[500px] md:max-w-[700px] h-auto object-contain brightness-110 dark:brightness-125 drop-shadow-2xl"
                    />
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-80 px-4">
                    La plataforma técnica para la forja de estrategias. 
                    Optimización de mazos basada en el análisis de datos masivos.
                </p>
            </header>

            {/* --- SELECTOR DE FORMATOS --- */}
            <main className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 z-10">
                <FormatCard 
                    title="Primer Bloque" 
                    desc="Domina el formato de los dioses antiguos y leyendas clásicas."
                    img="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?auth=c2cc267add0246b4d52e7e6ba39dac28c0c11ebe4c806e386358c4a65968d094&quality=70&width=1200&height=544&smart=true"
                    icon={<ScrollText size={28} className="text-blue-500 dark:text-blue-400" />}
                    onClick={() => navigate("/primer-bloque")}
                    delay="delay-150"
                />
                <FormatCard 
                    title="Imperio" 
                    desc="Metajuego actual y el pináculo del circuito competitivo."
                    img="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg?v=1761336400"
                    icon={<Sword size={28} className="text-blue-600 dark:text-blue-400" />}
                    onClick={() => navigate("/imperio")}
                    delay="delay-300"
                />
            </main>

            {/* --- ANÁLISIS DEL META --- */}
            <section className="w-full max-w-7xl px-6 mb-32">
                <div className="flex items-center justify-between mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
                    <div className="text-left">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                            <TrendingUp className="text-blue-600 dark:text-blue-400" /> Análisis del Meta
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-sm font-bold uppercase mt-1 tracking-widest">Tendencias extraídas de la base de datos global</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(n => <div key={n} className="h-72 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl animate-pulse"></div>)
                    ) : (
                        trendingCards.map((card, idx) => (
                            <div key={idx} className="group bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white dark:border-white/10 p-4 rounded-[2rem] hover:shadow-2xl dark:hover:shadow-blue-900/20 hover:-translate-y-2 transition-all duration-500">
                                <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden shadow-inner relative">
                                    <img 
                                        src={card.imgUrl || card.img} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        alt={card.name} 
                                        onError={(e) => e.target.src = "https://via.placeholder.com/200x280?text=Forja+Deck"}
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-[#0A0C10]/90 backdrop-blur-sm rounded-lg text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 shadow-sm border border-white dark:border-white/10">
                                        {card.format === 'primer_bloque' ? 'PB' : 'IMP'}
                                    </div>
                                </div>
                                <div className="px-1 text-center">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter mb-1">{card.name}</h4>
                                    <div className="h-1 w-8 bg-blue-600 dark:bg-blue-400 mx-auto rounded-full group-hover:w-16 transition-all mb-3"></div>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase italic">Uso: {card.usageCount} Mazos</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* --- SECCIÓN: JUEGOS VIKINGOS STORE --- */}
            <section className="w-full max-w-7xl px-6 mb-32">
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <div className="bg-white dark:bg-[#0A0C10] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full mb-6">
                                <ShoppingBag size={14} className="text-orange-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Official Store</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">Juegos <span className="text-blue-600">Vikingos</span></h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg font-medium leading-relaxed italic">
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
                        <div className="flex-1 order-1 md:order-2">
                            <img 
                                src={VIKINGO_LOGO} 
                                className="w-full max-w-[280px] md:max-w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.4)] animate-float" 
                                alt="Logo Juegos Vikingos" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- RED DE INVOCADORES --- */}
            <section className="w-full max-w-7xl px-6 mb-32">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 justify-center md:justify-start">
                            <Instagram className="text-pink-600" /> Red de Invocadores
                        </h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sigue a los mejores jugadores y comunidades</p>
                    </div>
                    <button 
                        onClick={() => setShowPlayerModal(true)}
                        className="group relative px-6 py-3 bg-white dark:bg-white/5 border border-pink-600/30 rounded-2xl font-black text-[10px] uppercase text-pink-600 overflow-hidden transition-all hover:bg-pink-600 hover:text-white shadow-lg"
                    >
                        <span className="relative z-10 flex items-center gap-2"><PlusCircle size={18} /> Aparecer aquí</span>
                        <div className="absolute inset-0 bg-pink-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>

                <div className="flex gap-8 overflow-x-auto no-scrollbar py-6 px-2">
                    {players.length > 0 ? players.map((player, idx) => (
                        <a 
                            key={idx} 
                            href={player.instagram} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex flex-col items-center gap-3 group min-w-[100px]"
                        >
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                                <div className="w-full h-full rounded-full border-[4px] border-white dark:border-[#0f172a] overflow-hidden">
                                    <img src={player.logo || "https://via.placeholder.com/150?text=MyL"} className="w-full h-full object-cover" alt={player.name} />
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-700 dark:text-slate-300 group-hover:text-pink-500 transition-colors truncate w-full text-center">@{player.name}</span>
                        </a>
                    )) : (
                        <p className="text-slate-500 italic text-sm">Sé el primero en unirte a la red...</p>
                    )}
                </div>
            </section>

            {/* --- EL NUEVO MODAL "FORJA DE INVOCADORES" --- */}
            <AnimatePresence>
                {showPlayerModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowPlayerModal(false)}
                            className="absolute inset-0 bg-[#060912]/90 backdrop-blur-xl"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 100 }}
                            className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[3.5rem] shadow-[0_0_100px_rgba(219,39,119,0.2)] overflow-hidden"
                        >
                            <div className="bg-gradient-to-b from-pink-600/20 to-transparent p-10 pb-4 text-center">
                                <div className="w-16 h-16 bg-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(219,39,119,0.5)]">
                                    <UserPlus size={32} className="text-white -rotate-12" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">Únete al <span className="text-pink-600">Relato</span></h3>
                                <p className="text-slate-400 text-[10px] md:text-sm mt-2 font-bold uppercase tracking-widest leading-tight">Registra tu leyenda en la red de invocadores</p>
                            </div>

                            <form onSubmit={handleSavePlayer} className="p-8 md:p-10 pt-6 space-y-6">
                                <div className="flex justify-center mb-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-spin-slow">
                                            <div className="w-full h-full rounded-full border-[4px] border-[#0f172a] overflow-hidden bg-slate-800 flex items-center justify-center">
                                                {newPlayerData.logo ? <img src={newPlayerData.logo} className="w-full h-full object-cover" /> : <Camera className="text-slate-600" size={28} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pink-600 transition-all placeholder:text-slate-600" placeholder="Nombre de Gladiador / Comunidad" value={newPlayerData.name} onChange={e => setNewPlayerData({...newPlayerData, name: e.target.value})} />
                                    <input type="url" required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pink-600 transition-all placeholder:text-slate-600" placeholder="Link de Instagram (URL completa)" value={newPlayerData.instagram} onChange={e => setNewPlayerData({...newPlayerData, instagram: e.target.value})} />
                                    <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pink-600 transition-all placeholder:text-slate-600" placeholder="URL de tu Logo o Foto (Opcional)" value={newPlayerData.logo} onChange={e => setNewPlayerData({...newPlayerData, logo: e.target.value})} />
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button type="submit" className="w-full py-5 bg-pink-600 text-white rounded-3xl text-xs font-black uppercase italic tracking-[0.2em] shadow-lg hover:scale-[1.03] transition-all flex items-center justify-center gap-2"><Sparkles size={18} /> Inyectar Leyenda</button>
                                    <button type="button" onClick={() => setShowPlayerModal(false)} className="w-full py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Abortar Misión</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- CARACTERÍSTICAS --- */}
            <section className="w-full bg-white/60 dark:bg-[#0A0C10]/60 backdrop-blur-xl border-y border-slate-200 dark:border-white/10 py-24 mb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                    <Feature icon={<ShieldCheck size={32} className="text-blue-500 dark:text-blue-400" />} title="Validación DAR" text="Arquitectura de mazos protegida bajo las reglas vigentes." />
                    <Feature icon={<Zap size={32} className="text-blue-400 dark:text-blue-300" />} title="Motor Forja" text="Procesamiento en tiempo real de estadísticas y win-rates." />
                    <Feature icon={<Users size={32} className="text-blue-600 dark:text-blue-500" />} title="Networking" text="Conexión global entre constructores y coleccionistas." />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="w-full py-20 bg-white dark:bg-[#0A0C10] border-t dark:border-white/5 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <img 
                            src={FORJADECK_LOGO} 
                            className="h-10 md:h-12 w-auto mb-4 object-contain opacity-90 brightness-110" 
                            alt="ForjaDeck Footer" 
                        />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.4em]">Intelligence Database for Invocadores</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                            Hecho con <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> por <span className="text-blue-600 dark:text-blue-400">Alexis Tobar</span>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Powered by</span>
                            <span className="text-[13px] font-black text-slate-900 dark:text-white uppercase italic bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text border-l-2 border-blue-600 dark:border-blue-400 pl-4">Juegos Vikingos</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// COMPONENTES AUXILIARES

function FormatCard({ title, desc, img, icon, onClick, delay }) {
    return (
        <div 
            onClick={onClick}
            className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-10 ${delay}`}
        >
            <div className="h-48 md:h-72 relative overflow-hidden">
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 dark:opacity-60" alt={title} />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/10 dark:via-transparent group-hover:from-blue-50/80 dark:group-hover:from-blue-900/20 transition-colors duration-500"></div>
                <div className="absolute bottom-6 left-8 p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-2xl border border-slate-100 dark:border-white/10 group-hover:-translate-y-2 transition-transform duration-500">
                    {icon}
                </div>
            </div>
            <div className="p-8 md:p-10 pt-6">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 md:mb-8 leading-relaxed">{desc}</p>
                <div className="flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Crea tu Mazo <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                </div>
            </div>
        </div>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="text-center flex flex-col items-center group cursor-default">
            <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 text-blue-600 dark:text-blue-400">
                {icon}
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 italic">{title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-[220px] opacity-70 dark:opacity-60">{text}</p>
        </div>
    );
}
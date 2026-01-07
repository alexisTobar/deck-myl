import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
import { 
    Trophy, Flame, Copy, X, Heart, Globe, MessageSquare, Send, Trash2, ArrowRight, LayoutGrid, Sparkles, Crown, Star
} from "lucide-react";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [newComment, setNewComment] = useState("");
    const navigate = useNavigate();

    // ✅ Por defecto siempre Primer Bloque
    const [activeFormat, setActiveFormat] = useState("primer_bloque");

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const userId = user?.id || user?._id;
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/community/all?top=false`);
            if (res.ok) {
                const data = await res.json();
                setDecks(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${selectedDeck._id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ text: newComment })
            });
            if (res.ok) {
                const updatedDeck = await res.json();
                setSelectedDeck(updatedDeck);
                setDecks(prev => prev.map(d => d._id === updatedDeck._id ? updatedDeck : d));
                setNewComment("");
            }
        } catch (error) { console.error(error); }
    };

    const handleLike = async (deckId, e) => {
        if (e) e.stopPropagation();
        if (!token) return navigate("/login");
        setDecks(prev => prev.map(d => {
            if (d._id === deckId) {
                const hasLiked = d.likes?.includes(userId);
                return { ...d, likes: hasLiked ? d.likes.filter(id => id !== userId) : [...(d.likes || []), userId] };
            }
            return d;
        }));
        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } });
        } catch (error) { console.error(error); }
    };

    const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350";

    const filteredDecks = useMemo(() => {
        return decks.filter(d => (d.format || "primer_bloque") === activeFormat);
    }, [decks, activeFormat]);

    const { topDecks, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        return { topDecks: sorted.slice(0, 3), recentDecks: filteredDecks };
    }, [filteredDecks]);

    if (loading) return <div className="min-h-screen bg-white dark:bg-[#0A0C10] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#06080F] text-slate-900 dark:text-white pb-20 font-sans transition-colors duration-500 overflow-x-hidden">
            
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .podium-container { perspective: 1200px; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>

            {/* --- NAV MINIMALISTA --- */}
            <div className="bg-white/80 dark:bg-[#0A0C10]/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 dark:border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <LayoutGrid size={20} className="text-blue-600" />
                        <h1 className="text-xl font-black uppercase italic tracking-tighter">Comunidad</h1>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 w-full md:w-auto">
                        <button onClick={() => setActiveFormat("primer_bloque")} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "primer_bloque" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400"}`}>PRIMER BLOQUE</button>
                        <button onClick={() => setActiveFormat("imperio")} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "imperio" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400"}`}>IMPERIO</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                
                {/* --- PODIO ÉPICO (ORDEN CORREGIDO PARA MÓVIL) --- */}
                {topDecks.length > 0 && (
                    <div className="mb-24">
                        <div className="flex flex-col items-center mb-16">
                            <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-1 rounded-full border border-yellow-500/20 mb-4 animate-float">
                                <Sparkles size={14} className="text-yellow-500" />
                                <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Hall of Fame</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-center leading-none">Estrategias <span className="text-blue-600">Legendarias</span></h2>
                        </div>
                        
                        {/* El contenedor usa flex-col en móvil para el orden, y md:flex-row para desktop */}
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-10 md:gap-4 podium-container">
                            
                            {/* TOP 2 (En PC sale a la izquierda, en móvil sale segundo) */}
                            <div className="order-2 md:order-1">
                                {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                            </div>

                            {/* TOP 1 (Siempre arriba en móvil gracias a order-first) */}
                            <div className="order-first md:order-2 scale-110 md:scale-125 z-20">
                                {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} featured />}
                            </div>

                            {/* TOP 3 (En PC sale a la derecha, en móvil sale tercero) */}
                            <div className="order-3">
                                {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} />}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GRILLA RECIENTES --- */}
                <div className="flex items-center justify-between mb-10 border-b border-slate-100 dark:border-white/5 pb-6">
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Flame size={24} className="text-orange-500" /> Arsenales <span className="text-blue-600">Recientes</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                    {recentDecks.map(deck => (
                        <MinimalCard key={deck._id} deck={deck} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(deck)} getImg={getImg} />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE (SALA DE ESTRATEGIA) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-[#0B1120] w-full max-w-6xl h-[96vh] md:h-[90vh] rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border-t border-white/10" onClick={e => e.stopPropagation()}>
                        
                        {/* Botón cerrar móvil */}
                        <button onClick={() => setSelectedDeck(null)} className="absolute top-4 right-4 z-[110] p-3 bg-slate-800 rounded-full text-white md:hidden"><X size={24}/></button>

                        {/* Área de Cartas - Scroll Independiente */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar border-b md:border-b-0 md:border-r border-white/5">
                            <div className="text-left mb-10">
                                <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">{selectedDeck.name}</h2>
                                <div className="flex items-center gap-3">
                                    <p className="text-blue-500 text-xs font-black uppercase tracking-widest">Invocador: @{selectedDeck.user?.username}</p>
                                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                                    <span className="text-slate-500 text-[10px] font-bold uppercase">{selectedDeck.cards?.length} Cartas</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 pb-20">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="relative group cursor-zoom-in">
                                        <img src={getImg(c)} className="w-full rounded-2xl shadow-lg border border-white/5 transition-all duration-500 group-hover:scale-110" alt="" />
                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[10px] md:text-xs border-2 border-white dark:border-slate-900 shadow-xl">x{c.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Área de Comentarios - Fija en móvil al final o al lado en PC */}
                        <div className="flex-1 md:max-w-[400px] flex flex-col bg-slate-50 dark:bg-black/20 h-[50vh] md:h-auto">
                            <div className="p-4 border-b border-white/5 font-black text-[10px] uppercase text-slate-400 flex items-center gap-2">
                                <MessageSquare size={14} className="text-blue-500" /> Conversación
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-left">
                                {selectedDeck.comments?.map((com, idx) => (
                                    <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-blue-600 mb-1 uppercase">@{com.username}</p>
                                        <p className="text-sm font-medium dark:text-slate-300 leading-relaxed italic">"{com.text}"</p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Input de Comentario Fijo al fondo del modal */}
                            <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-white/5">
                                <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-2xl shadow-inner">
                                    <input 
                                        value={newComment} 
                                        onChange={e => setNewComment(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Escribe tu táctica..." 
                                        className="flex-1 bg-transparent border-0 px-4 py-2 text-xs outline-none font-medium" 
                                    />
                                    <button onClick={handleAddComment} className="bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-500 active:scale-90 transition-all"><Send size={18}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PodiumCard({ deck, rank, onLike, userId, onClick, getImg, featured }) {
    const isFirst = rank === 1;
    return (
        <div className="relative flex flex-col items-center group">
            {isFirst && <Crown size={48} className="text-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-bounce" fill="currentColor" />}
            
            <div onClick={onClick} className={`relative cursor-pointer overflow-hidden rounded-[2.5rem] border-4 transition-all duration-700 
                ${featured ? 'w-64 h-85 md:w-72 md:h-96 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)]' : 'w-52 h-72 md:w-60 md:h-80 border-slate-200 dark:border-white/10 opacity-90'}
                group-hover:rotate-2 group-hover:scale-105`}>
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <div className={`absolute top-5 left-5 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl ${isFirst ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-white'}`}>{rank}</div>
                <div className="absolute bottom-8 px-6 w-full text-center">
                    <p className="text-white font-black uppercase italic text-lg leading-tight mb-1">{deck.name}</p>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">@{deck.user?.username}</p>
                </div>
            </div>

            <button onClick={(e) => onLike(deck._id, e)} className={`mt-6 flex items-center gap-3 px-8 py-2.5 rounded-full border transition-all active:scale-90 shadow-xl ${deck.likes?.includes(userId) ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
                <Heart size={16} className={deck.likes?.includes(userId) ? "fill-white" : "text-slate-400"} />
                <span className="text-xs font-black">{deck.likes?.length || 0}</span>
            </button>
        </div>
    );
}

function MinimalCard({ deck, onLike, userId, onClick, getImg }) {
    return (
        <div onClick={onClick} className="group cursor-pointer">
            <div className="relative aspect-[3/4.2] rounded-[2.5rem] overflow-hidden bg-white dark:bg-white/5 border-2 border-transparent group-hover:border-blue-600/50 transition-all duration-500 shadow-lg">
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-90 dark:opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-6 w-full text-left">
                    <p className="text-white font-black uppercase italic text-sm md:text-base mb-1 truncate group-hover:text-blue-400 transition-colors">{deck.name}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">by @{deck.user?.username}</span>
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg">
                            <Heart size={10} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-slate-400"} />
                            <span className="text-[10px] text-white font-black">{deck.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
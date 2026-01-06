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
            
            {/* --- ESTILOS EXTRA --- */}
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .glow-gold { box-shadow: 0 0 30px rgba(234, 179, 8, 0.2); }
                .podium-container { perspective: 1000px; }
            `}</style>

            {/* --- NAV MINIMALISTA --- */}
            <div className="bg-white/80 dark:bg-[#0A0C10]/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 dark:border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/10 rounded-xl">
                             <LayoutGrid size={20} className="text-blue-600" />
                        </div>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter">Comunidad <span className="text-blue-600 text-xs not-italic font-bold tracking-widest ml-1 opacity-50">DATABASE</span></h1>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-white/10">
                        <button 
                            onClick={() => setActiveFormat("primer_bloque")} 
                            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "primer_bloque" ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            PRIMER BLOQUE
                        </button>
                        <button 
                            onClick={() => setActiveFormat("imperio")} 
                            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "imperio" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            IMPERIO
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                
                {/* --- PODIO ÉPICO (TOP 3) --- */}
                {topDecks.length > 0 && (
                    <div className="mb-24">
                        <div className="flex flex-col items-center mb-12">
                            <div className="flex items-center gap-3 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 mb-4 animate-float">
                                <Trophy size={16} className="text-yellow-500" />
                                <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.3em]">Hall of Fame</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-center">Estrategias <span className="text-blue-600">Maestras</span></h2>
                        </div>
                        
                        {/* ✅ ORDEN CORREGIDO PARA MOVIL: Top 1 (0) -> Top 2 (1) -> Top 3 (2) */}
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-4 podium-container">
                            {/* TOP 2 - Solo visible en orden lateral en Desktop */}
                            <div className="hidden md:block">
                                {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                            </div>

                            {/* TOP 1 - Siempre primero en móvil */}
                            <div className="order-first md:order-none scale-105 md:scale-125 z-20">
                                {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} featured />}
                            </div>

                            {/* TOP 2 en móvil */}
                            <div className="md:hidden">
                                {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                            </div>

                            {/* TOP 3 */}
                            <div className="z-10">
                                {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} />}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GRILLA RECIENTES --- */}
                <div className="flex items-center justify-between mb-10 border-b border-slate-100 dark:border-white/5 pb-6">
                    <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Flame size={24} className="text-orange-500" /> Explorar <span className="text-blue-600">Recientes</span>
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{recentDecks.length} Mazos</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                    {recentDecks.map(deck => (
                        <MinimalCard key={deck._id} deck={deck} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(deck)} getImg={getImg} />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE (Integración Visual) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-[#0B1120] w-full max-w-6xl max-h-[95vh] rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
                        <div className="flex-[1.5] p-6 md:p-12 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-10">
                                <div className="text-left">
                                    <h2 className="text-3xl md:text-6xl font-black uppercase italic italic leading-none tracking-tighter">{selectedDeck.name}</h2>
                                    <div className="flex items-center gap-3 mt-4">
                                        <p className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase">@{selectedDeck.user?.username}</p>
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{selectedDeck.cards?.length} Cartas</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={24}/></button>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="relative group cursor-zoom-in">
                                        <img src={getImg(c)} className="w-full rounded-2xl shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500" alt="" />
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-xl border-2 border-white dark:border-slate-900">x{c.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lateral Comentarios */}
                        <div className="flex-1 bg-slate-50 dark:bg-white/5 p-8 border-l dark:border-white/5 flex flex-col min-h-0">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare size={18} className="text-blue-600" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Debate de Estrategia</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 mb-8 custom-scrollbar px-2 text-left">
                                {selectedDeck.comments?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 italic opacity-50">
                                        <MessageSquare size={40} className="mb-4" />
                                        <p className="text-xs font-bold">Sé el primero en comentar</p>
                                    </div>
                                ) : selectedDeck.comments?.map((com, idx) => (
                                    <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                        <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-tighter">@{com.username}</p>
                                        <p className="text-[13px] font-medium leading-relaxed dark:text-slate-300">{com.text}</p>
                                    </div>
                                ))}
                            </div>
                            {token && (
                                <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-inner">
                                    <input 
                                        value={newComment} 
                                        onChange={e => setNewComment(e.target.value)} 
                                        onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Escribe tu táctica..." 
                                        className="flex-1 bg-transparent border-0 px-4 py-2 text-xs outline-none font-medium" 
                                    />
                                    <button onClick={handleAddComment} className="bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"><Send size={18}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ✅ SUBCOMPONENTE DE PODIO MEJORADO
function PodiumCard({ deck, rank, onLike, userId, onClick, getImg, featured }) {
    const isFirst = rank === 1;
    
    return (
        <div className={`relative flex flex-col items-center transition-all duration-500 group`}>
            {/* Efectos de corona para el primer lugar */}
            {isFirst && <Crown size={48} className="text-yellow-500 mb-2 drop-shadow-xl animate-bounce" fill="currentColor" />}
            
            <div 
                onClick={onClick} 
                className={`
                    relative cursor-pointer overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500
                    ${featured 
                        ? 'w-64 h-80 md:w-72 md:h-96 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)] z-10 hover:rotate-2' 
                        : 'w-52 h-72 md:w-60 md:h-80 border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:-rotate-2 opacity-90 hover:opacity-100'
                    }
                `}
            >
                {/* Fondo de carta y overlay */}
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent`} />
                
                {/* Rank Badge */}
                <div className={`absolute top-6 left-6 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl
                    ${rank === 1 ? 'bg-yellow-500 text-black' : rank === 2 ? 'bg-slate-300 text-black' : 'bg-orange-600 text-white'}
                `}>
                    {rank}
                </div>

                {/* Info Deck */}
                <div className="absolute bottom-8 px-6 w-full text-center">
                    <p className="text-white font-black uppercase italic text-lg leading-tight mb-1 drop-shadow-lg">{deck.name}</p>
                    <div className="flex items-center justify-center gap-2">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">@{deck.user?.username}</p>
                    </div>
                </div>
            </div>

            {/* Like Button */}
            <button 
                onClick={(e) => onLike(deck._id, e)} 
                className={`
                    mt-6 flex items-center gap-3 px-6 py-2 rounded-full border transition-all active:scale-90
                    ${deck.likes?.includes(userId) 
                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-red-500/50'
                    }
                `}
            >
                <Heart size={14} className={deck.likes?.includes(userId) ? "fill-white" : "text-slate-300"} />
                <span className="text-xs font-black tracking-tighter">{deck.likes?.length || 0}</span>
            </button>
        </div>
    );
}

// ✅ TARJETA MINIMALISTA RECIENTES
function MinimalCard({ deck, onLike, userId, onClick, getImg }) {
    return (
        <div onClick={onClick} className="group cursor-pointer">
            <div className="relative aspect-[3/4.2] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-white/5 border-2 border-transparent group-hover:border-blue-600/50 transition-all duration-500 shadow-xl">
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-90 dark:opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                     <span className="bg-white/10 backdrop-blur-md border border-white/20 text-[8px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest italic">{deck.format?.replace('_', ' ')}</span>
                </div>

                <div className="absolute bottom-0 p-6 w-full text-left">
                    <p className="text-white font-black uppercase italic text-sm md:text-base leading-none mb-2 truncate group-hover:text-blue-400 transition-colors">{deck.name}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">by @{deck.user?.username}</span>
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Heart size={10} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-slate-300"} />
                            <span className="text-[10px] text-white font-black">{deck.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
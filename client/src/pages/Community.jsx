import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
import { 
    Trophy, Flame, Copy, X, Heart, Globe, MessageSquare, Send, Trash2, ArrowRight, LayoutGrid
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
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0C10] text-slate-900 dark:text-white pb-20 font-sans transition-colors duration-500">
            
            {/* --- NAV MINIMALISTA --- */}
            <div className="bg-white/80 dark:bg-[#0A0C10]/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 dark:border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <LayoutGrid size={20} className="text-blue-600" />
                        <h1 className="text-xl font-black uppercase italic tracking-tighter">Comunidad</h1>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                        <button 
                            onClick={() => setActiveFormat("primer_bloque")} 
                            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "primer_bloque" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400"}`}
                        >
                            PRIMER BLOQUE
                        </button>
                        <button 
                            onClick={() => setActiveFormat("imperio")} 
                            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "imperio" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400"}`}
                        >
                            IMPERIO
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                {/* --- PODIO --- */}
                {topDecks.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 mb-20">
                        {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                        {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} featured />}
                        {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} />}
                    </div>
                )}

                {/* --- GRILLA RECIENTES --- */}
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                    <Flame size={16} /> Estrategias Recientes
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recentDecks.map(deck => (
                        <MinimalCard key={deck._id} deck={deck} onLike={handleLike} userId={userId} onClick={() => setSelectedDeck(deck)} getImg={getImg} />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE (Simplificado) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-[#111827] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        <div className="flex-[2] p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic leading-none">{selectedDeck.name}</h2>
                                    <p className="text-blue-600 text-[10px] font-bold mt-2">@{selectedDeck.user?.username}</p>
                                </div>
                                <button onClick={() => setSelectedDeck(null)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:text-red-500 transition-colors"><X size={20}/></button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="relative">
                                        <img src={getImg(c)} className="w-full rounded-lg shadow-sm" alt="" />
                                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black">x{c.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-white/5 p-8 border-l dark:border-white/5 flex flex-col">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Comentarios</h3>
                            <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scrollbar">
                                {selectedDeck.comments?.map((com, idx) => (
                                    <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-blue-500 mb-1">@{com.username}</p>
                                        <p className="text-[11px] opacity-70">{com.text}</p>
                                    </div>
                                ))}
                            </div>
                            {token && (
                                <div className="flex gap-2">
                                    <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Escribe..." className="flex-1 bg-white dark:bg-white/10 border-0 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-blue-500" />
                                    <button onClick={handleAddComment} className="bg-blue-600 p-2 rounded-xl text-white"><Send size={16}/></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PodiumCard({ deck, rank, onLike, userId, onClick, getImg, featured }) {
    return (
        <div className={`relative flex flex-col items-center transition-all ${featured ? 'md:scale-110 z-10' : 'opacity-80'}`}>
            <div onClick={onClick} className={`cursor-pointer overflow-hidden rounded-[2.5rem] border-4 ${featured ? 'border-blue-600 shadow-2xl shadow-blue-600/20' : 'border-white dark:border-white/10'} w-48 h-64 md:w-56 md:h-72 relative`}>
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute top-4 left-4 w-8 h-8 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-sm">{rank}</div>
                <div className="absolute bottom-6 px-4 w-full text-center">
                    <p className="text-white font-black uppercase italic text-sm truncate">{deck.name}</p>
                    <p className="text-blue-400 text-[9px] font-bold">@{deck.user?.username}</p>
                </div>
            </div>
            <button onClick={(e) => onLike(deck._id, e)} className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                <Heart size={12} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-slate-300"} />
                <span className="text-[10px] font-black">{deck.likes?.length || 0}</span>
            </button>
        </div>
    );
}

function MinimalCard({ deck, onLike, userId, onClick, getImg }) {
    return (
        <div onClick={onClick} className="group cursor-pointer">
            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5 border border-transparent group-hover:border-blue-600/30 transition-all shadow-sm">
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-80 dark:opacity-40 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                <div className="absolute bottom-0 p-4 w-full">
                    <p className="text-white font-black uppercase italic text-[11px] truncate mb-1">{deck.name}</p>
                    <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-blue-400 uppercase">@{deck.user?.username}</span>
                        <div className="flex items-center gap-1">
                            <Heart size={10} className="fill-red-500 text-red-500" />
                            <span className="text-[9px] text-white font-bold">{deck.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BACKEND_URL from "../config";
import { 
    Trophy, Flame, Copy, X, Heart, Globe, MessageSquare, Send, Trash2, ArrowRight, Lock 
} from "lucide-react";

export default function CommunityImperio() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [showMobileComments, setShowMobileComments] = useState(false); 
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ FIJAMOS EL FORMATO A IMPERIO
    const activeFormat = "imperio";

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const userId = user?.id || user?._id;
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        fetchDecks();
    }, []);

    // ✅ Lógica para abrir mazo automáticamente desde el Home (Redirección inteligente)
    useEffect(() => {
        if (!loading && location.state?.autoOpenDeckId && decks.length > 0) {
            const deckToOpen = decks.find(d => d._id === location.state.autoOpenDeckId);
            if (deckToOpen) {
                setSelectedDeck(deckToOpen);
                // Limpiamos el estado para evitar reaperturas accidentales
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, decks, loading]);

    const fetchDecks = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/community/all?top=false`);
            if (res.ok) {
                const data = await res.json();
                setDecks(data);
            }
        } catch (error) {
            console.error("Error cargando comunidad Imperio:", error);
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

    const handleDeleteComment = async (commentId) => {
        if (!isAdmin) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${selectedDeck._id}/comment/${commentId}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                const updatedDeck = await res.json();
                setSelectedDeck(updatedDeck);
                setDecks(prev => prev.map(d => d._id === updatedDeck._id ? updatedDeck : d));
            }
        } catch (error) { console.error(error); }
    };

    const handleLike = async (deckId, e) => {
        if (e) e.stopPropagation();
        if (!token) return navigate("/login");
        const updatedDecks = decks.map(d => {
            if (d._id === deckId) {
                const hasLiked = d.likes?.includes(userId);
                return { ...d, likes: hasLiked ? d.likes.filter(id => id !== userId) : [...(d.likes || []), userId] };
            }
            return d;
        });
        setDecks(updatedDecks);
        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } });
        } catch (error) { console.error(error); }
    };

    const handleClone = (deck) => {
        navigate('/imperio/builder', { state: { deckToEdit: deck, isCloning: true } });
    };

    const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

    // ✅ Filtramos solo para Imperio
    const filteredDecks = useMemo(() => {
        return decks.filter(d => (d.format || "imperio") === "imperio");
    }, [decks]);

    const { topDecks, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        const sortedByDate = [...filteredDecks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { topDecks: sorted.slice(0, 3), recentDecks: sortedByDate };
    }, [filteredDecks]);

    if (loading) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center transition-colors"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white pb-32 font-sans overflow-x-hidden transition-colors duration-500">
            {/* Header Imperio */}
            <div className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 px-4 py-3 md:px-6 md:py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"><Globe size={18} className="text-white" /></div>
                        <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic">Arena Imperio <span className="text-indigo-600">Comunidad</span></h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-16">
                {/* Ranking Imperio */}
                {topDecks.length > 0 && (
                    <div className="mb-20">
                        <div className="flex flex-col items-center mb-10">
                            <Trophy size={28} className="text-indigo-600 mb-2" />
                            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-center">Invocadores <span className="text-indigo-600">Dominantes</span></h2>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6">
                            {topDecks[1] && <RankingPodiumItem deck={topDecks[1]} rank={2} color="bg-slate-400 dark:bg-slate-700" height="h-56 md:h-64" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                            {topDecks[0] && <RankingPodiumItem deck={topDecks[0]} rank={1} color="bg-indigo-600" height="h-64 md:h-80" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} isWinner />}
                            {topDecks[2] && <RankingPodiumItem deck={topDecks[2]} rank={3} color="bg-orange-500 dark:bg-orange-800" height="h-48 md:h-56" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} />}
                        </div>
                    </div>
                )}

                <h2 className="text-lg font-black flex items-center gap-3 uppercase italic mb-8 border-b dark:border-white/5 pb-4"><Flame className="text-red-500" size={18} /> Metajuego Reciente</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentDecks.map(deck => <StandardCard key={deck._id} deck={deck} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(deck)} getImg={getImg} />)}
                </div>
            </div>

            {/* Modal Detalle */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/95 flex items-end md:items-center justify-center transition-all" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[95vh] md:h-[90vh] rounded-t-[2.5rem] md:rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex-[3] flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
                            <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                                <div><h2 className="text-xl md:text-3xl font-black uppercase italic leading-none">{selectedDeck.name}</h2><p className="text-[10px] uppercase text-slate-400 mt-1">Arquitecto: @{selectedDeck.user?.username || 'Anónimo'}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleClone(selectedDeck)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg"><Copy size={14} /> Clonar</button>
                                    <button onClick={() => setSelectedDeck(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500"><X size={18} /></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group"><img src={getImg(c)} className="w-full rounded-xl shadow-sm transition-transform group-hover:scale-105" alt={c.name} /><div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-lg border-2 border-white dark:border-slate-900">x{c.quantity}</div></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Panel Comentarios */}
                        <div className="flex-[1.2] flex flex-col bg-white dark:bg-slate-900">
                             <div className="p-5 border-b font-black text-[10px] uppercase text-indigo-600 tracking-widest flex items-center gap-2 bg-slate-50 dark:bg-slate-900/30"><MessageSquare size={14} /> Conversación</div>
                             <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                                {selectedDeck.comments?.map((com, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                        <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">@{com.username}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{com.text}</p>
                                    </div>
                                ))}
                                {selectedDeck.comments?.length === 0 && <p className="text-center text-[10px] uppercase text-slate-400 py-10 opacity-30">Sin comentarios todavía</p>}
                             </div>
                             <div className="p-5 border-t dark:border-white/5"><div className="flex gap-2"><input type="text" placeholder="Escribe un mensaje..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-4 py-2 text-xs focus:ring-2 ring-indigo-500 outline-none" /><button onClick={handleAddComment} className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg active:scale-95 transition-transform"><Send size={16} /></button></div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RankingPodiumItem({ deck, rank, color, height, userId, onLike, onClick, getImg, isWinner }) {
    return (
        <div className={`flex flex-col items-center group w-full md:w-auto ${isWinner ? 'z-20 md:scale-105' : 'z-10'}`}>
            <div onClick={onClick} className={`relative w-[85%] md:w-52 lg:w-64 overflow-hidden rounded-t-[2.5rem] border-x-4 border-t-4 transition-all cursor-pointer shadow-2xl ${isWinner ? 'border-indigo-600' : 'border-slate-200 dark:border-white/10'}`}>
                <div className={`${height} relative bg-white dark:bg-slate-900`}>
                    <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 font-black shadow-xl border dark:border-white/10">{rank}</div>
                    <div className="absolute bottom-3 left-0 w-full px-4 text-center"><h3 className="font-black text-sm uppercase italic tracking-tighter truncate text-slate-900 dark:text-white leading-tight">{deck.name}</h3><p className="text-indigo-600 text-[8px] font-black uppercase mt-1">@{deck.user?.username || 'Anónimo'}</p></div>
                </div>
            </div>
            <button onClick={(e) => onLike(deck._id, e)} className={`w-[85%] md:w-52 lg:w-64 h-14 ${color} flex items-center justify-center rounded-b-2xl border-t border-white/10 hover:brightness-110 transition-all`}>
                <Heart size={18} className={deck.likes?.includes(userId) ? "fill-white text-white" : "text-white/60"} />
                <span className="ml-2 text-sm font-black text-white">{deck.likes?.length || 0}</span>
            </button>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick, getImg }) {
    return (
        <div onClick={onClick} className="group bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col shadow-sm">
            <div className="h-32 md:h-40 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={getImg(deck.cards?.[0])} className="w-full h-full object-cover opacity-80 dark:opacity-50 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-2 px-3 w-full"><h4 className="text-[10px] md:text-xs font-black uppercase italic truncate leading-none text-slate-900 dark:text-white">{deck.name}</h4></div>
            </div>
            <div className="p-3 md:p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center"><span className="text-[8px] font-black text-indigo-600 uppercase truncate max-w-[80px]">@{deck.user?.username || 'Anónimo'}</span><button onClick={(e) => onLike(deck._id, e)} className="flex items-center gap-1 hover:scale-110 transition-transform"><Heart size={14} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-slate-300"} /><span className="text-[9px] font-black text-slate-400">{deck.likes?.length || 0}</span></button></div>
            </div>
        </div>
    );
}
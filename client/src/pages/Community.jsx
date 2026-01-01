import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
import { 
    Trophy, Flame, Copy, X, Heart, Globe, MessageSquare, Send, Trash2, ArrowRight 
} from "lucide-react";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [newComment, setNewComment] = useState("");
    const navigate = useNavigate();

    const [activeFormat, setActiveFormat] = useState("imperio");

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
            console.error("Error cargando comunidad:", error);
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
        } catch (error) {
            console.error("Error al comentar:", error);
        }
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
        } catch (error) {
            console.error("Error al borrar comentario:", error);
        }
    };

    const handleLike = async (deckId, e) => {
        if (e) e.stopPropagation();
        if (!token) return navigate("/login");

        const updatedDecks = decks.map(d => {
            if (d._id === deckId) {
                const hasLiked = d.likes?.includes(userId);
                return {
                    ...d,
                    likes: hasLiked ? d.likes.filter(id => id !== userId) : [...(d.likes || []), userId]
                };
            }
            return d;
        });
        setDecks(updatedDecks);

        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, {
                method: "PUT",
                headers: { "auth-token": token }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleClone = (deck) => {
        const path = deck.format === 'primer_bloque' ? '/primer-bloque/builder' : '/imperio/builder';
        navigate(path, { state: { deckToEdit: deck, isCloning: true } });
    };

    const getImg = (c) => {
        if (!c) return "https://via.placeholder.com/250x350?text=No+Image";
        return c.imgUrl || c.imageUrl || c.img || "https://via.placeholder.com/250x350?text=No+Image";
    };

    const filteredDecks = useMemo(() => {
        return decks.filter(d => (d.format || "imperio") === activeFormat);
    }, [decks, activeFormat]);

    const { topDecks, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        const sortedByDate = [...filteredDecks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return {
            topDecks: sorted.slice(0, 3),
            recentDecks: sortedByDate
        };
    }, [filteredDecks]);

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white pb-32 font-sans overflow-x-hidden transition-colors duration-500">

            {/* --- HEADER --- */}
            <div className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 px-4 py-3 md:px-6 md:py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <Globe size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic">
                            La Arena <span className="text-blue-600">Global</span>
                        </h1>
                    </div>

                    <div className="flex w-full md:w-auto bg-slate-100 dark:bg-black/40 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        <button onClick={() => setActiveFormat("imperio")} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "imperio" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>🏛️ IMPERIO</button>
                        <button onClick={() => setActiveFormat("primer_bloque")} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeFormat === "primer_bloque" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>📜 PB</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-16">
                {/* --- PODIO --- */}
                {topDecks.length > 0 ? (
                    <div className="mb-20 md:mb-32">
                        <div className="flex flex-col items-center mb-10">
                            <Trophy size={28} className="text-blue-600 mb-2" />
                            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-center">Invocadores <span className="text-blue-600">Legendarios</span></h2>
                            <div className="h-1 w-10 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-0">
                            {topDecks[1] && <RankingPodiumItem deck={topDecks[1]} rank={2} color="bg-slate-400 dark:bg-slate-700" height="h-56 md:h-64" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} />}
                            {topDecks[0] && <RankingPodiumItem deck={topDecks[0]} rank={1} color="bg-blue-600" height="h-64 md:h-80" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} isWinner />}
                            {topDecks[2] && <RankingPodiumItem deck={topDecks[2]} rank={3} color="bg-orange-500 dark:bg-orange-800" height="h-48 md:h-56" userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} />}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 mb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic px-4">No hay estrategias registradas para este formato aún</p>
                    </div>
                )}

                {/* --- RECIENTES --- */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-white/5 pb-4">
                    <h2 className="text-lg md:text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter">
                        <Flame className="text-blue-600" size={18} /> Estrategias <span className="text-blue-600">Recientes</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {recentDecks.map(deck => (
                        <StandardCard key={deck._id} deck={deck} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(deck)} getImg={getImg} />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE (ESTRUCTURA CORREGIDA PARA SCROLL) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/95 md:backdrop-blur-md flex items-end md:items-center justify-center" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[95vh] md:h-[90vh] rounded-t-[2.5rem] md:rounded-[2.5rem] border-x border-t md:border border-slate-200 dark:border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

                        {/* Columna Izquierda: Cartas (Scroll Independiente) */}
                        <div className="flex-[3] flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
                            {/* Cabecera Interna Fija */}
                            <div className="p-5 md:p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 flex-shrink-0">
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate">{selectedDeck.name}</h2>
                                    <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase mt-1 tracking-widest">Por: @{selectedDeck.user?.username || "Invocador"}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button onClick={() => handleClone(selectedDeck)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all"><Copy size={14} /> Clonar</button>
                                    <button onClick={() => setSelectedDeck(null)} className="p-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-red-500 transition-colors"><X size={18} /></button>
                                </div>
                            </div>
                            
                            {/* ✅ CONTENEDOR DE CARTAS CON SCROLL GARANTIZADO */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group">
                                            <img src={getImg(c)} className="w-full rounded-xl border border-slate-200 dark:border-white/5 shadow-sm transition-transform group-hover:scale-105" alt={c.name} />
                                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-lg shadow-lg border-2 border-white dark:border-slate-900">x{c.quantity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Comentarios (Scroll Independiente) */}
                        <div className="flex-[1.2] md:max-w-[400px] bg-white dark:bg-slate-800/20 flex flex-col min-h-0">
                            <div className="p-5 border-b border-slate-200 dark:border-white/5 font-black text-[10px] uppercase flex items-center gap-2 text-blue-600 bg-slate-50 dark:bg-slate-900/30 flex-shrink-0">
                                <MessageSquare size={16} /> Conversación ({selectedDeck.comments?.length || 0})
                            </div>
                            
                            {/* Lista de Comentarios con Scroll */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-transparent custom-scrollbar">
                                {selectedDeck.comments?.map((com, idx) => (
                                    <div key={com._id || idx} className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5 transition-all hover:border-blue-500/30">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">@{com.username}</p>
                                            {isAdmin && <button onClick={() => handleDeleteComment(com._id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{com.text}</p>
                                    </div>
                                ))}
                                {(!selectedDeck.comments || selectedDeck.comments.length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-slate-400 py-10">
                                        <MessageSquare size={32} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Silencio en la arena...</p>
                                    </div>
                                )}
                            </div>

                            {/* Input Fijo al Fondo */}
                            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex-shrink-0">
                                {token ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Escribe un comentario..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition-all dark:text-white shadow-sm"
                                        />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg active:scale-95 transition-transform"><Send size={18} /></button>
                                    </div>
                                ) : (
                                    <div className="text-center cursor-pointer group" onClick={() => navigate("/login")}>
                                        <p className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase italic tracking-widest">Inicia sesión para participar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUBCOMPONENTES ---
function RankingPodiumItem({ deck, rank, color, height, userId, onLike, onClick, getImg, isWinner }) {
    const bgImage = getImg(deck.cards?.[0]);
    return (
        <div className={`flex flex-col items-center group w-full md:w-auto ${isWinner ? 'z-20 md:scale-105' : 'z-10'}`}>
            <div onClick={onClick} className={`relative w-[85%] md:w-52 lg:w-60 overflow-hidden rounded-t-[2.5rem] border-x-2 border-t-2 md:border-x-4 md:border-t-4 transition-all cursor-pointer shadow-2xl ${isWinner ? 'border-blue-600' : 'border-slate-200 dark:border-white/10'}`}>
                <div className={`${height} relative bg-white dark:bg-slate-900`}>
                    <img src={bgImage} className="w-full h-full object-cover opacity-60 dark:opacity-40 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent"></div>
                    <div className={`absolute top-4 left-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl shadow-xl font-black text-sm md:text-lg border-2 ${isWinner ? 'bg-blue-600 text-white border-white/20' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-white/10'}`}>{rank}</div>
                    <div className="absolute bottom-3 left-0 w-full px-4 text-center">
                        <h3 className="font-black text-sm md:text-base uppercase italic tracking-tighter truncate text-slate-900 dark:text-white leading-tight">{deck.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase mt-1">@{deck.user?.username || "Invocador"}</p>
                    </div>
                </div>
            </div>
            <div className={`w-[85%] md:w-52 lg:w-60 h-12 md:h-14 ${color} flex items-center justify-center shadow-inner rounded-b-2xl border-t border-white/10`}>
               <div className="flex items-center gap-2">
                    <Heart size={14} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-white opacity-60"} />
                    <span className="text-xs font-black text-white">{deck.likes?.length || 0}</span>
               </div>
            </div>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick, getImg }) {
    const bgImage = getImg(deck.cards?.[0]);
    return (
        <div onClick={onClick} className="group bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col shadow-sm">
            <div className="h-32 md:h-40 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={bgImage} className="w-full h-full object-cover opacity-80 dark:opacity-50 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 px-3 w-full">
                    <h4 className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none">{deck.name}</h4>
                </div>
            </div>
            <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase truncate max-w-[80px]">@{deck.user?.username || "Invocador"}</span>
                    <div className="flex items-center gap-1">
                        <Heart size={12} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-slate-300"} />
                        <span className="text-[9px] font-black text-slate-400">{deck.likes?.length || 0}</span>
                    </div>
                </div>
                <div className="h-[1px] w-full bg-slate-100 dark:bg-white/5"></div>
                <div className="flex items-center justify-between">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Detalles</span>
                     <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
            </div>
        </div>
    );
}
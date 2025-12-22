import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const navigate = useNavigate();
    const [activeFormat, setActiveFormat] = useState("imperio"); 

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const userId = user?.id || user?._id;

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

    const handleLike = async (deckId, e) => {
        if(e) e.stopPropagation();
        if (!token) return navigate("/login");
        const updatedDecks = decks.map(d => {
            if (d._id === deckId) {
                const hasLiked = d.likes?.includes(userId);
                return { ...d, likes: hasLiked ? d.likes.filter(id => id !== userId) : [...(d.likes || []), userId] };
            }
            return d;
        });
        setDecks(updatedDecks);
        try { await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } }); } catch (error) {}
    };

    // ✅ FILTRADO POR FORMATO SELECCIONADO
    const filteredDecks = useMemo(() => {
        return decks.filter(d => (d.format || "imperio") === activeFormat);
    }, [decks, activeFormat]);

    const { topDecks, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        return {
            topDecks: sorted.slice(0, 3),
            recentDecks: [...filteredDecks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
    }, [filteredDecks]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-24 font-sans">
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">La Arena <span className="text-orange-500">Global</span></h1>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button onClick={() => setActiveFormat("imperio")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFormat === "imperio" ? "bg-orange-600 text-white" : "text-slate-400"}`}>🏛️ IMPERIO</button>
                    <button onClick={() => setActiveFormat("primer_bloque")} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFormat === "primer_bloque" ? "bg-yellow-600 text-white" : "text-slate-400"}`}>📜 PRIMER BLOQUE</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                {topDecks.length > 0 ? (
                    <div className="mb-12">
                        <h2 className="text-center text-2xl font-bold mb-8">🏆 Salón de la Fama</h2>
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6">
                            {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[1])} />}
                            {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[0])} />}
                            {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[2])} />}
                        </div>
                    </div>
                ) : <div className="text-center py-20 opacity-50">No hay mazos públicos en este formato aún.</div>}

                <h2 className="text-xl font-bold mb-6">🔥 Recientes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentDecks.map(deck => <StandardCard key={deck._id} deck={deck} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(deck)} />)}
                </div>
            </div>

            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 bg-slate-900 flex justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase">{selectedDeck.name}</h2>
                                <p className="text-orange-400 font-bold text-sm">Por: {selectedDeck.user?.username || "Juegos Vikingos"}</p>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="text-white text-2xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {selectedDeck.cards.map((c, i) => (
                                <div key={i} className="relative">
                                    <img src={getImg(c)} className="w-full rounded shadow-lg border border-slate-800" alt={c.name} />
                                    <div className="absolute bottom-0 right-0 bg-black/80 text-orange-400 px-2 text-[10px] font-bold rounded-tl-lg">x{c.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PodiumCard({ deck, rank, userId, onLike, onClick }) {
    const isGold = rank === 1;
    const bgImage = getImg(deck.cards?.[0]);
    return (
        <div onClick={onClick} className={`${isGold ? 'md:w-80 h-[26rem] border-yellow-500' : 'md:w-64 h-80 border-slate-700'} w-full relative rounded-3xl overflow-hidden border-4 shadow-2xl cursor-pointer group transition-all`}>
            <div className="absolute inset-0 bg-slate-900">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute top-4 left-4 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">#{rank}</div>
            <div className="absolute bottom-0 p-6">
                <h3 className="font-bold text-xl drop-shadow-md">{deck.name}</h3>
                <p className="text-slate-400 text-xs mb-4">@{deck.user?.username || "Juegos Vikingos"}</p>
                <button onClick={(e) => onLike(deck._id, e)} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md">
                    {deck.likes?.includes(userId) ? '❤️' : '🤍'} {deck.likes?.length || 0}
                </button>
            </div>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick }) {
    const bgImage = getImg(deck.cards?.[0]);
    return (
        <div onClick={onClick} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all cursor-pointer group">
            <div className="h-32 bg-slate-900 relative overflow-hidden">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />}
                <div className="absolute bottom-2 left-3 font-bold truncate w-11/12">{deck.name}</div>
            </div>
            <div className="p-4 flex justify-between items-center bg-slate-800">
                <div className="text-[10px] text-slate-400 font-bold truncate max-w-[100px]">@{deck.user?.username || "Juegos Vikingos"}</div>
                <button onClick={(e) => onLike(deck._id, e)} className="text-xs font-bold flex items-center gap-1">
                    {deck.likes?.includes(userId) ? '❤️' : '🤍'} {deck.likes?.length || 0}
                </button>
            </div>
        </div>
    );
}
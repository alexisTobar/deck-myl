import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const navigate = useNavigate();
    
    // Filtro activo
    const [activeFormat, setActiveFormat] = useState("imperio");

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const userId = user?.id || user?._id;

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        try {
            // Usamos el endpoint que ya tienes
            const res = await fetch(`${BACKEND_URL}/api/decks/community/all?top=false`);
            if (res.ok) {
                const data = await res.json();
                console.log("Mazos recibidos en Comunidad:", data); // Mira la consola para ver qué llega
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
                return {
                    ...d,
                    likes: hasLiked ? d.likes.filter(id => id !== userId) : [...(d.likes || []), userId]
                };
            }
            return d;
        });
        setDecks(updatedDecks);
        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } });
        } catch (error) { console.error(error); }
    };

    // --- FILTRADO INTELIGENTE ---
    const filteredDecks = useMemo(() => {
        return decks.filter(d => {
            // Si el mazo no tiene formato definido, lo mostramos en Imperio por defecto para que no desaparezca
            const deckFormat = d.format || "imperio"; 
            return deckFormat === activeFormat;
        });
    }, [decks, activeFormat]);

    const { topDecks, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        return {
            topDecks: sorted.slice(0, 3),
            recentDecks: [...filteredDecks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
    }, [filteredDecks]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-24 font-sans">
            
            {/* --- HEADER --- */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                            <span className="text-2xl font-bold">⚔️</span>
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">La Arena</h1>
                    </div>

                    {/* SELECTOR DE FORMATO */}
                    <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button 
                            onClick={() => setActiveFormat("imperio")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFormat === "imperio" ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            🏛️ IMPERIO
                        </button>
                        <button 
                            onClick={() => setActiveFormat("primer_bloque")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeFormat === "primer_bloque" ? "bg-yellow-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            📜 PRIMER BLOQUE
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                
                {/* --- PODIO --- */}
                {topDecks.length > 0 ? (
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold mb-10 text-center flex items-center justify-center gap-2">
                            🏆 Salón de la Fama
                        </h2>
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6">
                            {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[1])} />}
                            {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[0])} />}
                            {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[2])} />}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-800/50 mb-10">
                        <p className="text-slate-500 text-xl">Aún no hay mazos públicos en {activeFormat === "imperio" ? "Imperio" : "Primer Bloque"}.</p>
                        <p className="text-sm text-slate-600 mt-2">¡Crea uno y cámbiale la privacidad a Público! 🌍</p>
                    </div>
                )}

                {/* --- GRILLA RECIENTES --- */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🔥 Recientes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentDecks.map(deck => (
                        <StandardCard key={deck._id} deck={deck} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(deck)} />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase">{selectedDeck.name}</h2>
                                <p className="text-orange-400 font-bold text-sm">Por: {selectedDeck.user?.username || "Juegos Vikingos"}</p>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="text-white text-2xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {selectedDeck.cards.map((c, i) => (
                                <div key={i} className="relative">
                                    <img src={c.imgUrl || c.imageUrl} className="w-full rounded shadow-lg" alt={c.name} />
                                    <div className="absolute bottom-0 right-0 bg-black/80 text-white px-2 text-xs font-bold rounded-tl-lg">x{c.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// COMPONENTES AUXILIARES
function PodiumCard({ deck, rank, userId, onLike, onClick }) {
    const isGold = rank === 1;
    const bgImage = deck.cards?.[0]?.imgUrl || deck.cards?.[0]?.imageUrl;
    return (
        <div onClick={onClick} className={`${isGold ? 'md:w-80 h-[28rem] border-yellow-500' : 'md:w-64 h-80 border-slate-700'} w-full relative rounded-3xl overflow-hidden border-4 shadow-2xl cursor-pointer group transition-all`}>
            <div className="absolute inset-0">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute top-4 left-4 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">#{rank}</div>
            <div className="absolute bottom-0 p-6">
                <h3 className="font-bold text-xl">{deck.name}</h3>
                <p className="text-slate-400 text-sm mb-4">@{deck.user?.username || "Juegos Vikingos"}</p>
                <button onClick={(e) => onLike(deck._id, e)} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    {deck.likes?.includes(userId) ? '❤️' : '🤍'} {deck.likes?.length || 0}
                </button>
            </div>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick }) {
    const bgImage = deck.cards?.[0]?.imgUrl || deck.cards?.[0]?.imageUrl;
    return (
        <div onClick={onClick} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all cursor-pointer">
            <div className="h-32 bg-slate-900 relative overflow-hidden">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-50" />}
                <div className="absolute bottom-2 left-3 font-bold truncate w-11/12">{deck.name}</div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="text-xs text-slate-400">@{deck.user?.username || "Juegos Vikingos"}</div>
                <button onClick={(e) => onLike(deck._id, e)} className="text-sm">
                    {deck.likes?.includes(userId) ? '❤️' : '🤍'} {deck.likes?.length || 0}
                </button>
            </div>
        </div>
    );
}
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const navigate = useNavigate();
    
    // 1. Pestaña activa: imperio o primer_bloque
    const [activeFormat, setActiveFormat] = useState("imperio");

    // Usuario actual
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

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
                const hasLiked = d.likes.includes(userId);
                return {
                    ...d,
                    likes: hasLiked ? d.likes.filter(id => id !== userId) : [...d.likes, userId]
                };
            }
            return d;
        });
        setDecks(updatedDecks);

        if (selectedDeck && selectedDeck._id === deckId) {
            setSelectedDeck(prev => {
                const hasLiked = prev.likes.includes(userId);
                return { ...prev, likes: hasLiked ? prev.likes.filter(id => id !== userId) : [...prev.likes, userId] };
            });
        }

        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } });
        } catch (error) { console.error(error); }
    };

    // --- LÓGICA DE FILTRADO POR FORMATO ---
    // Filtramos los mazos según la pestaña seleccionada
    const filteredDecks = useMemo(() => {
        return decks.filter(d => d.format === activeFormat);
    }, [decks, activeFormat]);

    // Lógica del Podio basada SOLO en los mazos filtrados
    const { top1, top2, top3, recentDecks } = useMemo(() => {
        const sorted = [...filteredDecks].sort((a, b) => b.likes.length - a.likes.length);
        const sortedByDate = [...filteredDecks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return {
            top1: sorted[0],
            top2: sorted[1],
            top3: sorted[2],
            recentDecks: sortedByDate
        };
    }, [filteredDecks]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-24 font-sans selection:bg-orange-500 selection:text-white">
            
            {/* --- HEADER --- */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-900/20">
                            <span className="text-2xl text-white font-bold">⚔️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                La Arena <span className="text-orange-500">Global</span>
                            </h1>
                            <p className="text-xs text-slate-400 font-medium">Compite por la gloria eterna</p>
                        </div>
                    </div>

                    {/* --- SELECTOR DE FORMATO (TABS) --- */}
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
                
                {/* --- SECCIÓN PODIO --- */}
                {top1 ? (
                    <div className="mb-20">
                        <h2 className="text-2xl font-bold mb-10 flex items-center justify-center gap-2 text-white">
                            <span className="text-3xl">🏆</span> Salón de la Fama - {activeFormat === "imperio" ? "Imperio" : "Primer Bloque"}
                        </h2>
                        
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8">
                            <PodiumCard deck={top2} rank={2} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top2)} />
                            <PodiumCard deck={top1} rank={1} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top1)} />
                            <PodiumCard deck={top3} rank={3} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top3)} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-800/50 mb-10">
                        <p className="text-slate-500 text-xl italic">Aún no hay campeones en {activeFormat === "imperio" ? "Imperio" : "Primer Bloque"}.</p>
                    </div>
                )}

                {/* --- SECCIÓN RECIENTES --- */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-orange-500">🔥</span> Mazos de la Comunidad
                    </h2>
                </div>
                
                {recentDecks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800 border-dashed">
                        <p className="text-6xl mb-4 opacity-20">📭</p>
                        <p className="text-slate-500 font-medium">No se encontraron mazos públicos de este formato.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentDecks.map(deck => (
                            <StandardCard 
                                key={deck._id} 
                                deck={deck} 
                                userId={userId} 
                                onLike={handleLike} 
                                onClick={() => setSelectedDeck(deck)} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedDeck && (
                <ModalDetail 
                    deck={selectedDeck} 
                    userId={userId} 
                    onClose={() => setSelectedDeck(null)} 
                    onLike={handleLike} 
                />
            )}
        </div>
    );
}

// --- TARJETA DE PODIO ---
function PodiumCard({ deck, rank, userId, onLike, onClick }) {
    if (!deck) return <div className="hidden md:block w-full md:w-64 h-40 opacity-0"></div>; 

    const isGold = rank === 1;
    const isSilver = rank === 2;
    const badgeColor = isGold ? "bg-yellow-400 text-black" : isSilver ? "bg-slate-300 text-black" : "bg-orange-700 text-white";
    const bgImage = (deck.cards && deck.cards[0]) ? (deck.cards[0].imgUrl || deck.cards[0].imageUrl) : null;

    return (
        <div 
            onClick={onClick}
            className={`${isGold ? 'w-full md:w-[22rem] h-[28rem] z-10 border-yellow-400' : 'w-full md:w-72 h-80 border-slate-700'} relative rounded-3xl overflow-hidden border-4 shadow-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-2 flex-shrink-0`}
        >
            <div className="absolute inset-0 bg-slate-900">
                {bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${bgImage})` }}></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            </div>

            <div className={`absolute top-4 left-4 ${badgeColor} font-black text-xl w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-20`}>{rank}</div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className={`font-black text-white leading-tight mb-1 drop-shadow-lg ${isGold ? 'text-3xl' : 'text-xl'}`}>{deck.name}</h3>
                {/* 🔹 AQUÍ SE USA USERNAME */}
                <p className="text-slate-300 text-sm mb-4 font-medium flex items-center gap-1">
                    Creado por <span className="text-orange-400 font-bold">{deck.user?.username || "Anónimo"}</span>
                </p>

                <div className="flex gap-3">
                    <button onClick={(e) => onLike(deck._id, e)} className={`flex-1 py-2 rounded-xl font-bold backdrop-blur-md border transition flex items-center justify-center gap-2 ${deck.likes.includes(userId) ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60'}`}>
                        <span>{deck.likes.includes(userId) ? '❤️' : '🤍'}</span> {deck.likes.length}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- TARJETA ESTÁNDAR ---
function StandardCard({ deck, userId, onLike, onClick }) {
    const bgImage = (deck.cards && deck.cards[0]) ? (deck.cards[0].imgUrl || deck.cards[0].imageUrl) : null;
    return (
        <div onClick={onClick} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-orange-500/50 transition-all hover:shadow-xl cursor-pointer h-64 flex flex-col">
            <div className="h-32 relative overflow-hidden bg-slate-900">
                {bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${bgImage})` }}></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="absolute bottom-2 left-3 font-bold text-white drop-shadow-md truncate w-11/12 text-lg">{deck.name}</div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start text-xs text-slate-400">
                    {/* 🔹 AQUÍ SE USA USERNAME */}
                    <span className="font-bold text-orange-200">{deck.user?.username || "Anónimo"}</span>
                    <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{deck.cards.length} Cartas</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                    <button onClick={(e) => onLike(deck._id, e)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${deck.likes.includes(userId) ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
                        {deck.likes.includes(userId) ? '❤️' : '🤍'} {deck.likes.length}
                    </button>
                    <span className="text-xs font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">VER →</span>
                </div>
            </div>
        </div>
    );
}

// --- MODAL DETALLE ---
function ModalDetail({ deck, userId, onClose, onLike }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700 bg-slate-900 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white">{deck.name}</h2>
                        <p className="text-sm text-slate-400 mt-1">Forjado por <span className="text-orange-400 font-bold">{deck.user?.username}</span></p>
                    </div>
                    <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition text-xl">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120] custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {deck.cards.map((card, idx) => (
                            <div key={idx} className="relative group">
                                <img src={card.imgUrl || card.imageUrl} alt={card.name} className="w-full h-auto rounded-lg shadow-sm border border-slate-800" />
                                <div className="absolute bottom-0 right-0 bg-black/80 text-orange-400 font-bold text-xs px-2 py-0.5 rounded-tl-lg">x{card.quantity || 1}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-5 border-t border-slate-700 bg-slate-800 flex justify-center">
                    <button onClick={(e) => onLike(deck._id, e)} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg ${deck.likes.includes(userId) ? 'bg-red-600 text-white shadow-red-900/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        <span>{deck.likes.includes(userId) ? '❤️' : '🤍'}</span>
                        <span>{deck.likes.length} Likes</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
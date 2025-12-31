import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
// ✅ Iconos Lucide para mantener la estética
import { Trophy, Flame, Copy, X, Heart, ExternalLink, ShieldCheck, Star, Layout, Globe, Users } from "lucide-react";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const navigate = useNavigate();

    // Filtro activo inicial
    const [activeFormat, setActiveFormat] = useState("imperio");

    // Usuario actual para el sistema de likes
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

    // ✅ LÓGICA DE CLONACIÓN: Envía al constructor y al guardar aparecerá en "Mis Mazos"
    const handleClone = (deck) => {
        const path = deck.format === 'primer_bloque' ? '/primer-bloque/builder' : '/imperio/builder';
        navigate(path, { state: { deckToEdit: deck, isCloning: true } });
    };

    const getImg = (c) => {
        if (!c) return "https://via.placeholder.com/250x350?text=No+Image";
        return c.imgUrl || c.imageUrl || c.img || "https://via.placeholder.com/250x350?text=No+Image";
    };

    // Filtrado por pestaña activa
    const filteredDecks = useMemo(() => {
        return decks.filter(d => {
            const f = d.format || "imperio";
            return f === activeFormat;
        });
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
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32 font-sans overflow-x-hidden">

            {/* --- HEADER CON TABS --- */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                            <span className="text-2xl text-white font-bold">⚔️</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                            La Arena <span className="text-orange-500">Global</span>
                        </h1>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveFormat("imperio")}
                            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeFormat === "imperio" ? "bg-orange-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
                        >
                            🏛️ IMPERIO
                        </button>
                        <button
                            onClick={() => setActiveFormat("primer_bloque")}
                            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeFormat === "primer_bloque" ? "bg-yellow-600 text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
                        >
                            📜 PRIMER BLOQUE
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">

                {/* --- SECCIÓN PODIO REORDENADO (MÓVIL 1-2-3 / WEB 2-1-3) --- */}
                {topDecks.length > 0 ? (
                    <div className="mb-24">
                        <h2 className="text-center text-3xl font-black mb-12 flex flex-col items-center justify-center gap-2 text-white uppercase italic">
                            <Trophy size={40} className="text-yellow-500 animate-bounce" />
                            Salón de la Fama
                        </h2>
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-8">
                            {/* RANK 2 */}
                            {topDecks[1] && <PodiumCard deck={topDecks[1]} rank={2} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[1])} getImg={getImg} className="order-2 md:order-1" />}
                            {/* RANK 1: Destacado visualmente */}
                            {topDecks[0] && <PodiumCard deck={topDecks[0]} rank={1} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[0])} getImg={getImg} className="order-1 md:order-2" isWinner />}
                            {/* RANK 3 */}
                            {topDecks[2] && <PodiumCard deck={topDecks[2]} rank={3} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(topDecks[2])} getImg={getImg} className="order-3 md:order-3" />}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50 bg-slate-800/20 rounded-[3rem] border border-slate-800 mb-10 uppercase font-black italic">
                        No hay desafíos registrados aún
                    </div>
                )}

                {/* --- SECCIÓN RECIENTES --- */}
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase italic">
                    <Flame className="text-orange-500" /> Estrategias Recientes
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {recentDecks.map(deck => (
                        <StandardCard
                            key={deck._id}
                            deck={deck}
                            userId={userId}
                            onLike={handleLike}
                            onClick={() => setSelectedDeck(deck)}
                            getImg={getImg}
                        />
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE CON BOTÓN CLONAR --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 md:p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-900 w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 md:p-8 border-b border-white/5 bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic leading-none">{selectedDeck.name}</h2>
                                <p className="text-orange-500 font-black text-sm uppercase mt-2 tracking-tighter">
                                    Por: @{selectedDeck.user?.username || selectedDeck.author?.username || selectedDeck.creator?.username || "Invocador"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleClone(selectedDeck)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs transition-all shadow-lg active:scale-95"
                                >
                                    <Copy size={18} /> Clonar Mazo
                                </button>
                                <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-800 rounded-2xl hover:bg-red-600 transition-colors text-white">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/20 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 custom-scrollbar">
                            {selectedDeck.cards.map((c, i) => (
                                <div key={i} className="relative group">
                                    <img src={getImg(c)} className="w-full rounded-xl border border-white/5 group-hover:scale-105 transition-transform shadow-lg" alt={c.name} />
                                    <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-lg shadow-xl border border-white/20">
                                        x{c.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- COMPONENTES DE TARJETA ---

function PodiumCard({ deck, rank, userId, onLike, onClick, getImg, className, isWinner }) {
    const bgImage = getImg(deck.cards?.[0]);
    const authorName = deck.user?.username || deck.author?.username || deck.creator?.username || "Invocador";

    return (
        <div
            onClick={onClick}
            className={`relative rounded-[2.5rem] overflow-hidden border-4 shadow-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-2 flex-shrink-0 
            ${isWinner ? 'w-full md:w-96 h-[32rem] border-yellow-500 z-10' : 'w-full md:w-72 h-80 border-slate-700 opacity-90'} ${className}`}
        >
            <div className="absolute inset-0 bg-slate-900">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent"></div>
            </div>
            <div className={`absolute top-6 left-6 font-black text-2xl w-14 h-14 flex items-center justify-center rounded-2xl shadow-2xl z-20 
                ${isWinner ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-white border border-white/10'}`}>
                {rank}
            </div>
            <div className="absolute bottom-0 p-8 z-20 w-full">
                <h3 className="font-black text-2xl drop-shadow-md text-white uppercase italic truncate">{deck.name}</h3>
                <p className="text-orange-500 text-xs mb-4 font-black uppercase tracking-widest">@{authorName}</p>
                <div className="flex items-center gap-3">
                    <button onClick={(e) => onLike(deck._id, e)} className="bg-white/10 px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                        <Heart size={18} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-white"} />
                        {deck.likes?.length || 0}
                    </button>
                    <div className="bg-orange-600/20 p-2.5 rounded-2xl border border-orange-500/20 text-orange-500">
                        <ExternalLink size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick, getImg }) {
    const bgImage = getImg(deck.cards?.[0]);
    const authorName = deck.user?.username || deck.author?.username || deck.creator?.username || "Invocador";

    return (
        <div onClick={onClick} className="group relative bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] cursor-pointer h-72 flex flex-col shadow-lg">
            <div className="h-40 bg-slate-800 relative overflow-hidden">
                {bgImage && <img src={bgImage} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="absolute bottom-3 left-4 font-black truncate w-10/12 text-white uppercase italic text-sm tracking-tighter drop-shadow-md">
                    {deck.name}
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="text-[10px] text-orange-500 font-black uppercase tracking-widest">@{authorName}</div>
                <div className="flex justify-between items-center mt-2">
                    <button onClick={(e) => onLike(deck._id, e)} className="text-xs font-black px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 transition-all flex items-center gap-2 border border-white/5">
                        <Heart size={14} className={deck.likes?.includes(userId) ? "fill-red-500 text-red-500" : "text-white"} />
                        {deck.likes?.length || 0}
                    </button>
                    <span className="text-[9px] font-black text-slate-500 uppercase italic group-hover:text-orange-500 transition-colors">
                        Detalles →
                    </span>
                </div>
            </div>
        </div>
    );
}
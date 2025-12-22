import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const navigate = useNavigate();
    
    // TABS DE FORMATO (Imperio por defecto)
    const [activeFormat, setActiveFormat] = useState("imperio"); 

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
                return { ...d, likes: hasLiked ? d.likes.filter(id => id !== userId) : [...d.likes, userId] };
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

        try { await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, { method: "PUT", headers: { "auth-token": token } }); } catch (error) { console.error(error); }
    };

    const handleCloneDeck = async (deck) => {
        if (!token) return navigate("/login");
        if(!confirm(`¿Copiar "${deck.name}" a tu colección?`)) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/clone/${deck._id}`, { method: "POST", headers: { "auth-token": token } });
            if (res.ok) { alert("¡Mazo copiado!"); navigate("/my-decks"); }
        } catch (e) { alert("Error al copiar"); }
    };

    // --- FILTRADO Y ORDENAMIENTO ---
    const { top1, top2, top3, recentDecks, formatCount } = useMemo(() => {
        // Filtrar por el TAB activo
        const filteredByFormat = decks.filter(d => d.format === activeFormat);
        
        // Ordenar por Likes para el Podio
        const sortedByLikes = [...filteredByFormat].sort((a, b) => b.likes.length - a.likes.length);
        
        // Ordenar por Fecha para Recientes
        const sortedByDate = [...filteredByFormat].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            top1: sortedByLikes[0],
            top2: sortedByLikes[1],
            top3: sortedByLikes[2],
            recentDecks: sortedByDate, 
            formatCount: filteredByFormat.length
        };
    }, [decks, activeFormat]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-24 font-sans selection:bg-orange-500 selection:text-white">
            
            {/* --- HEADER CON TABS --- */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-900/20">
                            <span className="text-2xl text-white font-bold">⚔️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">La Arena Global</h1>
                            <p className="text-xs text-slate-400 font-medium">Compite por la gloria eterna</p>
                        </div>
                    </div>

                    {/* SELECTOR TABS */}
                    <div className="bg-slate-800 p-1 rounded-xl flex gap-1 shadow-inner border border-slate-700">
                        <button onClick={() => setActiveFormat('imperio')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeFormat === 'imperio' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>🏛️ IMPERIO</button>
                        <button onClick={() => setActiveFormat('primer_bloque')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeFormat === 'primer_bloque' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>📜 PRIMER BLOQUE</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                
                {/* --- PODIO --- */}
                {top1 ? (
                    <div className="mb-20 animate-fade-in">
                        <h2 className={`text-2xl font-bold mb-10 flex items-center justify-center gap-2 ${activeFormat === 'imperio' ? 'text-orange-500' : 'text-yellow-500'}`}>
                            <span className="text-3xl">🏆</span> Campeones de {activeFormat === 'imperio' ? 'Imperio' : 'Primer Bloque'}
                        </h2>
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8">
                            <PodiumCard deck={top2} rank={2} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top2)} />
                            <PodiumCard deck={top1} rank={1} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top1)} />
                            <PodiumCard deck={top3} rank={3} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(top3)} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500 text-xl">Aún no hay campeones en este formato.</div>
                )}

                {/* --- RECIENTES --- */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><span>🔥</span> Recientes</h2>
                    <span className="text-xs text-slate-500 font-bold bg-slate-800 px-3 py-1 rounded-full">{formatCount} Mazos</span>
                </div>
                
                {recentDecks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800 border-dashed opacity-50">No hay mazos.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                        {recentDecks.map(deck => <StandardCard key={deck._id} deck={deck} userId={userId} onLike={handleLike} onClick={() => setSelectedDeck(deck)} />)}
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            {selectedDeck && <ModalDetail deck={selectedDeck} userId={userId} onClose={() => setSelectedDeck(null)} onLike={handleLike} onClone={() => handleCloneDeck(selectedDeck)} />}
        </div>
    );
}

// COMPONENTES AUXILIARES
function PodiumCard({ deck, rank, userId, onLike, onClick }) {
    if (!deck) return <div className="hidden md:block w-full md:w-64 h-40 opacity-0"></div>; 
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const bgImage = (deck.cards && deck.cards[0]) ? (deck.cards[0].imgUrl || deck.cards[0].imageUrl) : null;
    const height = isGold ? "h-96 md:h-[28rem]" : isSilver ? "h-80 md:h-96" : "h-72 md:h-80";
    const width = isGold ? "w-full md:w-[22rem] z-10" : "w-full md:w-72";
    const colors = isGold ? "border-yellow-400 shadow-yellow-500/20" : isSilver ? "border-slate-300 shadow-slate-500/20" : "border-orange-700 shadow-orange-900/20";
    
    return (
        <div onClick={onClick} className={`${width} ${height} relative rounded-3xl overflow-hidden border-4 ${colors} shadow-2xl cursor-pointer group hover:-translate-y-2 transition-all flex-shrink-0`}>
            <div className="absolute inset-0 bg-slate-900">
                {bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${bgImage})` }}></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            </div>
            <div className={`absolute top-4 left-4 font-black text-xl w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-20 ${isGold ? 'bg-yellow-400 text-black' : isSilver ? 'bg-slate-300 text-black' : 'bg-orange-700 text-white'}`}>{rank}</div>
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="font-black text-white text-xl mb-1">{deck.name}</h3>
                <p className="text-slate-300 text-sm mb-4">Creado por <span className="text-orange-400 font-bold">{deck.user?.username || "Anónimo"}</span></p>
                <button onClick={(e)=>onLike(deck._id, e)} className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-white font-bold flex gap-2 items-center hover:bg-white/20"><span>{deck.likes.includes(userId)?'❤️':'🤍'}</span> {deck.likes.length}</button>
            </div>
        </div>
    );
}

function StandardCard({ deck, userId, onLike, onClick }) {
    const bgImage = (deck.cards && deck.cards[0]) ? (deck.cards[0].imgUrl || deck.cards[0].imageUrl) : null;
    return (
        <div onClick={onClick} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-orange-500/50 transition-all hover:shadow-xl cursor-pointer h-64 flex flex-col">
            <div className="h-32 relative bg-slate-900 overflow-hidden">
                {bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform" style={{ backgroundImage: `url(${bgImage})` }}></div>}
                <div className="absolute bottom-2 left-3 font-bold text-white drop-shadow-md truncate w-11/12 text-lg">{deck.name}</div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between bg-slate-800">
                <div className="flex justify-between items-start text-xs text-slate-400">
                    <span className="font-bold text-orange-200 truncate max-w-[100px]">{deck.user?.username || "Anónimo"}</span>
                    <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">Cartas</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between">
                     <button onClick={(e)=>onLike(deck._id, e)} className="text-xs font-bold text-slate-400 flex gap-1 hover:text-white">❤️ {deck.likes.length}</button>
                     <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">VER →</span>
                </div>
            </div>
        </div>
    );
}

function ModalDetail({ deck, userId, onClose, onLike, onClone }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700 bg-slate-900 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white">{deck.name}</h2>
                        <p className="text-sm text-slate-400 mt-1">Forjado por <span className="text-orange-400 font-bold">{deck.user?.username}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120] custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {deck.cards.map((c, i) => <img key={i} src={c.imgUrl || c.imageUrl} className="w-full h-auto rounded shadow border border-slate-800"/>)}
                    </div>
                </div>
                <div className="p-5 border-t border-slate-700 bg-slate-800 flex justify-center gap-4">
                    <button onClick={(e)=>onLike(deck._id, e)} className="bg-slate-700 text-white px-6 py-2 rounded-xl font-bold flex gap-2">❤️ {deck.likes.length}</button>
                    <button onClick={onClone} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-500">Copiar Mazo</button>
                </div>
            </div>
        </div>
    );
}
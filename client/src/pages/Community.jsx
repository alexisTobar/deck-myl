import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); // Modal
    const navigate = useNavigate();
    
    // Obtener datos del usuario
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
        if(e) e.stopPropagation(); // Evitar abrir el modal si das like desde fuera
        if (!token) return navigate("/login");

        // 1. UI Optimista (Actualizar visualmente al instante)
        const updatedDecks = decks.map(d => {
            if (d._id === deckId) {
                const hasLiked = d.likes.includes(userId);
                return {
                    ...d,
                    likes: hasLiked 
                        ? d.likes.filter(id => id !== userId) // Quitar like
                        : [...d.likes, userId] // Agregar like
                };
            }
            return d;
        });
        
        setDecks(updatedDecks);
        
        // Si el modal está abierto y es el mismo mazo, actualizarlo también
        if (selectedDeck && selectedDeck._id === deckId) {
            setSelectedDeck(prev => {
                const hasLiked = prev.likes.includes(userId);
                return {
                    ...prev,
                    likes: hasLiked ? prev.likes.filter(id => id !== userId) : [...prev.likes, userId]
                };
            });
        }

        // 2. Petición al servidor (Background)
        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, {
                method: "PUT",
                headers: { "auth-token": token }
            });
        } catch (error) {
            console.error("Error al dar like", error);
        }
    };

    // Helper para imagen de fondo
    const getBgImage = (cards) => {
        if (!cards || cards.length === 0) return null;
        return cards[0].imgUrl || cards[0].imageUrl || null;
    };

    // Cálculos
    const topDecks = [...decks].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);
    const recentDecks = [...decks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-24 font-sans">
            
            {/* --- HEADER --- */}
            <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-20 p-4 mb-8">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <span className="text-3xl">🏟️</span>
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                            La Arena
                        </h1>
                        <p className="text-xs text-slate-400">Las mejores estrategias de la comunidad</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                
                {/* --- PODIO TOP 3 --- */}
                {topDecks.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🏆 <span className="text-yellow-400">Top Legendarios</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {/* Reordenamos para que el #1 quede al medio en desktop si quisieras, pero simple es mejor por ahora */}
                            {topDecks.map((deck, index) => {
                                const bg = getBgImage(deck.cards);
                                return (
                                    <div 
                                        key={deck._id} 
                                        onClick={() => setSelectedDeck(deck)}
                                        className={`relative bg-slate-800 rounded-2xl overflow-hidden border-2 cursor-pointer group ${index === 0 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] md:-mt-8 md:h-80' : 'border-slate-700 md:h-64'} transition-transform hover:-translate-y-2`}
                                    >
                                        {/* Imagen Fondo */}
                                        <div className="absolute inset-0 bg-slate-900">
                                            {bg && <div className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bg})` }}></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                                        </div>

                                        {/* Medalla */}
                                        <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur border border-slate-600 rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-lg">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </div>

                                        {/* Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="font-bold text-lg text-white truncate shadow-black drop-shadow-md">{deck.name}</h3>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-slate-300">por <span className="text-orange-400 font-bold">{deck.user?.name}</span></p>
                                                <button onClick={(e) => handleLike(deck._id, e)} className="flex items-center gap-1 bg-slate-900/50 rounded-full px-2 py-1 backdrop-blur hover:bg-slate-800 transition">
                                                    <span>{deck.likes.includes(userId) ? '❤️' : '🤍'}</span>
                                                    <span className="font-bold text-sm">{deck.likes.length}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- LISTA GENERAL (GRID MEJORADO) --- */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🔥 <span className="text-orange-400">Recientes</span></h2>
                
                {decks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                        <p className="text-4xl mb-4">🍃</p>
                        <p className="text-slate-400">No hay mazos públicos aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentDecks.map(deck => {
                            const bg = getBgImage(deck.cards);
                            const totalCards = deck.cards.reduce((acc, c) => acc + (c.quantity || 1), 0);
                            
                            return (
                                <div 
                                    key={deck._id} 
                                    onClick={() => setSelectedDeck(deck)}
                                    className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl cursor-pointer h-60 flex flex-col relative"
                                >
                                    {/* Imagen Header */}
                                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                                        {bg ? (
                                            <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bg})` }}></div>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700"></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                        
                                        {/* Autor Badge */}
                                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-[10px] text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                                            {deck.user?.name || "Anónimo"}
                                        </div>
                                    </div>

                                    {/* Cuerpo Tarjeta */}
                                    <div className="p-3 flex-1 flex flex-col justify-between bg-slate-800 relative z-10">
                                        <div>
                                            <h3 className="font-bold text-white truncate text-lg leading-tight">{deck.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{totalCards} Cartas</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                                            <button 
                                                onClick={(e) => handleLike(deck._id, e)} 
                                                className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded transition ${deck.likes.includes(userId) ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                            >
                                                <span className="text-sm">{deck.likes.includes(userId) ? '❤️' : '🤍'}</span>
                                                {deck.likes.length}
                                            </button>
                                            <span className="text-xs text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                                VER →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- MODAL DETALLE (LIMPIO SIN ID) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-700 bg-slate-900 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white capitalize">{selectedDeck.name}</h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Creado por <span className="text-orange-400 font-bold">{selectedDeck.user?.name}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="text-slate-500 hover:text-white transition text-2xl leading-none">✕</button>
                        </div>
                        
                        {/* Grid de Cartas */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-900/50">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {selectedDeck.cards.map((card, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="rounded-lg overflow-hidden border border-slate-700 shadow-sm bg-slate-900 relative">
                                            {/* Imagen */}
                                            <img src={card.imgUrl || "https://via.placeholder.com/150"} alt={card.name} className="w-full h-auto object-cover" />
                                            
                                            {/* Cantidad Badge */}
                                            <div className="absolute bottom-0 right-0 bg-black/80 text-orange-500 font-bold text-xs px-1.5 py-0.5 rounded-tl">
                                                x{card.quantity || 1}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-center text-slate-400 mt-1 truncate px-1">{card.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Modal (BOTÓN GRANDE DE LIKE) */}
                        <div className="p-4 border-t border-slate-700 bg-slate-800 flex justify-center">
                            <button 
                                onClick={(e) => handleLike(selectedDeck._id, e)} 
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg transform active:scale-95 ${selectedDeck.likes.includes(userId) ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-900/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                <span className="text-2xl">{selectedDeck.likes.includes(userId) ? '❤️' : '🤍'}</span>
                                <span>{selectedDeck.likes.includes(userId) ? '¡Te gusta este mazo!' : 'Dar Like al mazo'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
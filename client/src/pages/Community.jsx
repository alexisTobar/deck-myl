import { useEffect, useState } from "react";
import BACKEND_URL from "../config";

export default function Community() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); // Para el modal de ver cartas
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("user"))?.id;

    // Cargar mazos al iniciar
    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/community/all`);
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

    const handleLike = async (deckId) => {
        if (!token) return alert("Inicia sesión para dar amor ❤️");

        // UI Optimista: Actualizamos visualmente antes de esperar al servidor
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

        // Petición al servidor
        try {
            await fetch(`${BACKEND_URL}/api/decks/like/${deckId}`, {
                method: "PUT",
                headers: { "auth-token": token }
            });
            // (Opcional) Podríamos recargar data aquí, pero el optimista basta
        } catch (error) {
            console.error("Error al dar like", error);
            // Si falla, revertiríamos cambios (no implementado por simplicidad)
        }
    };

    // Calcular Top 3
    const topDecks = [...decks].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);
    // El resto de mazos (excluyendo top 3 si quieres, o todos)
    // Mostremos todos abajo ordenados por fecha para que se vea movimiento
    const recentDecks = [...decks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando comunidad... 🛡️</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            
            {/* --- HEADER --- */}
            <div className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4 animate-fade-in-down">
                    La Arena Pública 🏟️
                </h1>
                <p className="text-slate-400">Explora las estrategias de otros gladiadores y vota por las mejores.</p>
            </div>

            {/* --- PODIO TOP 3 --- */}
            {topDecks.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🏆 <span className="text-yellow-400">Top Legendarios</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* El orden visual del podio suele ser: 2do, 1er, 3ro. Haremos un map simple por ahora */}
                        {topDecks.map((deck, index) => (
                            <div key={deck._id} className={`relative bg-slate-800 rounded-2xl p-1 border-2 ${index === 0 ? 'border-yellow-400 scale-105 z-10 shadow-[0_0_30px_rgba(250,204,21,0.2)]' : 'border-slate-700'} hover:transform hover:-translate-y-2 transition duration-300`}>
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-2xl border border-slate-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl h-full flex flex-col">
                                    <h3 className="font-bold text-lg text-white truncate text-center mt-2">{deck.name}</h3>
                                    <p className="text-xs text-center text-slate-400 mb-4">por {deck.user?.name || "Anónimo"}</p>
                                    
                                    {/* Muestra de 3 cartas del mazo */}
                                    <div className="flex justify-center -space-x-4 mb-4 overflow-hidden py-2">
                                        {deck.cards.slice(0, 3).map((c, i) => (
                                            <img key={i} src={c.imgUrl} alt="carta" className="w-16 h-24 object-cover rounded shadow-lg border border-slate-900 transform rotate-3" />
                                        ))}
                                    </div>
                                    
                                    <div className="mt-auto flex justify-between items-center border-t border-slate-700 pt-3">
                                        <button onClick={() => setSelectedDeck(deck)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition">VER MAZO</button>
                                        <button onClick={() => handleLike(deck._id)} className="flex items-center gap-1 text-pink-500 hover:scale-110 transition">
                                            <span>{deck.likes.includes(userId) ? '❤️' : '🤍'}</span>
                                            <span className="font-bold">{deck.likes.length}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LISTA GENERAL --- */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🔥 <span className="text-orange-400">Recientes</span></h2>
                
                {decks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <p className="text-2xl mb-2">🍃</p>
                        <p className="text-slate-400">Aún no hay mazos públicos.</p>
                        <p className="text-sm text-slate-500 mt-2">¡Sé el primero en publicar uno desde "Mis Mazos"!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentDecks.map(deck => (
                            <div key={deck._id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white truncate w-40">{deck.name}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase">Creador: {deck.user?.name || "Desconocido"}</p>
                                    </div>
                                    {/* Icono de tipo de mazo basado en carta más repetida o random (visual) */}
                                    <span className="text-xl">⚔️</span>
                                </div>
                                
                                <div className="bg-slate-900 rounded p-2 mb-3 flex gap-2 overflow-hidden h-16 items-center opacity-70 group-hover:opacity-100 transition">
                                     {/* Mini preview */}
                                     {deck.cards.slice(0, 4).map((c, i) => (
                                         <img key={i} src={c.imgUrl} className="w-8 h-auto rounded" />
                                     ))}
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <button 
                                        onClick={() => handleLike(deck._id)} 
                                        className={`flex items-center gap-1 px-2 py-1 rounded transition ${deck.likes.includes(userId) ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {deck.likes.includes(userId) ? '❤️' : '🤍'} {deck.likes.length}
                                    </button>
                                    <button onClick={() => setSelectedDeck(deck)} className="text-orange-500 font-bold hover:text-orange-400 text-xs">DETALLES →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL DETALLE DE MAZO --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        {/* Header Modal */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedDeck.name}</h2>
                                <p className="text-xs text-slate-400">Creado por <span className="text-orange-400">{selectedDeck.user?.name}</span> • {selectedDeck.cards.reduce((acc, c) => acc + c.quantity, 0)} Cartas</p>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="bg-slate-800 hover:bg-slate-700 text-white w-8 h-8 rounded-full font-bold transition">✕</button>
                        </div>
                        
                        {/* Body Modal (Grid de Cartas) */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/50">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {selectedDeck.cards.map((card, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={card.imgUrl} alt={card.name} className="w-full h-auto rounded shadow-sm border border-slate-800" />
                                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-tl-md">x{card.quantity}</div>
                                        {/* Tooltip nombre */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">{card.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-4 border-t border-slate-700 bg-slate-900 rounded-b-2xl flex justify-between items-center">
                            <span className="text-xs text-slate-500">ID: {selectedDeck._id}</span>
                            <button 
                                onClick={() => { handleLike(selectedDeck._id); }} 
                                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${selectedDeck.likes.includes(userId) ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                {selectedDeck.likes.includes(userId) ? '¡Te gusta!' : 'Dar Like ❤️'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
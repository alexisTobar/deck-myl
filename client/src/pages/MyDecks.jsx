import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDeck, setSelectedDeck] = useState(null); // Estado para el Modal
    const navigate = useNavigate();

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/my-decks`, {
                headers: { "auth-token": token }
            });
            const data = await res.json();
            if (res.ok) {
                setDecks(data);
            } else {
                setError("Error al cargar mazos");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if(e) e.stopPropagation(); // Evita abrir el modal si das clic en borrar
        if (!window.confirm("¿Seguro que quieres eliminar este mazo?")) return;
        
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                setDecks(decks.filter(deck => deck._id !== id));
                setSelectedDeck(null); // Cierra el modal si estaba abierto
            }
        } catch (err) {
            alert("No se pudo eliminar");
        }
    };

    // --- IR AL EDITOR ---
    const handleEdit = (deck) => {
        navigate("/builder", { state: { deckToEdit: deck } });
    };

    // --- EXPORTAR A TXT (Versión Corregida con Cantidades) ---
    const handleExport = (deck) => {
        // Calcular total real
        const totalCards = deck.cards.reduce((acc, card) => acc + (card.quantity || 1), 0);

        let content = `MAZO: ${deck.name}\n`;
        content += `Formato: Mitos y Leyendas\n`;
        content += `Total Cartas: ${totalCards}\n`;
        content += `----------------------------\n`;

        deck.cards.forEach(card => {
            const cleanName = card.name ? card.name.trim() : "Carta Desconocida";
            const qty = card.quantity || 1;
            content += `${qty} x ${cleanName}\n`;
        });

        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${deck.name.replace(/ /g, "_")}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // --- OBTENER IMAGEN DE FONDO ---
    const getCardImage = (cards) => {
        if (!cards || cards.length === 0) return null;
        const firstCard = cards[0];
        return firstCard.imgUrl || firstCard.imageUrl || firstCard.imagen || firstCard.img || null;
    };

    if (loading) return <div className="text-center text-white mt-20 text-xl animate-pulse">Cargando la armería... ⚔️</div>;

    return (
        <div className="min-h-screen bg-slate-900 p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                            Mis Mazos
                        </h1>
                        <p className="text-slate-400 mt-1">Tu colección de estrategias</p>
                    </div>
                    <button 
                        onClick={() => navigate("/builder")} 
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-1"
                    >
                        Crear Nuevo Mazo
                    </button>
                </div>

                {error && <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-center border border-red-500/50">{error}</div>}

                {decks.length === 0 && !error ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 border-dashed">
                        <p className="text-slate-400 text-xl mb-4">Aún no has forjado ningún mazo.</p>
                        <button onClick={() => navigate("/builder")} className="text-orange-400 hover:underline text-lg">¡Empieza aquí!</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {decks.map((deck) => {
                            const bgImage = getCardImage(deck.cards);
                            const realTotal = deck.cards.reduce((acc, c) => acc + (c.quantity || 1), 0);

                            return (
                                <div 
                                    key={deck._id} 
                                    onClick={() => setSelectedDeck(deck)} // <--- CLIC ABRE EL MODAL
                                    className="group relative bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/20 h-64 flex flex-col justify-end cursor-pointer"
                                >
                                    {/* IMAGEN DE FONDO */}
                                    {bgImage ? (
                                        <>
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bgImage})` }}></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                                            <span className="text-6xl opacity-10">⚔️</span>
                                        </div>
                                    )}

                                    {/* CONTENIDO TARJETA */}
                                    <div className="relative z-10 p-6">
                                        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md truncate capitalize">{deck.name}</h2>
                                        <p className="text-orange-300 text-sm font-medium">🃏 {realTotal} Cartas</p>
                                        <p className="text-slate-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">Haz clic para ver opciones</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- MODAL (VENTANA EMERGENTE) --- */}
                {selectedDeck && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-600 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            
                            {/* CABECERA DEL MODAL */}
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white capitalize">{selectedDeck.name}</h2>
                                    <p className="text-slate-400 text-sm">{selectedDeck.cards.reduce((acc, c) => acc + (c.quantity || 1), 0)} Cartas en total</p>
                                </div>
                                <button onClick={() => setSelectedDeck(null)} className="text-slate-400 hover:text-white font-bold text-2xl px-2">✕</button>
                            </div>

                            {/* LISTA DE CARTAS */}
                            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 mb-6 space-y-2">
                                {selectedDeck.cards.map((card, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-slate-700/30 p-3 rounded-xl border border-slate-700/50">
                                        {/* Miniatura (si existe) */}
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
                                            {(card.imgUrl || card.imageUrl) && (
                                                <img src={card.imgUrl || card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        
                                        {/* Nombre y Tipo */}
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-200 capitalize">{card.name}</p>
                                            <p className="text-xs text-orange-400 font-medium">{card.type || "Carta"}</p>
                                        </div>

                                        {/* Cantidad */}
                                        <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                                            <span className="font-bold text-white">x{card.quantity || 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* BOTONES DE ACCIÓN (CON TEXTO) */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                                <button 
                                    onClick={() => handleExport(selectedDeck)}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg text-center"
                                >
                                    Exportar Lista
                                </button>
                                
                                <button 
                                    onClick={() => handleEdit(selectedDeck)} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg text-center"
                                >
                                    Editar Mazo
                                </button>

                                <button 
                                    onClick={() => handleDelete(selectedDeck._id)}
                                    className="flex-1 bg-red-600/20 hover:bg-red-600 border border-red-600/50 text-red-100 hover:text-white font-bold py-3 rounded-xl transition text-center"
                                >
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
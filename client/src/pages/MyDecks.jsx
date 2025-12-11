import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config"; // <--- IMPORTACIÓN NUEVA

export default function MyDecks() {
    const navigate = useNavigate();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para el Modal de "Ver Cartas"
    const [selectedDeck, setSelectedDeck] = useState(null);

    // 1. CARGAR MAZOS
    useEffect(() => {
        const fetchDecks = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/login");

            try {
                // USAMOS URL DINÁMICA
                const res = await fetch(`${BACKEND_URL}/api/decks/my-decks`, {
                    headers: { "auth-token": token }
                });
                const data = await res.json();
                if (res.ok) setDecks(data);
            } catch (error) {
                console.error("Error de conexión");
            } finally {
                setLoading(false);
            }
        };
        fetchDecks();
    }, [navigate]);

    // 2. BORRAR MAZO
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que quieres eliminar este mazo?")) return;

        try {
            const token = localStorage.getItem("token");
            // USAMOS URL DINÁMICA
            const res = await fetch(`${BACKEND_URL}/api/decks/${id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) setDecks(decks.filter(d => d._id !== id));
        } catch (error) {
            alert("Error de conexión");
        }
    };

    // 3. EDITAR MAZO
    const handleEdit = (deck, e) => {
        e.stopPropagation();
        // Redirige al builder (recuerda que renombraste Home.jsx a DeckBuilder.jsx y ajustaste las rutas en App.jsx)
        navigate("/builder", { state: { deckToEdit: deck } });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                    📂 Mis Mazos Guardados
                </h1>

                {loading ? <div className="text-center mt-20">Cargando...</div> :
                    decks.length === 0 ? (
                        <div className="text-center bg-slate-800 p-10 rounded-xl border border-slate-700">
                            <p className="text-xl text-slate-400 mb-4">No tienes mazos aún.</p>
                            <button onClick={() => navigate("/builder")} className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500 transition">Crear uno</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {decks.map((deck) => (
                                <div
                                    key={deck._id}
                                    onClick={() => setSelectedDeck(deck)}
                                    className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-orange-500 transition cursor-pointer group"
                                >
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-white mb-1 truncate">{deck.name}</h3>
                                        <p className="text-xs text-slate-400">Clic para ver detalles</p>
                                        <div className="mt-4"><span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-300">{deck.cards.reduce((acc, c) => acc + c.quantity, 0)} Cartas</span></div>
                                    </div>

                                    <div className="px-5 pb-4 space-y-1">
                                        {deck.cards.slice(0, 3).map((c, i) => (
                                            <div key={i} className="text-xs text-slate-400 flex justify-between">
                                                <span className="truncate w-32">{c.name}</span>
                                                <span className="text-orange-500 font-bold">x{c.quantity}</span>
                                            </div>
                                        ))}
                                        {deck.cards.length > 3 && <p className="text-xs text-slate-600">...y más</p>}
                                    </div>

                                    <div className="bg-slate-900/50 p-3 flex justify-between items-center border-t border-slate-700">
                                        <button
                                            onClick={(e) => handleEdit(deck, e)}
                                            className="text-blue-400 hover:text-white text-sm font-bold bg-blue-900/20 px-3 py-1 rounded hover:bg-blue-600 transition"
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(deck._id, e)}
                                            className="text-red-400 hover:text-white text-sm font-bold bg-red-900/20 px-3 py-1 rounded hover:bg-red-600 transition"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {selectedDeck && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-600 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                                <h2 className="text-2xl font-bold text-orange-400">{selectedDeck.name}</h2>
                                <button onClick={() => setSelectedDeck(null)} className="text-slate-400 hover:text-white font-bold text-xl">✕</button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                                {selectedDeck.cards.map((card, idx) => (
                                    <div key={idx} className="flex items-center gap-3 mb-2 bg-slate-700/30 p-2 rounded hover:bg-slate-700 transition">
                                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                            <img src={card.imgUrl} alt={card.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-slate-200">{card.name}</p>
                                            <p className="text-xs text-orange-300">{card.type}</p>
                                        </div>
                                        <span className="font-bold text-lg text-white bg-slate-900 w-8 h-8 flex items-center justify-center rounded">x{card.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end gap-3">
                                <button onClick={() => setSelectedDeck(null)} className="text-slate-300 font-bold px-4 py-2 hover:text-white">Cerrar</button>
                                <button onClick={(e) => { setSelectedDeck(null); handleEdit(selectedDeck, e); }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded shadow">Cargar en Editor</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
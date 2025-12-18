import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este mazo?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                setDecks(decks.filter(deck => deck._id !== id));
            }
        } catch (err) {
            alert("No se pudo eliminar");
        }
    };

    // --- FUNCIÓN EDITAR ---
    const handleEdit = (deck) => {
        navigate("/builder", { state: { deckToEdit: deck } });
    };

    // --- FUNCIÓN EXPORTAR (CORREGIDA: AHORA LEE LAS CANTIDADES) ---
    const handleExport = (deck) => {
        // 1. Calcular el TOTAL REAL sumando las cantidades (quantity)
        const totalCards = deck.cards.reduce((acc, card) => acc + (card.quantity || 1), 0);

        let content = `MAZO: ${deck.name}\n`;
        content += `Formato: Mitos y Leyendas\n`;
        content += `Total Cartas: ${totalCards}\n`; // Ahora mostrará 50 (o el número real)
        content += `----------------------------\n`;

        // 2. Listar las cartas usando su cantidad real
        deck.cards.forEach(card => {
            const cleanName = card.name ? card.name.trim() : "Carta Desconocida";
            const qty = card.quantity || 1; // Aquí está la clave
            content += `${qty} x ${cleanName}\n`;
        });

        // 3. Crear y descargar archivo
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${deck.name.replace(/ /g, "_")}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // --- FUNCIÓN IMAGEN ---
    const getCardImage = (cards) => {
        if (!cards || cards.length === 0) return null;
        const firstCard = cards[0];
        // Buscamos en todas las propiedades posibles para asegurar que salga la foto
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
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-900/40 transition transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <span>🔨</span> Nuevo Mazo
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
                            // Calculamos el total real para mostrarlo en la tarjeta también
                            const realTotal = deck.cards.reduce((acc, c) => acc + (c.quantity || 1), 0);

                            return (
                                <div key={deck._id} className="group relative bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/20 h-64 flex flex-col justify-end">
                                    
                                    {/* IMAGEN DE FONDO */}
                                    {bgImage ? (
                                        <>
                                            <div 
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${bgImage})` }}
                                            ></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                                            <span className="text-6xl opacity-10">⚔️</span>
                                        </div>
                                    )}

                                    {/* CONTENIDO */}
                                    <div className="relative z-10 p-6">
                                        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md truncate capitalize">
                                            {deck.name}
                                        </h2>
                                        <p className="text-orange-300 text-sm font-medium mb-4 flex items-center gap-2">
                                            🃏 {realTotal} Cartas
                                        </p>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(deck)} 
                                                className="flex-1 bg-blue-600/90 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-center text-sm transition backdrop-blur-sm"
                                            >
                                                ✏️ Editar
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleExport(deck)}
                                                className="bg-green-600/90 hover:bg-green-500 text-white px-3 rounded-lg transition backdrop-blur-sm"
                                                title="Descargar lista (.txt)"
                                            >
                                                📥
                                            </button>

                                            <button 
                                                onClick={() => handleDelete(deck._id)} 
                                                className="bg-red-600/90 hover:bg-red-500 text-white px-3 rounded-lg transition backdrop-blur-sm"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
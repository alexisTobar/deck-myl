import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

// --- COMPONENTES UI SIMPLES (Iconos SVG para no depender de librerías) ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconTrash = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconEdit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconDownload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconSort = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); // Modal Detalles
    const [deckToDelete, setDeckToDelete] = useState(null); // Modal Confirmación Borrar
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // newest, name, size
    const [toast, setToast] = useState({ show: false, msg: "", type: "" }); // Notificaciones

    const navigate = useNavigate();

    useEffect(() => {
        fetchDecks();
    }, []);

    // --- LÓGICA DE DATOS ---
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
                showToast("Error al cargar mazos", "error");
            }
        } catch (err) {
            showToast("Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deckToDelete) return;
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${deckToDelete._id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                setDecks(prev => prev.filter(d => d._id !== deckToDelete._id));
                if (selectedDeck && selectedDeck._id === deckToDelete._id) setSelectedDeck(null);
                showToast("Mazo eliminado correctamente", "success");
            } else {
                showToast("No se pudo eliminar el mazo", "error");
            }
        } catch (err) {
            showToast("Error al intentar eliminar", "error");
        } finally {
            setDeckToDelete(null);
        }
    };

    // --- UTILIDADES ---
    const showToast = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const getDeckTotal = (cards) => cards.reduce((acc, c) => acc + (c.quantity || 1), 0);

    const handleExport = (deck) => {
        const totalCards = getDeckTotal(deck.cards);
        let content = `MAZO: ${deck.name}\nFormato: Mitos y Leyendas\nTotal Cartas: ${totalCards}\n----------------------------\n`;
        
        deck.cards.forEach(card => {
            const cleanName = card.name ? card.name.trim() : "Desconocida";
            const qty = card.quantity || 1;
            content += `${qty} x ${cleanName}\n`;
        });

        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${deck.name.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast("Lista exportada con éxito");
    };

    const getCardImage = (cards) => {
        if (!cards?.length) return null;
        const c = cards[0];
        return c.imgUrl || c.imageUrl || c.imagen || c.img || null;
    };

    // --- FILTRADO Y ORDENAMIENTO (Memoizado para rendimiento) ---
    const processedDecks = useMemo(() => {
        let result = [...decks];

        // Filtro
        if (searchTerm) {
            result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Orden
        if (sortBy === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "size") {
            result.sort((a, b) => getDeckTotal(b.cards) - getDeckTotal(a.cards));
        } else {
            // Newest (asumiendo que vienen ordenados del backend o por orden de array invertido)
            // Si tu backend manda fecha, usa: new Date(b.createdAt) - new Date(a.createdAt)
            result.reverse(); 
        }
        return result;
    }, [decks, searchTerm, sortBy]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-xl animate-pulse">Cargando la armería... ⚔️</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-20">
            {/* --- TOP BAR --- */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎴</span>
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                                    Mis Mazos
                                </h1>
                                <p className="text-xs text-slate-400">Colección de Estrategias</p>
                            </div>
                        </div>
                        
                        {/* Buscador y Filtros */}
                        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                            <div className="relative flex-1 md:w-64">
                                <span className="absolute left-3 top-2.5 text-slate-500"><IconSearch /></span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar mazo..." 
                                    className="w-full bg-slate-800 text-sm text-white rounded-lg pl-10 pr-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 transition"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    className="bg-slate-800 text-sm text-slate-300 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-orange-500 appearance-none cursor-pointer hover:bg-slate-700 transition"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">Más recientes</option>
                                    <option value="name">Nombre (A-Z)</option>
                                    <option value="size">Cantidad Cartas</option>
                                </select>
                                <span className="absolute right-2 top-2.5 text-slate-500 pointer-events-none"><IconSort /></span>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate("/builder")} 
                            className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">+</span> Nuevo Mazo
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto p-6">
                
                {/* Estado Vacío */}
                {decks.length === 0 ? (
                    <div className="text-center py-32 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed mx-auto max-w-2xl mt-10">
                        <div className="text-6xl mb-4 opacity-50">📜</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Tu grimorio está vacío</h2>
                        <p className="text-slate-400 mb-6">Aún no has forjado ninguna estrategia.</p>
                        <button onClick={() => navigate("/builder")} className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4">
                            Crear mi primer mazo
                        </button>
                    </div>
                ) : processedDecks.length === 0 ? (
                     <div className="text-center py-20 text-slate-500">
                        <p>No se encontraron mazos con ese nombre.</p>
                        <button onClick={() => setSearchTerm("")} className="text-orange-500 hover:underline mt-2">Limpiar búsqueda</button>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                        {processedDecks.map((deck) => {
                            const bgImage = getCardImage(deck.cards);
                            const realTotal = getDeckTotal(deck.cards);

                            return (
                                <div 
                                    key={deck._id} 
                                    onClick={() => setSelectedDeck(deck)}
                                    className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/20 cursor-pointer h-72 flex flex-col"
                                >
                                    {/* Imagen Background */}
                                    <div className="absolute inset-0 bg-slate-900">
                                        {bgImage ? (
                                            <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" style={{ backgroundImage: `url(${bgImage})` }}></div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                                                <span className="text-5xl opacity-20">⚔️</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                    </div>

                                    {/* Contenido Card */}
                                    <div className="relative z-10 mt-auto p-5">
                                        <div className="flex justify-between items-end">
                                            <div className="w-full">
                                                <h2 className="text-xl font-bold text-white truncate capitalize drop-shadow-md">{deck.name}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded border border-orange-500/30 font-medium">
                                                        {realTotal} Cartas
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay Hover Efecto */}
                                    <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- MODAL DETALLES --- */}
            {selectedDeck && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-600 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        
                        {/* Header Modal */}
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                            <div>
                                <h2 className="text-3xl font-bold text-white capitalize">{selectedDeck.name}</h2>
                                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {getDeckTotal(selectedDeck.cards)} Cartas en total
                                </p>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white">
                                ✕
                            </button>
                        </div>

                        {/* Body Modal (Grid de cartas o Lista) */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedDeck.cards.map((card, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700/50 hover:border-slate-600 transition">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-slate-900 flex-shrink-0">
                                            {(card.imgUrl || card.imageUrl) ? (
                                                <img src={card.imgUrl || card.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : <div className="w-full h-full bg-slate-700"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-200 truncate">{card.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{card.type || "Carta"}</p>
                                        </div>
                                        <div className="bg-slate-900 px-2 py-1 rounded text-xs font-bold text-orange-400 border border-slate-700">
                                            x{card.quantity || 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-700 bg-slate-800 flex flex-col sm:flex-row gap-3">
                            <button onClick={() => handleExport(selectedDeck)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-semibold transition shadow-lg shadow-emerald-900/20">
                                <IconDownload /> Exportar
                            </button>
                            <button onClick={() => navigate("/builder", { state: { deckToEdit: selectedDeck } })} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold transition shadow-lg shadow-blue-900/20">
                                <IconEdit /> Editar
                            </button>
                            <button onClick={() => setDeckToDelete(selectedDeck)} className="flex-1 flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 py-2.5 rounded-lg font-semibold transition">
                                <IconTrash /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CONFIRMACIÓN BORRAR --- */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/30 shadow-2xl max-w-sm w-full text-center animate-bounce-in">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <IconTrash />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Mazo?</h3>
                        <p className="text-slate-400 text-sm mb-6">Esta acción es irreversible. "{deckToDelete.name}" desaparecerá para siempre.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition">Cancelar</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-900/30">Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOAST NOTIFICATION --- */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in border backdrop-blur-md z-[70] ${
                    toast.type === "error" ? "bg-red-900/80 border-red-500 text-red-100" : "bg-emerald-900/80 border-emerald-500 text-emerald-100"
                }`}>
                    <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
                    <p className="font-medium">{toast.msg}</p>
                </div>
            )}
        </div>
    );
}
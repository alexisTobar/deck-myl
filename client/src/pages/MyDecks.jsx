import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";

// --- ICONOS SVG (Manteniendo todos tus iconos) ---
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconTrash = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconEdit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IconDownload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconSort = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
const IconWorld = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconLock = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

// --- HELPER PARA ESTILOS DE FORMATO (Corregido con rutas dinámicas) ---
const getFormatStyles = (format) => {
    if (format === 'primer_bloque') {
        return { 
            label: '📜 Primer Bloque', 
            badgeClass: 'bg-yellow-600/90 text-yellow-100 border-yellow-500/50',
            textClass: 'text-yellow-400',
            builderPath: '/primer-bloque/builder' // Ruta específica PB
        };
    }
    return { 
        label: '🏛️ Imperio', 
        badgeClass: 'bg-orange-600/90 text-orange-100 border-orange-500/50',
        textClass: 'text-orange-400',
        builderPath: '/imperio/builder' // Ruta específica Imperio
    };
};

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); 
    const [deckToDelete, setDeckToDelete] = useState(null); 
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterFormat, setFilterFormat] = useState("all");

    const [toast, setToast] = useState({ show: false, msg: "", type: "" }); 
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
            if (res.ok) setDecks(data);
            else showToast("Error al cargar mazos", "error");
        } catch (err) {
            showToast("Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    const togglePrivacy = async (deck) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/privacy/${deck._id}`, {
                method: "PUT",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                const updatedDeck = await res.json();
                setDecks(prev => prev.map(d => d._id === deck._id ? { ...d, isPublic: updatedDeck.isPublic } : d));
                if (selectedDeck && selectedDeck._id === deck._id) {
                    setSelectedDeck(prev => ({ ...prev, isPublic: updatedDeck.isPublic }));
                }
                showToast(updatedDeck.isPublic ? "¡Mazo ahora es PÚBLICO! 🌍" : "Mazo ahora es PRIVADO 🔒");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
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
                setSelectedDeck(null);
                showToast("Mazo eliminado correctamente");
            }
        } catch (err) {
            showToast("Error al eliminar", "error");
        } finally {
            setDeckToDelete(null);
        }
    };

    const showToast = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const getDeckTotal = (cards) => cards.reduce((acc, c) => acc + (c.quantity || 1), 0);

    const handleExport = (deck) => {
        const totalCards = getDeckTotal(deck.cards);
        const formatName = deck.format === 'primer_bloque' ? "Primer Bloque" : "Imperio";
        let content = `MAZO: ${deck.name}\nFormato: ${formatName}\nTotal: ${totalCards}\n------------------\n`;
        deck.cards.forEach(card => content += `${card.quantity || 1} x ${card.name}\n`);
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${deck.name.replace(/\s+/g, "_")}.txt`;
        element.click();
        showToast("Lista exportada con éxito");
    };

    // ✅ FUNCIÓN EDITAR CORREGIDA: Lleva al constructor correcto
    const handleEdit = (deck) => {
        const styles = getFormatStyles(deck.format);
        navigate(styles.builderPath, { state: { deckToEdit: deck } });
    };

    const getCardImage = (cards) => {
        if (!cards?.length) return null;
        const c = cards[0];
        return c.imgUrl || c.imageUrl || c.imagen || c.img || null;
    };

    const processedDecks = useMemo(() => {
        let result = [...decks];
        if (searchTerm) result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterFormat !== "all") result = result.filter(d => d.format === filterFormat);
        if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === "size") result.sort((a, b) => getDeckTotal(b.cards) - getDeckTotal(a.cards));
        else result.reverse(); 
        return result;
    }, [decks, searchTerm, sortBy, filterFormat]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl animate-pulse">
            Cargando la armería... ⚔️
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-20">
            {/* --- TOP BAR (Buscador y Filtros) --- */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-90">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Mis Mazos</h1>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-slate-500"><IconSearch /></span>
                            <input type="text" placeholder="Buscar..." className="bg-slate-800 text-sm text-white rounded-lg pl-10 pr-3 py-2 w-full outline-none focus:ring-1 focus:ring-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none cursor-pointer" value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
                            <option value="all">📚 Todos</option>
                            <option value="imperio">🏛️ Imperio</option>
                            <option value="primer_bloque">📜 Primer Bloque</option>
                        </select>
                        <select className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Recientes</option>
                            <option value="name">A-Z</option>
                            <option value="size">Tamaño</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- LISTA DE MAZOS --- */}
            <div className="max-w-7xl mx-auto p-6">
                {processedDecks.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No se encontraron mazos.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {processedDecks.map((deck) => (
                            <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all cursor-pointer h-72 flex flex-col shadow-lg">
                                <div className="absolute inset-0 bg-slate-900">
                                    <div className="w-full h-full bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${getCardImage(deck.cards)})` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent"></div>
                                </div>
                                <div className="absolute top-3 left-3 z-20">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-md ${getFormatStyles(deck.format).badgeClass}`}>
                                        {getFormatStyles(deck.format).label}
                                    </span>
                                </div>
                                <div className="relative z-10 mt-auto p-5">
                                    <h2 className="text-xl font-bold text-white capitalize truncate">{deck.name}</h2>
                                    <p className="text-xs text-orange-300 font-medium mt-1">{getDeckTotal(deck.cards)} Cartas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL DETALLE (Donde está el botón de Editar) --- */}
            {selectedDeck && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-600 flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-3xl font-bold text-white uppercase">{selectedDeck.name}</h2>
                                <div className="flex gap-3 mt-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${getFormatStyles(selectedDeck.format).badgeClass}`}>
                                        {getFormatStyles(selectedDeck.format).label}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold px-2 py-1 bg-slate-900 rounded">{getDeckTotal(selectedDeck.cards)} Cartas</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="text-slate-400 hover:text-white text-2xl">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                                        <span className="text-sm font-semibold">{c.name}</span>
                                        <span className="text-orange-500 font-black">x{c.quantity || 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-700 bg-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button onClick={() => togglePrivacy(selectedDeck)} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition">
                                {selectedDeck.isPublic ? <><IconLock /> Privado</> : <><IconWorld /> Público</>}
                            </button>
                            <button onClick={() => handleExport(selectedDeck)} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-bold transition">
                                <IconDownload /> Exportar
                            </button>
                            <button onClick={() => handleEdit(selectedDeck)} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-lg font-bold transition">
                                <IconEdit /> Editar
                            </button>
                            <button onClick={() => setDeckToDelete(selectedDeck)} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg font-bold transition">
                                <IconTrash /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ELIMINAR --- */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-8 rounded-2xl max-w-sm w-full text-center border border-red-500/20">
                        <h3 className="text-white text-xl font-bold mb-4">¿Eliminar "{deckToDelete.name}"?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 bg-slate-700 py-3 rounded-xl text-white font-bold">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl text-white font-bold">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOAST --- */}
            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] font-bold ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"} text-white`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
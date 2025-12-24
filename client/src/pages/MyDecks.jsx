import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config";
// ✅ Importación de iconos
import { Search, Trash2, Edit3, Download, Globe, Lock, X, ChevronRight, FileText } from "lucide-react";

const getFormatStyles = (format) => {
    if (format === 'primer_bloque') {
        return { 
            label: '📜 Primer Bloque', 
            badgeClass: 'bg-yellow-600/90 text-yellow-100 border-yellow-500/50',
            builderPath: '/primer-bloque/builder'
        };
    }
    return { 
        label: '🏛️ Imperio', 
        badgeClass: 'bg-orange-600/90 text-orange-100 border-orange-500/50',
        builderPath: '/imperio/builder'
    };
};

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); 
    const [deckToDelete, setDeckToDelete] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterFormat, setFilterFormat] = useState("all");
    const [toast, setToast] = useState({ show: false, msg: "", type: "" }); 
    const navigate = useNavigate();

    useEffect(() => { fetchDecks(); }, []);

    const fetchDecks = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/my-decks`, { headers: { "auth-token": token } });
            const data = await res.json();
            if (res.ok) setDecks(data);
            else showToast("Error al cargar mazos", "error");
        } catch (err) { showToast("Error de conexión", "error"); }
        finally { setLoading(false); }
    };

    const togglePrivacy = async (deck) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/privacy/${deck._id}`, { method: "PUT", headers: { "auth-token": token } });
            if (res.ok) {
                const updatedDeck = await res.json();
                setDecks(prev => prev.map(d => d._id === deck._id ? { ...d, isPublic: updatedDeck.isPublic } : d));
                if (selectedDeck?._id === deck._id) setSelectedDeck(prev => ({ ...prev, isPublic: updatedDeck.isPublic }));
                showToast(updatedDeck.isPublic ? "¡Mazo Público!" : "Mazo Privado");
            }
        } catch (error) { showToast("Error", "error"); }
    };

    const handleEdit = (deck) => {
        const styles = getFormatStyles(deck.format);
        navigate(styles.builderPath, { state: { deckToEdit: deck } });
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${deckToDelete._id}`, { method: "DELETE", headers: { "auth-token": token } });
            if (res.ok) {
                setDecks(prev => prev.filter(d => d._id !== deckToDelete._id));
                setSelectedDeck(null);
                showToast("Mazo eliminado");
            }
        } catch (err) { showToast("Error", "error"); }
        finally { setDeckToDelete(null); }
    };

    const showToast = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const getDeckTotal = (cards) => cards.reduce((acc, c) => acc + (c.quantity || 1), 0);
    const getCardImage = (cards) => cards?.length ? (cards[0].imgUrl || cards[0].imageUrl) : null;

    const processedDecks = useMemo(() => {
        let result = [...decks];
        if (searchTerm) result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterFormat !== "all") result = result.filter(d => d.format === filterFormat);
        if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === "size") result.sort((a, b) => getDeckTotal(b.cards) - getDeckTotal(a.cards));
        else result.reverse(); 
        return result;
    }, [decks, searchTerm, sortBy, filterFormat]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl animate-pulse">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-32 md:pb-20">
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-lg p-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">Mis Mazos</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                        <div className="relative flex-1 w-full sm:w-auto">
                            <span className="absolute left-3 top-2.5 text-slate-500"><Search size={18} /></span>
                            <input type="text" placeholder="Buscar..." className="bg-slate-800 text-sm text-white rounded-lg pl-10 pr-3 py-2 w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none w-full sm:w-auto" value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="imperio">🏛️ Imperio</option>
                            <option value="primer_bloque">📜 PB</option>
                        </select>
                        <select className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none w-full sm:w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Recientes</option>
                            <option value="name">A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all cursor-pointer h-72 flex flex-col">
                            <div className="absolute inset-0 bg-slate-900">
                                <div className="w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${getCardImage(deck.cards)})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent"></div>
                            </div>
                            <div className="absolute top-3 left-3 z-20">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                            </div>
                            <div className="relative z-10 mt-auto p-5">
                                <h2 className="text-xl font-bold text-white capitalize truncate">{deck.name}</h2>
                                <p className="text-xs text-orange-300 mt-1">{getDeckTotal(deck.cards)} Cartas</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDeck && (
                <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-600 flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-700 flex justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-3xl font-bold text-white uppercase">{selectedDeck.name}</h2>
                                <span className={`text-xs font-bold px-2 py-1 rounded border inline-block mt-2 ${getFormatStyles(selectedDeck.format).badgeClass}`}>
                                    {getFormatStyles(selectedDeck.format).label}
                                </span>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="text-slate-400 hover:text-white"><X size={28} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-32 md:pb-6">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                                        <span className="text-sm font-semibold">{c.name}</span>
                                        <span className="text-orange-500 font-black">x{c.quantity || 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-700 bg-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 z-[120]">
                            <button onClick={() => togglePrivacy(selectedDeck)} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition">
                                {selectedDeck.isPublic ? <><Lock size={18} /> Privado</> : <><Globe size={18} /> Público</>}
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-bold transition">
                                <FileText size={18} /> Lista
                            </button>
                            <button onClick={() => handleEdit(selectedDeck)} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-lg font-bold transition">
                                <Edit3 size={18} /> Editar
                            </button>
                            <button onClick={() => setDeckToDelete(selectedDeck)} className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 py-2.5 rounded-lg font-bold transition">
                                <Trash2 size={18} /> Borrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-slate-800 p-8 rounded-2xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
                        <h3 className="text-white text-xl font-bold mb-4">¿Eliminar "{deckToDelete.name}"?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 bg-slate-700 py-3 rounded-xl text-white font-bold transition-colors hover:bg-slate-600">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl text-white font-bold transition-colors hover:bg-red-500">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { Search, Trash2, Edit3, Download, Globe, Lock, X, Camera, FileText, LayoutGrid } from "lucide-react";

const getFormatStyles = (format) => {
    if (format === 'primer_bloque') {
        return { 
            label: '📜 Primer Bloque', 
            badgeClass: 'bg-yellow-600/90 text-yellow-100 border-yellow-500/50',
            builderPath: '/primer-bloque/builder',
            accentColor: '#eab308'
        };
    }
    return { 
        label: '🏛️ Imperio', 
        badgeClass: 'bg-orange-600/90 text-orange-100 border-orange-500/50',
        builderPath: '/imperio/builder',
        accentColor: '#f97316'
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
    const [isDownloading, setIsDownloading] = useState(false);
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

    // ✅ FUNCIÓN DE DESCARGA DE TEXTO (RESTAURADA)
    const handleDownloadTextList = (deck) => {
        let textContent = `MAZO: ${deck.name.toUpperCase()}\n`;
        textContent += `FORMATO: ${getFormatStyles(deck.format).label}\n`;
        textContent += `TOTAL CARTAS: ${getDeckTotal(deck.cards)}\n`;
        textContent += `-------------------------------\n\n`;
        
        // Agrupar por tipo si es posible o simplemente listar
        deck.cards.forEach(c => {
            textContent += `${c.quantity || 1}x ${c.name}\n`;
        });

        textContent += `\n-------------------------------\n Generado por WarningDeck.cl`;

        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `Lista_${deck.name.replace(/\s+/g, '_')}.txt`);
        showToast("Lista descargada");
    };

    // ✅ EXPORTACIÓN NATIVA IMAGEN (INTACTA)
    const handleDownloadInfographic = async (deck) => {
        setIsDownloading(true);
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const styles = getFormatStyles(deck.format);
            canvas.width = 1200;
            canvas.height = 1000;
            ctx.fillStyle = deck.format === 'primer_bloque' ? "#0c0e14" : "#0f0a07";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const loadImg = (url) => new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = url;
            });
            const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png");
            if (logo) {
                ctx.globalAlpha = 0.05;
                ctx.drawImage(logo, 300, 250, 600, 600);
                ctx.globalAlpha = 1.0;
            }
            ctx.fillStyle = styles.accentColor;
            ctx.font = "bold 24px Arial";
            ctx.fillText(styles.label.toUpperCase(), 50, 70);
            ctx.fillStyle = "white";
            ctx.font = "italic bold 50px Arial";
            ctx.fillText(deck.name.toUpperCase(), 50, 130);
            let x = 50, y = 200;
            for (const card of deck.cards) {
                const imgUrl = card.imgUrl || card.imageUrl || card.img;
                const img = await loadImg(imgUrl);
                if (img) {
                    ctx.drawImage(img, x, y, 120, 170);
                    ctx.fillStyle = styles.accentColor;
                    ctx.fillRect(x + 85, y + 140, 35, 30);
                    ctx.fillStyle = deck.format === 'primer_bloque' ? "black" : "white";
                    ctx.font = "bold 18px Arial";
                    ctx.fillText(`x${card.quantity || 1}`, x + 90, y + 162);
                }
                x += 140;
                if (x > 1100) { x = 50; y += 200; }
            }
            canvas.toBlob((blob) => {
                saveAs(blob, `WarningDeck_${deck.name}.png`);
            });
        } catch (err) {
            showToast("Error al generar imagen", "error");
        } finally {
            setIsDownloading(false);
        }
    };

    const showToast = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const getDeckTotal = (cards) => cards.reduce((acc, c) => acc + (c.quantity || 1), 0);
    const getCardImage = (c) => c?.imgUrl || c?.imageUrl || c?.img;

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
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600 uppercase italic tracking-tighter">Mis Mazos</h1>
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
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all cursor-pointer h-72 flex flex-col">
                            <div className="absolute inset-0 bg-slate-900">
                                <div className="w-full h-full bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${getCardImage(deck.cards[0])})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                            </div>
                            <div className="absolute top-3 left-3 z-20">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-xl ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                            </div>
                            <div className="relative z-10 mt-auto p-5">
                                <h2 className="text-xl font-black text-white uppercase truncate tracking-tighter">{deck.name}</h2>
                                <p className="text-[10px] text-orange-400 font-bold mt-1 tracking-widest">{getDeckTotal(deck.cards)} CARTAS</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDeck && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-600 flex flex-col h-[95vh] md:h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between bg-slate-900/80 items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedDeck.name}</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className={`text-[9px] md:text-[10px] font-black px-2 py-1 rounded border ${getFormatStyles(selectedDeck.format).badgeClass}`}>
                                        {getFormatStyles(selectedDeck.format).label}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] bg-slate-700 text-slate-300 font-black px-2 py-1 rounded border border-slate-600 uppercase">
                                        {getDeckTotal(selectedDeck.cards)} Cartas
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDeck(null)} className="bg-slate-700 p-2 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>
                        
                        {/* GALERÍA VISUAL */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0c0e14]">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
                                {selectedDeck.cards.map((c, i) => (
                                    <div key={i} className="relative group animate-fade-in">
                                        <div className="rounded-lg md:rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-orange-500/50 transition-all group-hover:scale-105">
                                            <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" loading="lazy" />
                                            <div className="absolute top-1 right-1 md:top-2 md:right-2 z-10">
                                                <div className="bg-orange-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-xs md:text-sm shadow-xl border border-white/20">
                                                    {c.quantity || 1}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-[8px] md:text-[10px] text-slate-400 uppercase font-bold truncate text-center px-1">{c.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PANEL DE ACCIONES */}
                        <div className="p-4 border-t border-slate-700 bg-slate-900 grid grid-cols-2 md:grid-cols-5 gap-3">
                            <button onClick={() => togglePrivacy(selectedDeck)} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-black text-[10px] uppercase border border-white/5">
                                {selectedDeck.isPublic ? <><Lock size={16} className="text-red-500" /> Privado</> : <><Globe size={16} className="text-green-500" /> Público</>}
                            </button>
                            
                            <button onClick={() => handleDownloadInfographic(selectedDeck)} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all">
                                <Camera size={16} /> {isDownloading ? '...' : 'Infografía'}
                            </button>

                            <button onClick={() => handleEdit(selectedDeck)} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">
                                <Edit3 size={16} /> Editar
                            </button>

                            {/* ✅ BOTÓN DE TEXTO REPARADO */}
                            <button 
                                onClick={() => handleDownloadTextList(selectedDeck)}
                                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-black text-[10px] uppercase border border-white/5 transition-all"
                            >
                                <FileText size={16} /> Lista
                            </button>
                            
                            <button onClick={() => setDeckToDelete(selectedDeck)} className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 border border-red-600/30 py-3 rounded-xl font-black text-[10px] uppercase">
                                <Trash2 size={16} /> Borrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Borrado Confirm... */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                        <h3 className="text-white text-xl font-black mb-2 uppercase italic">¿Eliminar?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 bg-slate-700 py-3 rounded-xl text-white font-black text-xs uppercase">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl text-white font-black text-xs uppercase transition-all">Sí, Borrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICACIÓN */}
            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-fade-in-up flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { Search, Trash2, Edit3, Globe, Lock, X, Camera, FileText, LayoutGrid, ChevronDown } from "lucide-react";

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

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

    const handleDownloadTextList = (deck) => {
        let textContent = `MAZO: ${deck.name.toUpperCase()}\n`;
        textContent += `FORMATO: ${getFormatStyles(deck.format).label}\n`;
        textContent += `TOTAL CARTAS: ${getDeckTotal(deck.cards)}\n`;
        textContent += `-------------------------------\n\n`;
        deck.cards.forEach(c => {
            textContent += `${c.quantity || 1}x ${c.name}\n`;
        });
        textContent += `\n-------------------------------\n Generado por WarningDeck.cl`;
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `Lista_${deck.name.replace(/\s+/g, '_')}.txt`);
        showToast("Lista descargada");
    };

    // ✅ EXPORTACIÓN IMAGEN REPARADA PARA LA VISTA DE MIS MAZOS
    const handleDownloadInfographic = async (deck) => {
        setIsDownloading(true);
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const cards = deck.cards;
            const cardsPerRow = 10;
            const rows = Math.ceil(cards.length / cardsPerRow);
            
            canvas.width = 1200;
            canvas.height = 300 + (rows * 160) + 180; 

            ctx.fillStyle = "#0c0e14";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const loadImg = (url) => new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = url;
            });

            const logoUrl = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png";
            const logo = await loadImg(logoUrl);

            if (logo) {
                ctx.save();
                ctx.globalAlpha = 0.04;
                ctx.drawImage(logo, canvas.width/2 - 350, canvas.height/2 - 350, 700, 700);
                ctx.restore();
                ctx.drawImage(logo, 50, 30, 80, 80);
            }

            const accentColor = getFormatStyles(deck.format).accentColor;
            ctx.fillStyle = accentColor;
            ctx.font = "bold 20px Arial";
            ctx.fillText("ESTRATEGIA GUARDADA", 150, 60);

            ctx.fillStyle = "white";
            ctx.font = "italic bold 55px Arial";
            ctx.fillText(deck.name.toUpperCase(), 150, 110);

            const totalCards = getDeckTotal(cards);
            ctx.fillStyle = "#1e293b";
            if(ctx.roundRect) ctx.roundRect(950, 50, 200, 60, 15); else ctx.fillRect(950, 50, 200, 60);
            ctx.fill();
            ctx.fillStyle = accentColor;
            ctx.font = "bold 28px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${totalCards} CARTAS`, 1050, 90);
            ctx.textAlign = "left";

            // Estadísticas locales para el deck seleccionado
            const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
            cards.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += (c.quantity || 1); });

            let x = 50, y = 180;
            const cardWidth = 105;
            const cardHeight = 147;
            const spacingX = 112;
            const spacingY = 165;

            for (const card of cards) {
                const img = await loadImg(card.imgUrl || card.imageUrl || card.img);
                if (img) {
                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowBlur = 10;
                    ctx.drawImage(img, x, y, cardWidth, cardHeight);
                    ctx.shadowBlur = 0;
                    
                    ctx.fillStyle = accentColor;
                    const badgeX = x + 75;
                    const badgeY = y + 120;
                    if(ctx.roundRect) {
                        ctx.beginPath();
                        ctx.roundRect(badgeX, badgeY, 32, 28, 8);
                        ctx.fill();
                    } else {
                        ctx.fillRect(badgeX, badgeY, 32, 28);
                    }
                    ctx.fillStyle = "black";
                    ctx.font = "bold 16px Arial";
                    ctx.fillText(`x${card.quantity || 1}`, badgeX + 4, badgeY + 20);
                }
                x += spacingX;
                if (x > 1120) { x = 50; y += spacingY; }
            }

            const footerY = canvas.height - 150;
            let startX = 50;
            const boxWidth = 215;

            ORDER_TYPES.forEach((type) => {
                const count = counts[type] || 0;
                const percentage = totalCards > 0 ? (count / totalCards) : 0;

                ctx.fillStyle = "#161b22";
                if(ctx.roundRect) {
                    ctx.beginPath();
                    ctx.roundRect(startX, footerY, boxWidth, 100, 20);
                    ctx.fill();
                    ctx.strokeStyle = accentColor + "33";
                    ctx.stroke();
                }
                ctx.fillStyle = accentColor;
                ctx.font = "bold 12px Arial";
                ctx.fillText(type.toUpperCase(), startX + 15, footerY + 30);
                ctx.fillStyle = "white";
                ctx.font = "bold 40px Arial";
                ctx.fillText(count, startX + 15, footerY + 75);
                ctx.fillStyle = "#334155";
                ctx.fillRect(startX + 15, footerY + 85, boxWidth - 40, 6);
                ctx.fillStyle = accentColor;
                ctx.fillRect(startX + 15, footerY + 85, (boxWidth - 40) * percentage, 6);
                startX += boxWidth + 15;
            });

            ctx.fillStyle = "#475569";
            ctx.font = "12px Arial";
            ctx.fillText("GENERADO POR WARNING DECK BUILDER • 2025", 50, canvas.height - 20);

            canvas.toBlob((blob) => {
                saveAs(blob, `WD_${deck.format}_${deck.name}.png`);
                setIsDownloading(false);
                showToast("Imagen exportada");
            });
        } catch (err) {
            console.error(err);
            setIsDownloading(false);
            showToast("Error al generar imagen", "error");
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
                {processedDecks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                        <LayoutGrid size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 font-bold uppercase">No se encontraron mazos</p>
                    </div>
                ) : (
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
                )}
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

                        <div className="p-4 border-t border-slate-700 bg-slate-900 grid grid-cols-2 md:grid-cols-5 gap-3">
                            <button onClick={() => togglePrivacy(selectedDeck)} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-black text-[10px] uppercase border border-white/5">
                                {selectedDeck.isPublic ? <><Lock size={16} className="text-red-500" /> Privado</> : <><Globe size={16} className="text-green-500" /> Público</>}
                            </button>
                            
                            <button onClick={() => handleDownloadInfographic(selectedDeck)} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all">
                                <Camera size={16} /> {isDownloading ? 'Generando...' : 'Exportar Imagen'}
                            </button>

                            <button onClick={() => handleEdit(selectedDeck)} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">
                                <Edit3 size={16} /> Editar
                            </button>

                            <button onClick={() => handleDownloadTextList(selectedDeck)} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-black text-[10px] uppercase border border-white/5 transition-all">
                                <FileText size={16} /> Lista Texto
                            </button>
                            
                            <button onClick={() => setDeckToDelete(selectedDeck)} className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 border border-red-600/30 py-3 rounded-xl font-black text-[10px] uppercase">
                                <Trash2 size={16} /> Borrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
                        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                        <h3 className="text-white text-xl font-black mb-2 uppercase italic">¿Eliminar Mazo?</h3>
                        <p className="text-slate-400 text-sm mb-6 uppercase font-bold">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 bg-slate-700 py-3 rounded-xl text-white font-black text-xs uppercase">Cancelar</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl text-white font-black text-xs uppercase transition-all">Sí, Borrar</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-fade-in-up flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
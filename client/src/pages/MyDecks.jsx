import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { Search, Trash2, Edit3, Globe, Lock, X, Camera, FileText, LayoutGrid, Bell, Heart, ArrowRight, MessageSquare, Send } from "lucide-react";

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getFormatStyles = (format) => {
    if (format === 'primer_bloque') {
        return { 
            label: '📜 Primer Bloque', 
            badgeClass: 'bg-blue-600 text-white border-blue-400/50',
            builderPath: '/primer-bloque/builder',
            accentColor: '#2563eb'
        };
    }
    return { 
        label: '🏛️ Imperio', 
        badgeClass: 'bg-indigo-600 text-white border-indigo-400/50',
        builderPath: '/imperio/builder',
        accentColor: '#4f46e5'
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
    const [showNotifications, setShowNotifications] = useState(false);
    const [newComment, setNewComment] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const isAdmin = user?.role === "admin";

    useEffect(() => { fetchDecks(); }, []);

    const fetchDecks = async () => {
        if (!token) return navigate("/login");
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/my-decks`, { headers: { "auth-token": token } });
            const data = await res.json();
            if (res.ok) setDecks(data);
            else showToast("Error al cargar mazos", "error");
        } catch (err) { showToast("Error de conexión", "error"); }
        finally { setLoading(false); }
    };

    const notifications = useMemo(() => {
        const allComments = [];
        decks.filter(d => d.isPublic).forEach(deck => {
            deck.comments?.forEach(comment => {
                allComments.push({ ...comment, deckName: deck.name, deckId: deck._id, fullDeck: deck });
            });
        });
        return allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    }, [decks]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/${selectedDeck._id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ text: newComment })
            });
            if (res.ok) {
                const updatedDeck = await res.json();
                setSelectedDeck(updatedDeck);
                setDecks(prev => prev.map(d => d._id === updatedDeck._id ? updatedDeck : d));
                setNewComment("");
                showToast("Comentario enviado");
            }
        } catch (error) { console.error(error); }
    };

    const togglePrivacy = async (deck, e) => {
        if (e) e.stopPropagation();
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

    const handleEdit = (deck, e) => {
        if (e) e.stopPropagation();
        const styles = getFormatStyles(deck.format);
        navigate(styles.builderPath, { state: { deckToEdit: deck } });
    };

    const handleDeleteClick = (deck, e) => {
        if (e) e.stopPropagation();
        setDeckToDelete(deck);
    };

    const confirmDelete = async () => {
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

    const handleDownloadTextList = (deck, e) => {
        if (e) e.stopPropagation();
        let textContent = `MAZO: ${deck.name.toUpperCase()}\n`;
        textContent += `FORMATO: ${getFormatStyles(deck.format).label}\n`;
        textContent += `TOTAL CARTAS: ${getDeckTotal(deck.cards)}\n`;
        textContent += `-------------------------------\n\n`;
        deck.cards.forEach(c => {
            textContent += `${c.quantity || 1}x ${c.name}\n`;
        });
        textContent += `\n-------------------------------\n Generado por ForjaDeck.com`;
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `Lista_${deck.name.replace(/\s+/g, '_')}.txt`);
        showToast("Lista descargada");
    };

    const handleDownloadInfographic = async (deck, e) => {
        if (e) e.stopPropagation();
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
                const img = new Image(); img.crossOrigin = "anonymous";
                img.onload = () => resolve(img); img.onerror = () => resolve(null);
                img.src = url;
            });

            const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/refs/heads/main/forja.png");
            if (logo) {
                ctx.save(); ctx.globalAlpha = 0.04;
                ctx.drawImage(logo, canvas.width/2 - 350, canvas.height/2 - 350, 700, 700);
                ctx.restore(); ctx.drawImage(logo, 50, 30, 80, 80);
            }

            const styles = getFormatStyles(deck.format);
            ctx.fillStyle = styles.accentColor; ctx.font = "bold 20px Arial";
            ctx.fillText("ESTRATEGIA GUARDADA", 150, 60);
            ctx.fillStyle = "white"; ctx.font = "italic bold 55px Arial";
            ctx.fillText(deck.name.toUpperCase(), 150, 110);

            const totalCardsCount = deck.cards.reduce((a, b) => a + (b.quantity || 1), 0);
            ctx.fillStyle = "#1e293b";
            if(ctx.roundRect) ctx.roundRect(950, 50, 200, 60, 15); else ctx.fillRect(950, 50, 200, 60);
            ctx.fill(); ctx.fillStyle = "white"; ctx.font = "bold 28px Arial"; ctx.textAlign = "center";
            ctx.fillText(`${totalCardsCount} CARTAS`, 1050, 90); ctx.textAlign = "left";

            const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
            cards.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += (c.quantity || 1); });

            let xPos = 50, yPos = 180;
            for (const card of cards) {
                const img = await loadImg(card.imgUrl || card.imageUrl || card.img);
                if (img) {
                    ctx.drawImage(img, xPos, yPos, 105, 147);
                    ctx.fillStyle = styles.accentColor;
                    if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(xPos+75, yPos+120, 32, 28, 8); ctx.fill(); }
                    else ctx.fillRect(xPos+75, yPos+120, 32, 28);
                    ctx.fillStyle = "black"; ctx.font = "bold 16px Arial";
                    ctx.fillText(`x${card.quantity || 1}`, xPos+79, yPos+140);
                }
                xPos += 112; if (xPos > 1120) { xPos = 50; yPos += 165; }
            }

            const footerY = canvas.height - 150; let startX = 50;
            ORDER_TYPES.forEach((type) => {
                const count = counts[type] || 0;
                const perc = totalCardsCount > 0 ? (count / totalCardsCount) : 0;
                ctx.fillStyle = "#161b22";
                if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(startX, footerY, 215, 100, 20); ctx.fill(); ctx.strokeStyle = styles.accentColor + "33"; ctx.stroke(); }
                ctx.fillStyle = styles.accentColor; ctx.font = "bold 12px Arial"; ctx.fillText(type.toUpperCase(), startX + 15, footerY + 30);
                ctx.fillStyle = "white"; ctx.font = "bold 40px Arial"; ctx.fillText(count, startX + 15, footerY + 75);
                ctx.fillStyle = "#334155"; ctx.fillRect(startX + 15, footerY + 85, 175, 6);
                ctx.fillStyle = styles.accentColor; ctx.fillRect(startX + 15, footerY + 85, 175 * perc, 6);
                startX += 230;
            });

            canvas.toBlob((blob) => { saveAs(blob, `Forja_${deck.name}.png`); setIsDownloading(false); showToast("Imagen exportada"); });
        } catch (err) { console.error(err); setIsDownloading(false); showToast("Error", "error"); }
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
        return result.reverse(); 
    }, [decks, searchTerm, filterFormat]);

    if (loading) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center transition-colors"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white pb-32 transition-colors duration-500 overflow-x-hidden font-sans">
            
            {/* --- HEADER --- */}
            <div className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 px-4 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">Mis <span className="text-blue-600">Estrategias</span></h1>
                        
                        {/* ✅ CAMPANA RESPONSIVA */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl transition-all relative">
                                <Bell size={20} className={notifications.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-400"} />
                                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                            </button>
                            
                            {showNotifications && (
                                <div className="fixed md:absolute top-16 md:top-12 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[90%] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-[100] animate-in fade-in zoom-in-95">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><MessageSquare size={12}/> Actividad Reciente</h4>
                                    <div className="space-y-2 max-h-[40vh] md:max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.map((n, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border dark:border-white/5 cursor-pointer hover:border-blue-500 transition-all" onClick={() => { setSelectedDeck(n.fullDeck); setShowNotifications(false); }}>
                                                <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1">Mazo: {n.deckName}</p>
                                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2">@{n.username}: "{n.text}"</p>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && <p className="text-[10px] text-center opacity-40 py-6 font-black italic">Sin actividad</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto bg-slate-100 dark:bg-black/40 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="relative flex-1 md:w-64">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input type="text" placeholder="Filtrar..." className="bg-transparent text-[10px] font-bold pl-9 pr-3 py-2 w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID DE MAZOS --- */}
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col">
                            <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={getCardImage(deck.cards[0])} className="w-full h-full object-cover opacity-80 dark:opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent"></div>
                                
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                    <button onClick={(e) => handleEdit(deck, e)} className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><Edit3 size={18}/></button>
                                    <button onClick={(e) => togglePrivacy(deck, e)} className="p-3 bg-slate-800 text-white rounded-full hover:scale-110 transition-transform shadow-lg">{deck.isPublic ? <Globe size={18}/> : <Lock size={18}/>}</button>
                                    <button onClick={(e) => handleDeleteClick(deck, e)} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><Trash2 size={18}/></button>
                                </div>

                                <div className="absolute top-4 left-4 z-10">
                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-black uppercase italic truncate group-hover:text-blue-600 transition-colors leading-none">{deck.name}</h2>
                                <div className="flex justify-between items-center mt-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{deck.cards.reduce((a, b) => a + (b.quantity || 1), 0)} Cartas</span>
                                        <div className="flex items-center gap-1 text-blue-600"><MessageSquare size={12}/> <span className="text-[10px] font-black">{deck.comments?.length || 0}</span></div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/95 md:backdrop-blur-md flex items-end md:items-center justify-center transition-all" onClick={() => setSelectedDeck(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[95vh] md:h-[90vh] rounded-t-[3rem] md:rounded-[3.5rem] border-x border-t md:border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 md:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                            <div className="min-w-0">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none">{selectedDeck.name}</h2>
                                <div className="flex gap-2 mt-3">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${getFormatStyles(selectedDeck.format).badgeClass}`}>{getFormatStyles(selectedDeck.format).label}</span>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-lg uppercase bg-slate-100 dark:bg-white/10 text-slate-500">Público: {selectedDeck.isPublic ? 'SÍ' : 'NO'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button onClick={(e) => togglePrivacy(selectedDeck, e)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase border dark:border-white/5">
                                    {selectedDeck.isPublic ? <><Globe size={16} className="text-blue-600" /> Público</> : <><Lock size={16} className="text-red-500" /> Privado</>}
                                </button>
                                <button onClick={(e) => handleDownloadInfographic(selectedDeck, e)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase border dark:border-white/5">
                                    <Camera size={16} className="text-indigo-500" /> Foto
                                </button>
                                <button onClick={(e) => handleDownloadTextList(selectedDeck, e)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase border dark:border-white/5">
                                    <FileText size={16} className="text-emerald-500" /> Texto
                                </button>
                                <button onClick={(e) => handleEdit(selectedDeck, e)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                    <Edit3 size={16} /> Forjar
                                </button>
                                <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-8">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group animate-in fade-in zoom-in-95">
                                            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 group-hover:border-blue-600 shadow-sm transition-all group-hover:scale-105">
                                                <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" />
                                                <div className="absolute top-1 right-1 bg-blue-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[10px] md:text-sm border-2 border-white dark:border-slate-900">
                                                    x{c.quantity || 1}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[8px] md:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase truncate text-center italic tracking-tighter">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-[0.6] md:max-w-[380px] bg-white dark:bg-slate-800/20 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5">
                                <div className="p-6 border-b border-slate-200 dark:border-white/5 font-black text-[10px] uppercase flex items-center gap-2 text-blue-600 bg-slate-50 dark:bg-slate-900/30 flex-shrink-0">
                                    <MessageSquare size={16} /> Conversación ({selectedDeck.comments?.length || 0})
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {selectedDeck.comments?.map((com, idx) => (
                                        <div key={com._id || idx} className="bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                            <p className="text-[9px] font-black text-blue-600 mb-1 uppercase">@{com.username}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{com.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex-shrink-0">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Responder..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-blue-500 transition-all dark:text-white" />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-3 rounded-xl text-white active:scale-95 transition-transform shadow-lg"><Send size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Borrar */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] max-w-sm w-full text-center border border-slate-200 dark:border-white/10 shadow-2xl">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
                        <h3 className="text-2xl font-black mb-8 uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">¿Confirmar<br/>eliminación?</h3>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 py-4 rounded-2xl text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-500 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-transform">Sí, Borrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-fade-in-up flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-600 text-white border-red-500' : 'bg-blue-600 text-white border-blue-500'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
import { useEffect, useState, useMemo, useRef } from "react"; // ✅ useRef recuperado
import { useNavigate, Link } from "react-router-dom";
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image'; // ✅ toPng recuperado
import BACKEND_URL from "../config";
import { Search, Trash2, Edit3, Globe, Lock, X, Camera, FileText, LayoutGrid, Bell, Heart, ArrowRight, MessageSquare, Send, Swords, Plus, ScrollText, Sword, Sparkles, Wand2 } from "lucide-react";

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getFormatStyles = (format) => {
    if (format === 'primer_bloque') {
        return { 
            label: '📜 PB', 
            badgeClass: 'bg-blue-600 text-white',
            builderPath: '/primer-bloque/builder',
            accentColor: '#2563eb'
        };
    }
    return { 
        label: '🏛️ Imperio', 
        badgeClass: 'bg-indigo-600 text-white',
        builderPath: '/imperio/builder',
        accentColor: '#4f46e5'
    };
};

const animationStyles = `
  @keyframes shine { from { left: -100%; } to { left: 100%; } }
  .animate-shine { position: relative; overflow: hidden; }
  .animate-shine::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent); transform: skewX(-25deg); animation: shine 3s infinite; }
  
  .card-reveal-zoom {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: zoom-in;
    transform-origin: center center;
  }
  .card-reveal-zoom:hover {
    transform: scale(1.15) translateY(-5px);
    z-index: 50;
    filter: brightness(1.05);
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3);
  }
  
  .glass-light {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

export default function MyDecks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeck, setSelectedDeck] = useState(null); 
    const [deckToDelete, setDeckToDelete] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [filterFormat, setFilterFormat] = useState("all");
    const [toast, setToast] = useState({ show: false, msg: "", type: "" }); 
    const [isDownloading, setIsDownloading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [showMobileComments, setShowMobileComments] = useState(false); 
    const [cardToZoom, setCardToZoom] = useState(null);
    const navigate = useNavigate();

    // ✅ REFERENCIA PARA CAPTURA DE IMAGEN RECUPERADA
    const deckImageRef = useRef(null);

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

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

    const getTotalCards = (cards) => {
        return cards.reduce((acc, card) => acc + (card.quantity || 1), 0);
    };

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
                showToast(updatedDeck.isPublic ? "Mazo Público" : "Mazo Privado");
            }
        } catch (error) { showToast("Error", "error"); }
    };

    const handleEdit = (deck, e) => {
        if (e) e.stopPropagation();
        navigate(getFormatStyles(deck.format).builderPath, { state: { deckToEdit: deck } });
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
        let textContent = `MAZO: ${deck.name.toUpperCase()}\nRAZA: ${deck.race || 'Híbrido'}\nTOTAL: ${getTotalCards(deck.cards)}\n\n`;
        deck.cards.forEach(c => { textContent += `${c.quantity || 1}x ${c.name}\n`; });
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `Lista_${deck.name}.txt`);
    };

    // ✅ LÓGICA DE DESCARGA DE IMAGEN RECUPERADA Y CORREGIDA
    const handleDownloadInfographic = async (deck, e) => {
        if (e) e.stopPropagation();
        if (!deckImageRef.current) return;
        
        setIsDownloading(true);
        showToast("Generando archivo...", "info");
        
        try {
            const dataUrl = await toPng(deckImageRef.current, { 
                quality: 0.95, 
                backgroundColor: '#0f172a',
                cacheBust: true 
            });
            saveAs(dataUrl, `Mazo_${deck.name}.png`);
            showToast("Imagen descargada ✅");
        } catch (err) { 
            console.error(err);
            showToast("Error al generar imagen", "error"); 
        } finally { 
            setIsDownloading(false); 
        }
    };

    const showToast = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const getCardImage = (c) => c?.imgUrl || c?.imageUrl || c?.img;

    const processedDecks = useMemo(() => {
        let result = [...decks];
        if (searchTerm) result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterFormat !== "all") result = result.filter(d => d.format === filterFormat);
        return result.reverse(); 
    }, [decks, searchTerm, filterFormat]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-32 transition-colors duration-500 overflow-x-hidden font-sans text-center relative">
            <style>{animationStyles}</style>

            {/* --- TOP BANNER --- */}
            <div className="w-full bg-blue-600 py-2 px-4 text-white shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <p className="hidden md:block text-[10px] font-black uppercase tracking-widest italic opacity-90">Forja tu arsenal estratégico</p>
                    <div className="flex gap-2 mx-auto md:mx-0">
                        <Link to="/primer-bloque/builder" className="flex items-center gap-1.5 bg-black/20 hover:bg-black/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic transition-all border border-white/20">
                            <ScrollText size={12} /> Nuevo PB
                        </Link>
                        <Link to="/imperio/builder" className="flex items-center gap-1.5 bg-white text-blue-600 hover:bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic transition-all shadow-md">
                            <Sword size={12} /> Nuevo Imperio
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-left">
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Mis <span className="text-blue-600">Mazos</span></h1>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl relative transition-all hover:bg-slate-200">
                                <Bell size={20} className={notifications.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-400"} />
                                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
                            </button>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input type="text" placeholder="Buscar mazo..." className="bg-slate-100 dark:bg-slate-700 text-xs font-bold pl-10 pr-4 py-2.5 w-full rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col text-left">
                            <div className="h-40 md:h-48 relative overflow-hidden bg-slate-200 dark:bg-slate-900">
                                <img src={getCardImage(deck.cards[0])} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-800 via-transparent opacity-90"></div>
                                
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                                    <span className="text-[7px] font-black px-2 py-0.5 rounded-md uppercase bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 flex items-center gap-1">
                                        <Swords size={8} /> {deck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h2 className="text-sm font-black uppercase italic truncate group-hover:text-blue-600 transition-colors leading-none tracking-tighter">{deck.name}</h2>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getTotalCards(deck.cards)} Cartas</span>
                                    <MessageSquare size={12} className="text-slate-300"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-end md:items-center justify-center p-2" onClick={() => { setSelectedDeck(null); setShowMobileComments(false); }}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[92vh] md:h-[85vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-5 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 text-left">
                            <div>
                                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedDeck.name}</h2>
                                <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-widest">Creado por @{selectedDeck.user?.username}</p>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button onClick={(e) => handleEdit(selectedDeck, e)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"><Edit3 size={14} /> Editar</button>
                                <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* ✅ CONTENEDOR DE CARTAS CON REFERENCIA PARA DESCARGA RECUPERADO */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50 dark:bg-slate-950/20 custom-scrollbar" ref={deckImageRef}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-6">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group text-center cursor-pointer" onClick={() => setCardToZoom(c)}>
                                            <div className="card-reveal-zoom rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm">
                                                <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" />
                                                <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-black text-[9px] border border-white shadow-md z-10">
                                                    {c.quantity || 1}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[7px] md:text-[9px] text-slate-400 font-bold uppercase truncate italic">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`
                                flex-[0.5] md:max-w-[340px] bg-white dark:bg-slate-800 flex flex-col min-h-0 border-l border-slate-100 dark:border-white/5
                                fixed md:relative bottom-0 left-0 w-full md:w-auto h-[60vh] md:h-auto z-[120] md:z-0 transition-transform duration-300
                                ${showMobileComments ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                            `}>
                                <div className="p-4 border-b border-slate-100 dark:border-white/5 font-black text-[9px] uppercase flex items-center justify-between text-slate-400">
                                    <span>Conversación</span>
                                    <button onClick={() => setShowMobileComments(false)} className="md:hidden"><X size={16}/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left text-xs">
                                    {selectedDeck.comments?.map((com, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                            <p className="text-[9px] font-black text-blue-600 mb-1">@{com.username}</p>
                                            <p className="text-slate-600 dark:text-slate-300">{com.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Comentar..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500 transition-all shadow-inner" />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md active:scale-95"><Send size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✅ BOTONES DE ACCIÓN (INCLUYE DESCARGAR FOTO) */}
                        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-2 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800">
                            <button onClick={(e) => togglePrivacy(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white p-3 rounded-2xl font-black text-[9px] uppercase border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-100">
                                {selectedDeck.isPublic ? <Globe size={14} className="text-blue-500" /> : <Lock size={14} className="text-slate-400" />} {selectedDeck.isPublic ? 'Público' : 'Privado'}
                            </button>
                            <button onClick={(e) => handleDownloadInfographic(selectedDeck, e)} disabled={isDownloading} className="flex items-center justify-center gap-2 bg-slate-900 text-white p-3 rounded-2xl font-black text-[9px] uppercase shadow-md active:scale-95 transition-all disabled:opacity-50"><Camera size={14} /> {isDownloading ? 'Generando...' : 'Exportar Foto'}</button>
                            <button onClick={(e) => handleDownloadTextList(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white p-3 rounded-2xl font-black text-[9px] uppercase border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-100"><FileText size={14} /> Lista Texto</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(selectedDeck); }} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 p-3 rounded-2xl font-black text-[9px] uppercase border border-red-100 transition-all hover:bg-red-600 hover:text-white"><Trash2 size={14} /> Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {cardToZoom && (
                <div className="fixed inset-0 z-[300] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4" onClick={() => setCardToZoom(null)}>
                    <button className="absolute top-6 right-6 w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500" onClick={() => setCardToZoom(null)}><X size={20} /></button>
                    <div className="max-w-xs md:max-w-md w-full flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <img src={getCardImage(cardToZoom)} className="w-full h-auto rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-800" alt="zoom" />
                        <div className="mt-6 text-center">
                             <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{cardToZoom.name}</h4>
                             <p className="text-blue-600 font-bold uppercase text-[9px] tracking-[0.3em] mt-2">{cardToZoom.type} • {cardToZoom.race || 'Unidad'}</p>
                        </div>
                    </div>
                </div>
            )}

            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-sm w-full text-center border border-slate-100 shadow-2xl">
                        <h3 className="text-xl font-black mb-2 uppercase">¿Confirmar?</h3>
                        <p className="text-slate-400 text-xs font-bold mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-[10px]">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-2xl text-white font-black uppercase text-[10px]">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full font-black text-[9px] uppercase shadow-xl animate-in slide-in-from-bottom-10 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="text-center flex flex-col items-center group cursor-default">
            <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 text-blue-600 dark:text-blue-400">{icon}</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 italic">{title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-[220px] opacity-70 dark:opacity-60">{text}</p>
        </div>
    );
}
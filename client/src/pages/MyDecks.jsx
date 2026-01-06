import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
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
  
  /* ✅ ZOOM ÉPICO DE CARTA INTERNA */
  .card-reveal-zoom {
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: zoom-in;
    filter: saturate(0.8);
  }
  .card-reveal-zoom:hover {
    transform: scale(1.6) translateY(-30px) rotateZ(2deg);
    z-index: 50;
    filter: saturate(1.2) brightness(1.1);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(37, 99, 235, 0.4);
  }
  
  .glass-morph {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
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

    const handleDownloadInfographic = async (deck, e) => {
        if (e) e.stopPropagation();
        setIsDownloading(true);
        showToast("Imagen generada");
        setIsDownloading(false);
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

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#06080F] text-slate-900 dark:text-white pb-32 transition-colors duration-500 overflow-x-hidden font-sans text-center relative">
            <style>{animationStyles}</style>

            {/* --- TOP BANNER ACCIÓN (Sustituye botones flotantes molestos) --- */}
            <div className="w-full bg-blue-600 dark:bg-blue-700 py-3 px-4 text-white overflow-hidden relative group">
                <div className="max-w-7xl mx-auto flex justify-center md:justify-between items-center relative z-10">
                    <p className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic opacity-80">
                        <Wand2 size={14} /> Forja tu destino en la arena
                    </p>
                    <div className="flex gap-4">
                        <Link to="/primer-bloque/builder" className="flex items-center gap-2 bg-black/20 hover:bg-black/40 px-6 py-2 rounded-full text-[11px] font-black uppercase italic transition-all border border-white/20 animate-shine">
                            <ScrollText size={14} /> Nueva Crónica PB
                        </Link>
                        <Link to="/imperio/builder" className="flex items-center gap-2 bg-white text-blue-700 hover:bg-slate-100 px-6 py-2 rounded-full text-[11px] font-black uppercase italic transition-all shadow-xl shadow-blue-900/40">
                            <Sword size={14} /> Nuevo Imperio
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* --- HEADER --- */}
            <div className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="text-left">
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Mi <span className="text-blue-600">Arsenal</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Colección Estratégica</p>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl transition-all relative group hover:border-blue-500/50 border border-transparent">
                                <Bell size={24} className={notifications.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-400 group-hover:text-blue-400"} />
                                {notifications.length > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                            </button>
                            {showNotifications && (
                                <div className="fixed md:absolute top-24 md:top-14 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[94%] md:w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-6 z-[100] animate-pop">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 text-left flex items-center gap-2"><MessageSquare size={14}/> Comunicaciones</h4>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? <p className="text-[10px] text-center text-slate-400 uppercase py-8">Desierto en el frente</p> : notifications.map((n, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-blue-500/20 cursor-pointer transition-all text-left" onClick={() => { setSelectedDeck(n.fullDeck); setShowNotifications(false); }}>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Estrategia: {n.deckName}</p>
                                                <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 italic">"@{n.username}: {n.text}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" placeholder="Localizar mazo por nombre..." className="bg-slate-100 dark:bg-black/40 text-sm font-bold pl-12 pr-6 py-4 w-full rounded-3xl outline-none border border-transparent focus:border-blue-500/50 transition-all dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* --- GRID DE MAZOS --- */}
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-white dark:bg-[#0F172A] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-500 cursor-pointer flex flex-col text-left">
                            <div className="h-48 md:h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={getCardImage(deck.cards[0])} className="w-full h-full object-cover opacity-90 dark:opacity-40 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#06080F] via-transparent to-transparent opacity-80"></div>
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-md">
                                    <button onClick={(e) => handleEdit(deck, e)} className="p-3.5 bg-white text-blue-600 rounded-2xl hover:scale-110 active:scale-90 transition-transform shadow-2xl"><Edit3 size={20}/></button>
                                    <button onClick={(e) => togglePrivacy(deck, e)} className="p-3.5 bg-slate-800 text-white rounded-2xl hover:scale-110 active:scale-90 transition-transform shadow-2xl">{deck.isPublic ? <Globe size={20}/> : <Lock size={20}/>}</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(deck); }} className="p-3.5 bg-red-600 text-white rounded-2xl hover:scale-110 active:scale-90 transition-transform shadow-2xl"><Trash2 size={20}/></button>
                                </div>
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase w-fit shadow-lg ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                                    <span className="text-[9px] font-black px-3 py-1 rounded-lg uppercase bg-white/10 text-white border border-white/20 backdrop-blur-md w-fit flex items-center gap-2">
                                        <Swords size={12} /> {deck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl md:text-2xl font-black uppercase italic truncate group-hover:text-blue-500 transition-colors leading-none tracking-tighter">{deck.name}</h2>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Capacidad</span>
                                        <span className="text-sm font-black text-blue-600">{getTotalCards(deck.cards)}/50</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 rounded-xl text-blue-600 border border-blue-600/10">
                                        <MessageSquare size={14}/> <span className="text-xs font-black">{deck.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE ÉPICO --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/98 flex items-end md:items-center justify-center animate-in fade-in duration-300" onClick={() => { setSelectedDeck(null); setShowMobileComments(false); }}>
                    <div className="bg-white dark:bg-[#0B1120] w-full max-w-[1500px] h-[98vh] md:h-[94vh] md:rounded-[3.5rem] rounded-t-[3.5rem] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-8 md:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 flex-shrink-0">
                            <div className="min-w-0 text-left">
                                <h2 className="text-3xl md:text-7xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none mb-4">{selectedDeck.name}</h2>
                                <div className="flex gap-4">
                                    <span className={`text-xs font-black px-5 py-2 rounded-full uppercase ${getFormatStyles(selectedDeck.format).badgeClass}`}>{getFormatStyles(selectedDeck.format).label}</span>
                                    <span className="text-xs font-black px-5 py-2 rounded-full uppercase bg-yellow-500 text-black flex items-center gap-2 shadow-lg shadow-yellow-500/20">
                                        <Swords size={16} /> {selectedDeck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button onClick={() => setShowMobileComments(!showMobileComments)} className="md:hidden flex-1 bg-blue-600/10 text-blue-500 p-5 rounded-[2rem] font-black text-xs uppercase border border-blue-500/20">
                                    Informes ({selectedDeck.comments?.length || 0})
                                </button>
                                <button onClick={(e) => handleEdit(selectedDeck, e)} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase shadow-2xl hover:bg-blue-500 active:scale-95 transition-all"><Edit3 size={20} /> Forjar</button>
                                <button onClick={() => setSelectedDeck(null)} className="p-5 bg-slate-800 rounded-[2rem] text-white hover:bg-red-500 transition-all"><X size={28} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* ✅ ÁREA DE CARTAS CON ZOOM REVELACIÓN */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-20 bg-black/40 custom-scrollbar" style={{ perspective: '1200px' }}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-12">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group text-center" onClick={() => setCardToZoom(c)}>
                                            <div className="card-reveal-zoom rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl">
                                                <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" loading="lazy" />
                                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-8 h-8 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-sm md:text-lg border-4 border-slate-900 shadow-2xl z-20">x{c.quantity || 1}</div>
                                            </div>
                                            <p className="mt-4 text-[9px] md:text-xs text-slate-500 font-black uppercase truncate italic group-hover:text-blue-400 transition-colors tracking-widest">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel Comunicaciones */}
                            <div className={`
                                flex-[0.7] md:max-w-[450px] bg-[#0A0C10] flex flex-col min-h-0 border-l border-white/5
                                fixed md:relative bottom-0 left-0 w-full md:w-auto h-[75vh] md:h-auto z-[120] md:z-0 transition-transform duration-500 ease-out transform
                                ${showMobileComments ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                            `}>
                                <div className="p-8 border-b border-white/5 font-black text-xs uppercase flex items-center justify-between text-blue-400 bg-white/5">
                                    <div className="flex items-center gap-3 tracking-[0.2em]"><MessageSquare size={22} /> Sala de Estrategia</div>
                                    <button onClick={() => setShowMobileComments(false)} className="md:hidden text-slate-400"><X size={28} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-left">
                                    {selectedDeck.comments?.map((com, idx) => (
                                        <div key={com._id || idx} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
                                            <p className="text-[11px] font-black text-blue-500 mb-2 uppercase italic tracking-tighter flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:animate-ping"></span>
                                                @{com.username}
                                            </p>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"{com.text}"</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-8 bg-slate-950 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <input type="text" placeholder="Emitir juicio..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-blue-500 text-white transition-all shadow-inner" />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-5 rounded-2xl text-white active:scale-90 shadow-2xl shadow-blue-900/40"><Send size={24} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-14 bg-[#06080F] border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                            <button onClick={(e) => togglePrivacy(selectedDeck, e)} className="md:flex hidden items-center justify-center gap-3 bg-white/5 p-5 rounded-[2rem] font-black text-xs uppercase border border-white/5 hover:bg-white/10 transition-all">
                                {selectedDeck.isPublic ? <Globe size={20} className="text-blue-400" /> : <Lock size={20} className="text-red-500" />} {selectedDeck.isPublic ? 'Modo Público' : 'Modo Privado'}
                            </button>
                            <button onClick={(e) => handleDownloadInfographic(selectedDeck, e)} className="flex items-center justify-center gap-3 bg-white text-black p-5 rounded-[2rem] font-black text-xs uppercase active:scale-95 transition-all shadow-2xl"><Camera size={22} /> Captura Ultra HD</button>
                            <button onClick={(e) => handleDownloadTextList(selectedDeck, e)} className="flex items-center justify-center gap-3 bg-white/5 p-5 rounded-[2rem] font-black text-xs uppercase border border-white/5 transition-all"><FileText size={22} /> Listado .txt</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(selectedDeck); }} className="flex items-center justify-center gap-3 bg-red-500/10 text-red-500 p-5 rounded-[2rem] font-black text-xs uppercase border border-red-500/20 active:scale-95 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={22} /> Purgar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ MODAL ZOOM INDIVIDUAL MEJORADO (FULL ARTE) */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-500" onClick={() => setCardToZoom(null)}>
                    <button className="absolute top-10 right-10 w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center text-3xl font-bold border border-white/10 active:scale-90" onClick={() => setCardToZoom(null)}>✕</button>
                    <div className="max-w-md w-full animate-pop flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <img src={getCardImage(cardToZoom)} className="w-full h-auto rounded-[3.5rem] shadow-[0_0_120px_rgba(37,99,235,0.5)] border-4 border-white/10 mb-10 transition-transform duration-700 hover:scale-105" alt="zoom" />
                        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl w-full text-left">
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">Identificación de Unidad</span>
                             <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">{cardToZoom.name}</h4>
                             <div className="h-1 w-20 bg-blue-600 rounded-full mb-4"></div>
                             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{cardToZoom.type} • {cardToZoom.race || 'Sin Raza'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Borrar Épico */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                    <div className="bg-[#0F172A] p-14 rounded-[4rem] max-w-sm w-full text-center border border-white/10 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                        <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse border border-red-500/30"><Trash2 size={48} /></div>
                        <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">¿Eliminar?</h3>
                        <p className="text-slate-500 text-xs font-bold mb-10 uppercase tracking-widest">Esta estrategia se perderá en el abismo.</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={confirmDelete} className="w-full bg-red-600 py-5 rounded-[2rem] text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-900/40 active:scale-95 transition-all">Destruir Arsenal</button>
                            <button onClick={() => setDeckToDelete(null)} className="w-full py-2 text-slate-500 font-black uppercase text-[10px] hover:text-white transition-all">Mantener estrategia</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-full font-black text-xs uppercase shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-pop border backdrop-blur-2xl ${toast.type === 'error' ? 'bg-red-600/90 text-white border-red-500' : 'bg-blue-600/90 text-white border-blue-500'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
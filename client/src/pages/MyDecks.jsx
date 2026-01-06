import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { Search, Trash2, Edit3, Globe, Lock, X, Camera, FileText, LayoutGrid, Bell, Heart, ArrowRight, MessageSquare, Send, Swords, Plus, ScrollText, Sword, Sparkles } from "lucide-react";

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
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  
  /* ✅ EFECTO ZOOM DE CARTAS DENTRO DEL DECK */
  .card-inner-zoom {
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    cursor: zoom-in;
  }
  .card-inner-zoom:hover {
    transform: scale(1.4) translateY(-20px) rotateY(10deg);
    z-index: 100;
    filter: brightness(1.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  }
  
  /* ✅ EFECTO DE CARTAS DE DECK EN EL GRID */
  .deck-glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s ease;
  }
  .deck-glass-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(37, 99, 235, 0.5);
    transform: translateY(-5px);
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

    if (loading) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center transition-colors"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#06080F] text-slate-900 dark:text-white pb-32 transition-colors duration-500 overflow-x-hidden font-sans text-center relative">
            <style>{animationStyles}</style>

            {/* --- HEADER MEJORADO --- */}
            <div className="bg-white/70 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                                <Sparkles className="text-blue-500" size={24} />
                                Mis <span className="text-blue-600">Estrategias</span>
                            </h1>
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] text-left">The Forge Database</p>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl transition-all relative border border-transparent hover:border-blue-500/50 group">
                                <Bell size={22} className={notifications.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-400 group-hover:text-blue-400"} />
                                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                            </button>
                            {showNotifications && (
                                <div className="fixed md:absolute top-24 md:top-14 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[92%] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 z-[100] animate-pop">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 text-left">Buzón de Guerra</h4>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? <p className="text-[10px] text-center text-slate-400 uppercase py-6 font-bold">Sin informes</p> : notifications.map((n, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-blue-500/30 cursor-pointer transition-all text-left" onClick={() => { setSelectedDeck(n.fullDeck); setShowNotifications(false); }}>
                                                <p className="text-[8px] font-black text-slate-400 uppercase truncate mb-1">Mazo: {n.deckName}</p>
                                                <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 italic">"@{n.username}: {n.text}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✅ BOTONES INTEGRADOS (CREAR DECK) */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/30 p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/5 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 px-2">
                            <Search size={16} className="absolute left-4 top-2.5 text-slate-400" />
                            <input type="text" placeholder="Filtrar arsenales..." className="bg-transparent text-xs font-bold pl-10 pr-3 py-2 w-full outline-none dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-1">
                            <Link to="/primer-bloque/builder" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full text-[9px] font-black uppercase italic transition-all shadow-lg active:scale-95">
                                <ScrollText size={14} /> PB
                            </Link>
                            <Link to="/imperio/builder" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-full text-[9px] font-black uppercase italic transition-all shadow-lg active:scale-95">
                                <Sword size={14} /> Imperio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID DE MAZOS MEJORADO --- */}
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group deck-glass-card rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm text-left">
                            <div className="h-44 md:h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                                <img src={getCardImage(deck.cards[0])} className="w-full h-full object-cover opacity-90 dark:opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#06080F] via-transparent to-transparent"></div>
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
                                    <button onClick={(e) => handleEdit(deck, e)} className="p-3 bg-white text-blue-600 rounded-full hover:scale-125 transition-transform shadow-xl"><Edit3 size={18}/></button>
                                    <button onClick={(e) => togglePrivacy(deck, e)} className="p-3 bg-slate-800 text-white rounded-full hover:scale-125 transition-transform shadow-xl">{deck.isPublic ? <Globe size={18}/> : <Lock size={18}/>}</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(deck); }} className="p-3 bg-red-600 text-white rounded-full hover:scale-125 transition-transform shadow-xl"><Trash2 size={18}/></button>
                                </div>
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase w-fit shadow-lg ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                                    <span className="text-[8px] font-black px-3 py-1 rounded-lg uppercase bg-white/10 text-white border border-white/20 backdrop-blur-xl w-fit flex items-center gap-1">
                                        <Swords size={10} /> {deck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h2 className="text-base md:text-lg font-black uppercase italic tracking-tighter truncate group-hover:text-blue-500 transition-colors">{deck.name}</h2>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Capacidad</span>
                                        <span className="text-xs font-black text-blue-600">{getTotalCards(deck.cards)}/50</span>
                                    </div>
                                    <div className="bg-blue-600/10 p-2 rounded-xl flex items-center gap-2 text-blue-500">
                                        <MessageSquare size={14}/> <span className="text-xs font-black">{deck.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE CON ZOOM INTEGRADO --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/98 flex items-end md:items-center justify-center animate-fade-in" onClick={() => { setSelectedDeck(null); setShowMobileComments(false); }}>
                    <div className="bg-white dark:bg-[#0B1120] w-full max-w-[1400px] h-[98vh] md:h-[92vh] md:rounded-[3rem] rounded-t-[3rem] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-shrink-0">
                            <div className="min-w-0">
                                <h2 className="text-2xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none mb-4">{selectedDeck.name}</h2>
                                <div className="flex gap-3">
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase ${getFormatStyles(selectedDeck.format).badgeClass}`}>{getFormatStyles(selectedDeck.format).label}</span>
                                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase bg-yellow-500 text-black flex items-center gap-2">
                                        <Swords size={14} /> {selectedDeck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button onClick={() => setShowMobileComments(!showMobileComments)} className="md:hidden flex-1 bg-white/5 p-4 rounded-3xl font-black text-[10px] uppercase border border-white/10">
                                    Mensajes ({selectedDeck.comments?.length || 0})
                                </button>
                                <button onClick={(e) => handleEdit(selectedDeck, e)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-blue-500 active:scale-95 transition-all"><Edit3 size={18} /> Editar</button>
                                <button onClick={() => setSelectedDeck(null)} className="p-4 bg-slate-800 rounded-3xl text-white hover:bg-red-500 transition-all"><X size={24} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* ✅ GRID CON ZOOM PROFESIONAL */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-14 bg-black/40 custom-scrollbar deck-card-container">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-10">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group text-center cursor-none" onClick={() => setCardToZoom(c)}>
                                            <div className="card-inner-zoom rounded-2xl overflow-hidden border-2 border-white/5 shadow-lg">
                                                <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" loading="lazy" />
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white w-7 h-7 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-xs md:text-sm border-2 border-white/20 shadow-2xl">x{c.quantity || 1}</div>
                                            </div>
                                            <p className="mt-3 text-[8px] md:text-[10px] text-slate-500 font-black uppercase truncate italic group-hover:text-blue-400 transition-colors">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Comentarios */}
                            <div className={`
                                flex-[0.7] md:max-w-[420px] bg-slate-900/50 flex flex-col min-h-0 border-l border-white/5
                                fixed md:relative bottom-0 left-0 w-full md:w-auto h-[70vh] md:h-auto z-[120] md:z-0 transition-transform duration-500 ease-out transform backdrop-blur-3xl
                                ${showMobileComments ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                            `}>
                                <div className="p-6 border-b border-white/5 font-black text-xs uppercase flex items-center justify-between text-blue-400 bg-white/5">
                                    <div className="flex items-center gap-2"><MessageSquare size={20} /> Salón de Estrategia</div>
                                    <button onClick={() => setShowMobileComments(false)} className="md:hidden text-slate-400"><X size={24} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-left">
                                    {selectedDeck.comments?.map((com, idx) => (
                                        <div key={com._id || idx} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all">
                                            <p className="text-[10px] font-black text-blue-500 mb-2 uppercase italic tracking-tighter">@{com.username} dice:</p>
                                            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">"{com.text}"</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-950/80 border-t border-white/5">
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="Inyectar comentario..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs outline-none focus:border-blue-500 text-white transition-all shadow-inner" />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-4 rounded-2xl text-white active:scale-90 shadow-xl shadow-blue-900/20"><Send size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 bg-slate-900/80 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
                            <button onClick={(e) => togglePrivacy(selectedDeck, e)} className="md:flex hidden items-center justify-center gap-2 bg-white/5 p-4 rounded-[1.5rem] font-black text-[10px] uppercase border border-white/5 hover:bg-white/10 transition-all">
                                {selectedDeck.isPublic ? <Globe size={18} className="text-blue-400" /> : <Lock size={18} className="text-red-500" />} {selectedDeck.isPublic ? 'Público' : 'Privado'}
                            </button>
                            <button onClick={(e) => handleDownloadInfographic(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-white text-black p-4 rounded-[1.5rem] font-black text-[10px] uppercase active:scale-95 transition-all shadow-xl"><Camera size={20} /> Captura HD</button>
                            <button onClick={(e) => handleDownloadTextList(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-white/5 p-4 rounded-[1.5rem] font-black text-[10px] uppercase border border-white/5 transition-all"><FileText size={20} /> Texto</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(selectedDeck); }} className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-[1.5rem] font-black text-[10px] uppercase border border-red-500/20 active:scale-95 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /> Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ZOOM INDIVIDUAL */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[300] bg-black/98 flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setCardToZoom(null)}>
                    <button className="absolute top-10 right-10 w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center text-2xl font-bold border border-white/10 active:scale-90" onClick={() => setCardToZoom(null)}>✕</button>
                    <div className="max-w-md w-full animate-pop" onClick={e => e.stopPropagation()}>
                        <img src={getCardImage(cardToZoom)} className="w-full h-auto rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.4)] border-4 border-white/10 mb-8" alt="zoom" />
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                             <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{cardToZoom.name}</h4>
                             <p className="text-blue-400 font-black uppercase text-xs tracking-[0.4em]">{cardToZoom.type}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Borrar */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-fade-in">
                    <div className="bg-slate-900 p-12 rounded-[3rem] max-w-sm w-full text-center border border-white/10 shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-pulse"><Trash2 size={40} /></div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">¿Purgar Arsenal?</h3>
                        <p className="text-slate-500 text-xs font-bold mb-8 uppercase">Esta acción es irreversible en la forja.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 py-4 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest hover:text-white transition-all">Abortar</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-red-900/40 active:scale-95 transition-all">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-2xl animate-pop border backdrop-blur-xl ${toast.type === 'error' ? 'bg-red-600/90 text-white border-red-500' : 'bg-blue-600/90 text-white border-blue-500'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
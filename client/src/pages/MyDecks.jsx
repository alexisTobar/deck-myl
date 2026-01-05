import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { Search, Trash2, Edit3, Globe, Lock, X, Camera, FileText, LayoutGrid, Bell, Heart, ArrowRight, MessageSquare, Send, Swords } from "lucide-react";

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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-white pb-32 transition-colors duration-500 overflow-x-hidden font-sans text-center">
            
            {/* --- HEADER --- */}
            <div className="bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">Mis <span className="text-blue-600">Estrategias</span></h1>
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl transition-all relative">
                                <Bell size={20} className={notifications.length > 0 ? "text-blue-600 animate-pulse" : "text-slate-400"} />
                                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                            </button>
                            {showNotifications && (
                                <div className="fixed md:absolute top-20 md:top-12 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[92%] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-[100] animate-in fade-in zoom-in-95">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 text-left">Comentarios</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? <p className="text-[10px] text-center text-slate-400 uppercase py-4">Sin novedades</p> : notifications.map((n, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border dark:border-white/5 cursor-pointer hover:border-blue-500 transition-all text-left" onClick={() => { setSelectedDeck(n.fullDeck); setShowNotifications(false); }}>
                                                <p className="text-[9px] font-black text-slate-400 uppercase truncate">Mazo: {n.deckName}</p>
                                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2">@{n.username}: {n.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto bg-slate-100 dark:bg-black/40 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="relative flex-1 md:w-64">
                            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                            <input type="text" placeholder="Buscar mazo..." className="bg-transparent text-[10px] font-bold pl-9 pr-3 py-2 w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID DE MAZOS --- */}
            <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {processedDecks.map((deck) => (
                        <div key={deck._id} onClick={() => setSelectedDeck(deck)} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col shadow-sm text-left">
                            <div className="h-36 md:h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={getCardImage(deck.cards[0])} className="w-full h-full object-cover opacity-80 dark:opacity-40 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent"></div>
                                
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 md:gap-3 backdrop-blur-sm">
                                    <button onClick={(e) => handleEdit(deck, e)} className="p-2 md:p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"><Edit3 size={16}/></button>
                                    <button onClick={(e) => togglePrivacy(deck, e)} className="p-2 md:p-3 bg-slate-800 text-white rounded-full hover:scale-110 transition-transform">{deck.isPublic ? <Globe size={16}/> : <Lock size={16}/>}</button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(deck); }} className="p-2 md:p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                                </div>
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                    <span className={`text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase w-fit ${getFormatStyles(deck.format).badgeClass}`}>{getFormatStyles(deck.format).label}</span>
                                    {/* ✅ RAZA EN GRID */}
                                    <span className="text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 backdrop-blur-md w-fit flex items-center gap-1">
                                        <Swords size={8} /> {deck.race || "Híbrido"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 md:p-6">
                                <h2 className="text-sm md:text-xl font-black uppercase italic truncate group-hover:text-blue-600 transition-colors leading-none">{deck.name}</h2>
                                <div className="flex justify-between items-center mt-3 md:mt-5">
                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{getTotalCards(deck.cards)} Cartas</span>
                                    <div className="flex items-center gap-1 text-blue-600"><MessageSquare size={10}/> <span className="text-[8px] md:text-[10px] font-black">{deck.comments?.length || 0}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE --- */}
            {selectedDeck && (
                <div className="fixed inset-0 z-[110] bg-slate-950/95 md:backdrop-blur-md flex items-end md:items-center justify-center transition-all" onClick={() => { setSelectedDeck(null); setShowMobileComments(false); }}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-[95vh] md:h-[90vh] rounded-t-[2.5rem] md:rounded-[3rem] border-x border-t md:border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        
                        {/* Cabecera Responsiva */}
                        <div className="p-5 md:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 relative text-left">
                            <div className="min-w-0">
                                <h2 className="text-xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none">{selectedDeck.name}</h2>
                                <div className="flex gap-2 mt-3">
                                    <span className={`text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase ${getFormatStyles(selectedDeck.format).badgeClass}`}>{getFormatStyles(selectedDeck.format).label}</span>
                                    {/* ✅ RAZA EN MODAL */}
                                    <span className="text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase bg-yellow-500 text-black flex items-center gap-2">
                                        <Swords size={12} /> {selectedDeck.race || "Híbrido"}
                                    </span>
                                    <span className="text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase bg-slate-100 dark:bg-white/10 text-slate-500">{getTotalCards(selectedDeck.cards)} Cartas</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                <button onClick={() => setShowMobileComments(!showMobileComments)} className="md:hidden flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 p-2.5 rounded-2xl font-black text-[9px] uppercase border border-blue-200">
                                    <MessageSquare size={16} /> {selectedDeck.comments?.length || 0} Mensajes
                                </button>
                                <button onClick={(e) => handleEdit(selectedDeck, e)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white p-2.5 md:p-3.5 rounded-2xl font-black text-[9px] md:text-[10px] uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all"><Edit3 size={16} /> Forjar</button>
                                <button onClick={() => setSelectedDeck(null)} className="p-2.5 md:p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                            </div>
                        </div>

                        {/* Área Principal */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative text-left">
                            <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-8">
                                    {selectedDeck.cards.map((c, i) => (
                                        <div key={i} className="relative group animate-in fade-in zoom-in-95 text-center">
                                            <div className="rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-sm transition-all group-hover:scale-105">
                                                <img src={getCardImage(c)} alt={c.name} className="w-full h-auto block" loading="lazy" />
                                                <div className="absolute top-1 right-1 bg-blue-600 text-white w-5 h-5 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-[9px] md:text-xs border-2 border-white dark:border-slate-900">x{c.quantity || 1}</div>
                                            </div>
                                            <p className="mt-1.5 text-[7px] md:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase truncate italic">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`
                                flex-[0.6] md:max-w-[380px] bg-white dark:bg-slate-800/20 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 
                                fixed md:relative bottom-0 left-0 w-full md:w-auto h-[60vh] md:h-auto z-[120] md:z-0 transition-transform duration-300 transform
                                ${showMobileComments ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                            `}>
                                <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 font-black text-[10px] uppercase flex items-center justify-between text-blue-600 bg-slate-50 dark:bg-slate-900/30">
                                    <div className="flex items-center gap-2"><MessageSquare size={16} /> Conversación</div>
                                    <button onClick={() => setShowMobileComments(false)} className="md:hidden text-slate-400"><X size={18} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar text-left">
                                    {selectedDeck.comments?.map((com, idx) => (
                                        <div key={com._id || idx} className="bg-slate-50 dark:bg-black/30 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                            <p className="text-[9px] font-black text-blue-600 mb-1 uppercase">@{com.username}</p>
                                            <p className="text-[11px] md:text-xs text-slate-600 dark:text-slate-300 font-medium">{com.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5">
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Responder..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-[11px] outline-none focus:border-blue-500 dark:text-white transition-all" />
                                        <button onClick={handleAddComment} className="bg-blue-600 p-2.5 rounded-xl text-white active:scale-95 shadow-lg"><Send size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-2 flex-shrink-0">
                            <button onClick={(e) => togglePrivacy(selectedDeck, e)} className="md:flex hidden items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl font-black text-[9px] uppercase border dark:border-white/5 transition-colors">
                                {selectedDeck.isPublic ? <Globe size={16} className="text-blue-600" /> : <Lock size={16} className="text-red-500" />} {selectedDeck.isPublic ? 'Público' : 'Privado'}
                            </button>
                            <button onClick={(e) => handleDownloadInfographic(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-3 md:p-4 rounded-2xl font-black text-[9px] uppercase active:scale-95 transition-all"><Camera size={18} /> Exportar Foto</button>
                            <button onClick={(e) => handleDownloadTextList(selectedDeck, e)} className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 md:p-4 rounded-2xl font-black text-[9px] uppercase border dark:border-white/5 transition-all"><FileText size={18} /> Lista Texto</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeckToDelete(selectedDeck); }} className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 p-3 md:p-4 rounded-2xl font-black text-[9px] uppercase border border-red-500/20 active:scale-95 transition-all"><Trash2 size={18} /> Borrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Borrar */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] max-w-sm w-full text-center border border-slate-200 dark:border-white/10 shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                        <h3 className="text-xl font-black mb-6 uppercase">¿Confirmar eliminación?</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setDeckToDelete(null)} className="flex-1 py-3 rounded-2xl text-slate-500 font-black uppercase text-[10px]">No</button>
                            <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-2xl text-white font-black uppercase text-[10px]">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase shadow-2xl animate-fade-in-up border ${toast.type === 'error' ? 'bg-red-600 text-white border-red-500' : 'bg-blue-600 text-white border-blue-500'}`}>
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
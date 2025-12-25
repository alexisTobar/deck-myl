import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, Users, Star, Layers } from "lucide-react";

// ✅ Las 4 ediciones base solicitadas
const EDICIONES_BASE = { 
    "espada_sagrada_aniversario": "Espada Sagrada", 
    "helenica_aniversario": "Helénica", 
    "aniversario-de-ra": "Dominios de Ra", 
    "hijos-de-daana-aniversario": "Hijos de Daana" 
};

const EDICIONES_PB_EXTENDIDO = { "shogun_4": "Shogun 4","colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: "👤", color: "border-yellow-600 text-yellow-500" },
    { id: "Talismán", label: "Talismán", icon: "📜", color: "border-blue-400 text-blue-300" },
    { id: "Arma", icon: "⚔️", label: "Arma", color: "border-red-600 text-red-500" },
    { id: "Tótem", icon: "🗿", label: "Tótem", color: "border-emerald-600 text-emerald-500" },
    { id: "Oro", icon: "💰", label: "Oro", color: "border-amber-400 text-amber-300" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const formato = "primer_bloque";
    const [viewMode, setViewMode] = useState("main"); // ✅ main o all
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("espada_sagrada_aniversario");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [razaSeleccionada, setRazaSeleccionada] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location]);

    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda && !razaSeleccionada && !tipoSeleccionado) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (razaSeleccionada) params.append("race", razaSeleccionada);
                
                if (viewMode === "main") params.append("isMainEdition", "true");

                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada, viewMode]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else { setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]); }
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            const res = await fetch(url, { 
                method, headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
        } catch (e) { alert("Error al guardar"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, backgroundColor: '#0c0e14' });
            const link = document.createElement('a'); link.download = `${nombreMazo || "Mazo_PB"}.png`; link.href = dataUrl; link.click();
        } catch (err) { alert('Error captura'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold transition-all hover:bg-yellow-500/10 transition-all">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest leading-none italic">Forja Primer Bloque</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-3">
                    {/* ✅ SELECTOR DE MODO DE VISTA (Principales vs Todas) */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        <button onClick={() => { setViewMode("main"); setEdicionSeleccionada("espada_sagrada_aniversario"); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'main' ? 'bg-yellow-600 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Star size={12} fill={viewMode === 'main' ? "currentColor" : "none"} /> Ediciones Principales</button>
                        <button onClick={() => { setViewMode("all"); setEdicionSeleccionada("shogun_4"); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'all' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Layers size={12} /> Todas las Ediciones</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-yellow-500 font-bold" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-yellow-500">
                            {Object.entries(viewMode === "main" ? EDICIONES_BASE : EDICIONES_PB_EXTENDIDO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                        </select>
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-950 border border-yellow-500/30 p-2 rounded-xl text-[13px] font-bold text-yellow-400">
                            <option value="">Todas las Razas</option>
                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 text-yellow-500 font-bold animate-pulse text-xl uppercase tracking-tighter">Invocando leyendas...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_#eab308]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform group-hover:scale-105" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-yellow-600 hover:text-black transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN MI DECK (LADO DERECHO MAGNÍFICO) */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0c0e14] to-black shadow-2xl">
                <div className="p-5 border-b border-yellow-500/30 bg-slate-900/50 backdrop-blur-md font-black text-yellow-500 uppercase tracking-widest flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2">
                        <Layout size={18} className="text-yellow-500" />
                        <span className="italic">Grimorio PB</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all duration-500 border ${totalCartas === 50 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                        {totalCartas} / 50
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-yellow-600/50 to-transparent"></div>
                                <h3 className="text-yellow-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3>
                            </div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 group hover:bg-yellow-600/10 hover:border-yellow-500/30 transition-all duration-300 shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 group-hover:text-white transition-colors cursor-pointer uppercase text-[12px] tracking-tight">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-xl transition-all border border-yellow-500/20 shadow-lg active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Eye size={16} /> Ver Galería Visual</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Save size={16} /> Guardar Mazo
                    </button>
                </div>
            </div>

            {/* DOCK MÓVIL REPARADO */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Deck Total</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700">LISTA</button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">VER</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center"><Save size={16} /></button>
                </div>
            </div>

            {/* MODAL GUARDAR PB CORREGIDO */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-yellow-500 tracking-tighter italic text-center">Sellar Mazo PB</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-600 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-yellow-600" />
                            <span className="text-sm font-bold text-slate-300 italic">Publicar en la Arena Global <Globe size={14} className="inline ml-1 text-yellow-500" /></span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-4 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-2"><Save size={16} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-slate-900 rounded-t-3xl h-[70vh] p-5 overflow-auto border-t border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-yellow-500 italic">Mi Lista ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4">
                                <h4 className="text-yellow-600 text-[10px] font-black uppercase mb-2 border-b border-slate-800 pb-1">{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2.5 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img src={getImg(c)} className="w-10 h-12 rounded shadow-md object-cover" alt={c.name} />
                                            <span className="text-sm font-medium">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-950 p-1.5 px-4 rounded-full border border-slate-800">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-black text-xl active:scale-90 transition-transform"><Minus size={18} /></button>
                                            <span className="font-black text-sm w-4 text-center">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="text-green-500 disabled:opacity-30"><Plus size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] border-4 border-yellow-500/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={24} strokeWidth={3} /></button>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-black text-white leading-none">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">En Mazo</span>
                            </div>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {modalMazoOpen && (
                <div className="fixed inset-0 bg-[#0c0e14] z-[100] flex flex-col transition-all">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-slate-800 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-yellow-500 italic tracking-widest leading-none flex items-center gap-2"><Layout size={20} /> Galería PB</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-white hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={galleryRef}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pb-20 p-4 bg-[#0c0e14]">
                            {mazo.map(c => (
                                <div key={c.slug} className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setCardToZoom(c)}>
                                    <img src={getImg(c)} className="w-full h-auto rounded-lg shadow-lg border border-white/5" alt={c.name} />
                                    <div className="absolute bottom-0 right-0 bg-yellow-600 text-black px-2.5 py-0.5 font-black text-[10px] rounded-tl-lg shadow-2xl border-t border-l border-slate-900">x{c.cantidad}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-900 flex flex-col sm:flex-row gap-4 justify-center border-t border-slate-800 shadow-inner">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 px-8 py-3 rounded-2xl font-black text-white shadow-xl hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase text-xs italic tracking-widest">
                             <Camera size={18} /> {guardando ? 'Forjando...' : 'Descargar Imagen'}
                        </button>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-700 px-8 py-3 rounded-2xl font-black text-white hover:bg-slate-600 transition-all uppercase text-xs italic tracking-widest">Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
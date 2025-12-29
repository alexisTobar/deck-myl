import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, ShieldCheck, Users, Shield } from "lucide-react";

const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "25_Aniversario_Imp": "25 aniversario", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const TIPOS_IMPERIO = [
    { id: 1, label: "Aliado", icon: "👤", color: "border-blue-500 text-blue-400" },
    { id: 2, label: "Talismán", icon: "✨", color: "border-purple-500 text-purple-400" },
    { id: 3, label: "Arma", icon: "⚔️", color: "border-red-500 text-red-400" },
    { id: 4, label: "Tótem", icon: "🗿", color: "border-green-500 text-green-400" },
    { id: 5, label: "Oro", icon: "💰", color: "border-yellow-500 text-yellow-400" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const [formato] = useState("imperio");
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("kvsm_titanes");
    const [tipoSeleccionado, setTipoSeleccionado] = useState(""); 
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

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        const curve = new Array(7).fill(0);
        mazo.forEach(c => {
            if (counts[c.type] !== undefined) counts[c.type] += c.cantidad;
            const cost = Math.min(c.cost || 0, 6);
            curve[cost] += c.cantidad;
        });
        return { counts, curve };
    }, [mazo]);

    // ✅ RESTAURADO: Lógica de carga para edición de mazos
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ 
                ...c, 
                cantidad: c.quantity || 1, 
                imgUrl: getImg(c) 
            })));
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCartas = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, formato]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, pixelRatio: 2, skipFonts: true });
            const link = document.createElement('a');
            link.download = `WarningDeck_Imperio_${nombreMazo || "Mazo"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { alert('Error exportación'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            await fetch(url, { 
                method, headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest italic">Imperio Workshop</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-orange-400">{Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {TIPOS_IMPERIO.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-[10px] uppercase font-black ${tipoSeleccionado === tipo.id ? `${tipo.color} bg-slate-800 shadow-lg` : 'border-slate-800 text-slate-500'}`}>
                                {tipo.icon} {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold">Buscando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_#f97316]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform group-hover:scale-105" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-orange-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black shadow-2xl">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18} className="text-orange-400" /><span className="italic">Mi Deck</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs border border-slate-700 ${totalCartas === 50 ? 'text-green-400 border-green-500' : 'text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-orange-400 text-[11px] font-black uppercase mb-3 border-b border-orange-600/20 italic">{t}</h3>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-orange-600/10 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 group-hover:text-white uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-500 rounded-xl active:scale-90"><Plus size={16}/></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-xl active:scale-90"><Minus size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 border border-white/5"><Eye size={16} /> Ver Galería Visual</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3"><span className="text-[10px] text-slate-500 font-bold uppercase">Total</span><span className="text-lg font-black">{totalCartas}/50</span></div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700 uppercase">Lista</button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg"><Save size={16} /></button>
                </div>
            </div>

            {/* ✅ MODAL EXPORTACIÓN HD (MODERNO IMPERIO) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-[#0f0a07] z-[120] flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-orange-500 flex items-center gap-2"><Layout size={20} /> Exportar Estrategia Imperio</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-auto bg-[#0f0a07] p-4 md:p-10 flex justify-center items-start">
                        <div ref={galleryRef} className="relative min-w-[1200px] w-[1200px] flex flex-col bg-[#0f0a07] p-10 border border-orange-500/10 shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-end mb-8 border-b-2 border-orange-500/20 pb-4 relative z-10">
                                <div>
                                    <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px]">Invocación Workshop</span>
                                    <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none mt-1">{nombreMazo || "Estrategia Imperio"}</h1>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white tracking-tighter">{totalCartas} <span className="text-orange-500 text-xl italic">CARTAS</span></div>
                                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">WarningDeck.cl</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-8 gap-4 mb-10 relative z-10">
                                {mazo.map(c => (
                                    <div key={c.slug} className="relative group shadow-2xl">
                                        <img src={getImg(c)} className="w-full rounded-md border border-white/5" alt={c.name} />
                                        <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border border-black shadow-xl">x{c.cantidad}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-4 gap-6 mt-auto relative z-10">
                                <div className="col-span-1 bg-black/40 p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-end justify-between h-20 gap-1.5">
                                        {statsForExport.curve.map((v, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center">
                                                <div className="w-full bg-orange-600 rounded-t-md shadow-[0_0_15px_#f9731644]" style={{ height: `${(v / 15) * 100}%`, minHeight: '4px' }}></div>
                                                <span className="text-[9px] font-bold mt-2 text-slate-500">{i === 6 ? '6+' : i}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <h4 className="text-center font-black uppercase text-[8px] mt-4 text-orange-500 tracking-[0.2em]">Curva de Batalla</h4>
                                </div>
                                <div className="col-span-3 grid grid-cols-5 gap-3">
                                    {TIPOS_IMPERIO.map(t => (
                                        <div key={t.id} className="flex flex-col items-center justify-center bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner">
                                            <span className="text-2xl mb-1">{t.icon}</span>
                                            <span className="text-3xl font-black text-white">{statsForExport.counts[t.label] || 0}</span>
                                            <span className="text-[7px] uppercase font-black text-slate-500 mt-1">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-orange-500"><Shield size={650} /></div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center gap-4">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-orange-600 hover:bg-orange-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 uppercase text-sm active:scale-95 transition-all">
                             <Camera size={20} /> {guardando ? 'Generando...' : 'Descargar Infografía HD'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
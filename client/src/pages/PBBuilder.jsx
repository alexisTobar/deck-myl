import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, ShieldCheck, Users, Star, Layers, Shield } from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-800" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-800" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-800" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-yellow-800" }
];

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: <Users size={14} />, color: "border-yellow-600 text-yellow-500" },
    { id: "Talismán", label: "Talismán", icon: <Shield size={14} />, color: "border-blue-400 text-blue-300" },
    { id: "Arma", icon: <Layout size={14} />, label: "Arma", color: "border-red-600 text-red-500" },
    { id: "Tótem", icon: <Layout size={14} />, label: "Tótem", color: "border-emerald-600 text-emerald-500" },
    { id: "Oro", icon: <Globe size={14} />, label: "Oro", color: "border-amber-400 text-amber-300" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const formato = "primer_bloque";
    const [mainEditionSelected, setMainEditionSelected] = useState(location.state?.initialEdition || "espada_sagrada"); 
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

    // ✅ Lógica nueva agregada para procesar datos de la imagen sin tocar lo anterior
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

    useEffect(() => {
        if (location.state?.initialEdition) setMainEditionSelected(location.state.initialEdition);
    }, [location.state]);

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
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", mainEditionSelected);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (razaSeleccionada) params.append("race", razaSeleccionada);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, mainEditionSelected, tipoSeleccionado, razaSeleccionada]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
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
            await fetch(url, { 
                method, headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            // ✅ Modificado para que siempre exporte a 1200px aunque estés en móvil
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, pixelRatio: 2, skipFonts: true });
            const link = document.createElement('a');
            link.download = `PB_${nombreMazo || "Deck"}.png`;
            link.href = dataUrl;
            link.click();
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
            {/* ... (Sección izquierda y derecha intactas) ... */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold hover:bg-yellow-500/10 transition-all">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Primer Bloque</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {MAIN_EDITIONS.map(ed => (
                            <button key={ed.id} onClick={() => { setMainEditionSelected(ed.id); setBusqueda(""); }}
                                className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 shadow-lg ${mainEditionSelected === ed.id ? `bg-gradient-to-r ${ed.color} border-white text-white scale-105` : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'}`}>
                                {ed.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Búsqueda Global PB..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-yellow-500 font-bold" />
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-950 border border-yellow-500/30 p-2 rounded-xl text-[11px] font-black text-yellow-400"><option value="">Todas las Razas</option>{RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 text-yellow-500 font-bold animate-pulse text-xl uppercase tracking-tighter">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_#eab308]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform group-hover:scale-105" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-yellow-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0c0e14] to-black shadow-2xl">
                <div className="p-5 border-b border-yellow-500/30 bg-slate-900/50 backdrop-blur-md font-black text-yellow-500 uppercase flex justify-between items-center">
                    <div className="flex items-center gap-2"><Layout size={18}/><span className="italic">Grimorio PB</span></div>
                    <div className="px-3 py-1 rounded-full text-xs border border-slate-700">{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-yellow-500 text-[11px] font-black uppercase tracking-tighter italic border-b border-yellow-600/20 mb-3">{t}</h3>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-yellow-600/10 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 group-hover:text-white uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-xl"><Plus size={16}/></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-xl"><Minus size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Eye size={16} /> Ver Galería Visual</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL (Mismo código) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3"><span className="text-[10px] text-slate-500 font-bold">TOTAL</span><span className="text-lg font-black">{totalCartas}/50</span></div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700 uppercase">Lista</button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-xs"><Save size={16} /></button>
                </div>
            </div>

            {/* ✅ MODAL GALERÍA VISUAL (DISEÑO ELMETA UNIFICADO PARA WEB/MÓVIL) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-yellow-500/20">
                        <h2 className="text-lg font-black uppercase text-yellow-500 italic">Infografía Primer Bloque HD</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-auto bg-zinc-950 p-4 md:p-10 flex justify-center items-start">
                        {/* ✅ ÁREA DE CAPTURA - 1200px FIJOS PARA CALIDAD DE WEB */}
                        <div ref={galleryRef} className="relative min-w-[1200px] w-[1200px] aspect-video flex overflow-hidden shadow-2xl"
                            style={{ background: 'linear-gradient(90deg, #2d1b2d 38%, #fdf6e3 38%)' }}>
                            
                            <div className="w-[38%] p-8 flex flex-wrap gap-2 content-start relative z-10">
                                {mazo.map(c => (
                                    <div key={c.slug} className="relative w-[18%]">
                                        <img src={getImg(c)} className="w-full rounded shadow-lg border border-white/5" alt={c.name} />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-[10px] font-black px-1.5 rounded-sm border border-slate-900 shadow-md">x{c.cantidad}</div>
                                    </div>
                                ))}
                                <div className="absolute bottom-10 left-[10%] opacity-[0.05] pointer-events-none text-white"><Star size={300} /></div>
                            </div>

                            <div className="w-[62%] p-12 flex flex-col justify-between text-slate-900 relative z-10">
                                <div className="flex justify-between items-start">
                                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-[#2d1b2d] leading-none">{nombreMazo || "Mazo Ancestral"}</h1>
                                    <span className="text-xs font-black uppercase tracking-widest text-[#2d1b2d]/40 italic">WarningDeck.cl</span>
                                </div>
                                <div className="flex items-end gap-12">
                                    <div className="w-64">
                                        <h4 className="font-black uppercase text-[10px] mb-4 text-[#2d1b2d]/60">Curva de Oro</h4>
                                        <div className="flex items-end justify-between h-24 gap-1.5 border-b border-[#2d1b2d]/10 pb-1">
                                            {statsForExport.curve.map((v, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center">
                                                    <div className="w-full bg-[#2d1b2d] rounded-t-sm transition-all" style={{ height: `${(v / 15) * 100}%`, minHeight: '2px' }}></div>
                                                    <span className="text-[9px] font-black mt-1">{i === 6 ? '6+' : i}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {TIPOS_PB.map(t => (
                                            <div key={t.id} className="flex flex-col items-center bg-[#2d1b2d] text-white p-4 rounded-2xl min-w-[75px] shadow-lg">
                                                <span className="text-2xl font-black">{statsForExport.counts[t.id] || 0}</span>
                                                <span className="text-[8px] uppercase font-black opacity-60 tracking-tighter">{t.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t border-[#2d1b2d]/10 pt-6 flex justify-between items-center uppercase font-black">
                                    <div className="bg-[#2d1b2d] text-[#fdf6e3] px-4 py-1 rounded-lg text-xl italic uppercase tracking-tighter">Total: {totalCartas} Cartas</div>
                                    <div className="text-xs text-[#2d1b2d]/60 tracking-widest italic">Era de Primer Bloque</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-yellow-600 hover:bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 uppercase text-sm">
                             <Camera size={20} /> {guardando ? 'Generando Imagen...' : 'Descargar para Web y Móvil'}
                        </button>
                    </div>
                </div>
            )}
            
            {/* ... (Modales Zoom, Guardar y Lista Móvil igual) ... */}
        </div>
    );
}
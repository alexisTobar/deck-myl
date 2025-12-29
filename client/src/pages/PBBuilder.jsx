import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Star, Layers, Shield 
} from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-800" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-800" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-800" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-yellow-800" }
];

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: <Users size={14} /> },
    { id: "Talismán", label: "Talismán", icon: <ShieldCheck size={14} /> },
    { id: "Arma", label: "Arma", icon: <Layout size={14} /> },
    { id: "Tótem", label: "Tótem", icon: <Layout size={14} /> },
    { id: "Oro", label: "Oro", icon: <Globe size={14} /> }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
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

    // ✅ Lógica de Carga de Cartas (RESTAURADA)
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

    // ✅ Cargar mazo para editar (RESTAURADA)
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location.state]);

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
            const dataUrl = await toPng(galleryRef.current, { 
                quality: 1.0, 
                pixelRatio: 2, 
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `WarningDeck_PB_${nombreMazo || "Deck"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { 
            console.error(err);
            alert('Error al generar imagen en este dispositivo'); 
        } finally { setGuardando(false); }
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
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            {/* LADO IZQUIERDO: BUILDER */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest italic flex items-center gap-2"><Star size={14}/> Forja PB</h2>
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
                        <input type="text" placeholder="Búsqueda..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-yellow-500 font-bold" />
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-950 border border-yellow-500/30 p-2 rounded-xl text-[11px] font-black text-yellow-400"><option value="">Razas...</option>{RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4">
                    {loading ? <div className="text-center mt-20 animate-pulse text-yellow-500 font-bold">Cargando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => (
                                <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                    <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${mazo.find(x => x.slug === c.slug) ? 'border-yellow-500 shadow-[0_0_10px_#eab308]' : 'border-slate-800'}`}>
                                        <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 text-white w-7 h-7 rounded-lg flex items-center justify-center"><Search size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* BARRA LATERAL DERECHA (DESKTOP) */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-slate-950">
                <div className="p-5 border-b border-yellow-500/30 font-black text-yellow-500 uppercase flex justify-between">
                    <span>Grimorio PB</span>
                    <span>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-yellow-500 text-[11px] font-black uppercase mb-2 italic border-b border-white/5">{t}</h3>
                            {mazoAgrupado[t].map(c => (
                                <div key={c.slug} className="flex justify-between py-1 items-center">
                                    <span className="text-xs truncate max-w-[140px] font-bold">{c.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleRemove(c.slug)} className="text-red-500"><Minus size={14}/></button>
                                        <span className="text-white font-black">x{c.cantidad}</span>
                                        <button onClick={() => handleAdd(c)} className="text-green-500"><Plus size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="p-5 flex flex-col gap-2 border-t border-white/5 bg-slate-900">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase italic tracking-widest border border-white/10 active:scale-95 transition-all">Ver Galería</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-yellow-600 text-black py-3 rounded-xl font-black text-xs uppercase italic tracking-widest active:scale-95 transition-all">Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3"><span className="text-[10px] text-slate-500 font-bold uppercase">Total</span><span className="text-lg font-black">{totalCartas}/50</span></div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-xs shadow-lg"><Save size={16} /></button>
                </div>
            </div>

            {/* ✅ MODAL GALERÍA VISUAL (MEJORADO PARA MÓVIL) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-yellow-500/20">
                        <h2 className="text-lg font-black uppercase text-yellow-500 italic flex items-center gap-2"><Layout size={20} /> Vista de Mazo</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#0c0e14] p-4 pb-24 md:p-10">
                        {/* VISTA PREVIA PARA EL USUARIO (SCROLL HACIA ABAJO) */}
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="text-center border-b border-yellow-500/20 pb-4">
                                <h1 className="text-3xl font-black uppercase text-white italic leading-none">{nombreMazo || "Estrategia PB"}</h1>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {mazo.map(c => (
                                    <div key={c.slug} className="relative group shadow-2xl">
                                        <img src={getImg(c)} className="w-full rounded-md border border-white/5" alt={c.name} />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-sm shadow-xl">x{c.cantidad}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ✅ ÁREA DE CAPTURA HD (FUERA DE PANTALLA PARA QUE LIBRERIA LA VEA PERO NO MOLESTE AL USUARIO) */}
                        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                            <div ref={galleryRef} className="relative w-[1200px] flex flex-col bg-[#0c0e14] p-10 border border-yellow-500/10 shadow-2xl overflow-hidden">
                                <div className="flex justify-between items-end mb-8 border-b-2 border-yellow-500/20 pb-4 text-white">
                                    <div>
                                        <span className="text-yellow-500 font-black tracking-[0.3em] uppercase text-[10px]">Estrategia Primer Bloque</span>
                                        <h1 className="text-6xl font-black uppercase italic tracking-tighter mt-1 leading-none">{nombreMazo || "Mazo Ancestral"}</h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black leading-none">{totalCartas} <span className="text-yellow-500 text-xl italic">CARTAS</span></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WarningDeck.cl</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-8 gap-4 mb-10">
                                    {mazo.map(c => (
                                        <div key={c.slug} className="relative">
                                            <img src={getImg(c)} className="w-full rounded shadow-xl border border-white/5" alt={c.name} />
                                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[11px] font-black px-2 py-0.5 rounded-sm border border-black">x{c.cantidad}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-10 mt-auto bg-slate-900/50 p-8 rounded-3xl border border-white/5">
                                    <div className="col-span-1">
                                        <div className="flex items-end justify-between h-20 gap-2">
                                            {statsForExport.curve.map((v, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center">
                                                    <div className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-md" style={{ height: `${(v / 15) * 100}%`, minHeight: '4px' }}></div>
                                                    <span className="text-[9px] font-black mt-2 text-slate-500">{i === 6 ? '6+' : i}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2 grid grid-cols-5 gap-3">
                                        {TIPOS_PB.map(t => (
                                            <div key={t.id} className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-2xl border border-yellow-500/10">
                                                <span className="text-yellow-500 mb-1">{t.icon}</span>
                                                <span className="text-3xl font-black text-white">{statsForExport.counts[t.id] || 0}</span>
                                                <span className="text-[7px] uppercase font-black text-slate-500 mt-1">{t.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none text-yellow-500"><Shield size={650} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 uppercase text-sm">
                             <Camera size={20} /> {guardando ? 'Generando...' : 'Descargar Imagen HD'}
                        </button>
                    </div>
                </div>
            )}
            {/* Modales Guardar y Zoom (Iguales) */}
        </div>
    );
}
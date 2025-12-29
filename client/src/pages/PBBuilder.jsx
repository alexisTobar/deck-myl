import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// ✅ Esta es la librería que instalas con el comando de arriba
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
        mazo.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += c.cantidad; });
        return { counts };
    }, [mazo]);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location.state]);

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
        else { setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]); }
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        
        // ✅ SOLUCIÓN PARA MÓVIL: Forzar al navegador a cargar las imágenes antes de capturar
        try {
            const dataUrl = await toPng(galleryRef.current, { 
                quality: 1.0, 
                pixelRatio: 2, 
                cacheBust: true, // Evita que use imágenes viejas sin cargar
            });
            const link = document.createElement('a');
            link.download = `WD_PB_${nombreMazo || "Deck"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            alert('Error al generar la imagen. Intenta cerrar y abrir el modal.');
        } finally {
            setGuardando(false);
        }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            {/* ... BUSCADOR IZQUIERDA ... */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold hover:bg-yellow-500/10">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Primer Bloque</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {MAIN_EDITIONS.map(ed => (
                            <button key={ed.id} onClick={() => { setMainEditionSelected(ed.id); setBusqueda(""); }}
                                className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 shadow-lg ${mainEditionSelected === ed.id ? `bg-gradient-to-r ${ed.color} border-white scale-105 shadow-yellow-500/20` : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'}`}>
                                {ed.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {cartas.map(c => {
                            const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                            return (
                                <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                    <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_#eab308]' : 'border-slate-800'}`}>
                                        <img src={getImg(c)} className="w-full h-auto transition-transform group-hover:scale-105" alt={c.name} />
                                        {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-xl border-2 border-white shadow-xl">{cant}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ... SIDEBAR DERECHO ... */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-slate-950">
                <div className="p-5 border-b border-yellow-500/30 font-black text-yellow-500 uppercase flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18}/><span>Grimorio PB</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all duration-500 border ${totalCartas === 50 ? 'text-green-500 border-green-500' : 'text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="p-5 bg-slate-900/80 border-t border-white/5 flex flex-col gap-3">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase transition-all active:scale-95 flex items-center justify-center gap-2"><Eye size={16} /> Ver Galería Visual</button>
                </div>
            </div>

            {/* ... MODAL GALERÍA HD ... */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in text-white">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-yellow-500 italic flex items-center gap-2 tracking-tighter"><Layout size={20} /> Galería PB</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-10 bg-[#0c0e14] flex flex-col items-center">
                        {/* VISTA PREVIA MÓVIL */}
                        <div className="w-full max-w-4xl space-y-6 md:hidden">
                            <h1 className="text-3xl font-black uppercase text-center text-white italic">{nombreMazo || "Deck PB"}</h1>
                            <div className="grid grid-cols-3 gap-2">
                                {mazo.map(c => (
                                    <div key={c.slug} className="relative group shadow-2xl">
                                        <img src={getImg(c)} className="w-full rounded-md border border-white/5 shadow-xl" alt={c.name} />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-[9px] font-black px-1.5 rounded-full shadow-xl">x{c.cantidad}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ✅ ÁREA DE CAPTURA HD (OCULTA FUERA DE PANTALLA) */}
                        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
                            <div ref={galleryRef} className="relative w-[1200px] flex flex-col bg-[#0c0e14] p-10 border-4 border-yellow-600 shadow-2xl overflow-hidden rounded-sm">
                                <div className="flex justify-between items-end mb-8 border-b-2 border-yellow-500/20 pb-4 relative z-10 text-white font-black italic">
                                    <div>
                                        <span className="text-yellow-500 font-black tracking-[0.4em] uppercase text-[10px] not-italic">Workshop Primer Bloque</span>
                                        <h1 className="text-6xl uppercase tracking-tighter mt-1 leading-none">{nombreMazo || "Estrategia Ancestral"}</h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl leading-none">{totalCartas} <span className="text-yellow-500 text-xl font-black">CARTAS</span></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest not-italic">WarningDeck.cl</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-8 gap-4 mb-10 relative z-10">
                                    {mazo.map(c => (
                                        <div key={c.slug} className="relative group shadow-2xl">
                                            {/* ✅ ATRIBUTO crossOrigin="anonymous" CLAVE PARA MÓVIL */}
                                            <img src={getImg(c)} crossOrigin="anonymous" className="w-full rounded-md border border-white/5 shadow-xl" alt={c.name} />
                                            <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-[11px] font-black px-2 py-0.5 rounded-full border border-black shadow-xl">x{c.cantidad}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-5 gap-3 relative z-10 text-center font-black">
                                    {TIPOS_PB.map(t => (
                                        <div key={t.id} className="bg-slate-900 p-6 rounded-3xl border border-yellow-600/20 shadow-inner">
                                            <span className="text-4xl font-black text-white leading-none mb-1">{statsForExport.counts[t.label] || 0}</span>
                                            <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* SELLO DE AGUA PERSONALIZADO */}
                                <img src="https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png" 
                                     crossOrigin="anonymous"
                                     className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.05] w-[600px] pointer-events-none" alt="" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-all">
                             <Camera size={20} /> {guardando ? 'SINCRONIZANDO...' : 'Descargar Infografía HD'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
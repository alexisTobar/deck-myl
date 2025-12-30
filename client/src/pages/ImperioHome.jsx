import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Star, Layers, Shield 
} from "lucide-react";

// Ediciones de Imperio
const EDICIONES_IMPERIO = [
    { id: "kvsm_titanes", label: "KVSM Titanes", color: "from-orange-600 to-red-800" },
    { id: "25_Aniversario_Imp", label: "25 Aniversario", color: "from-yellow-600 to-orange-800" },
    { id: "libertadores", label: "Libertadores", color: "from-blue-600 to-slate-800" },
    { id: "onyria", label: "Onyria", color: "from-purple-600 to-indigo-900" }
];

const TIPOS_IMPERIO = [
    { id: "Aliado", label: "Aliado", icon: <Users size={14} />, color: "border-orange-600 text-orange-500" },
    { id: "Talismán", label: "Talismán", icon: <Shield size={14} />, color: "border-blue-400 text-blue-300" },
    { id: "Arma", icon: <Sword size={14} />, label: "Arma", color: "border-red-600 text-red-500" },
    { id: "Tótem", icon: <Layout size={14} />, label: "Tótem", color: "border-emerald-600 text-emerald-500" },
    { id: "Oro", icon: <Globe size={14} />, label: "Oro", color: "border-amber-400 text-amber-300" }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);

    const formato = "imperio";
    const [mainEditionSelected, setMainEditionSelected] = useState(location.state?.initialEdition || "kvsm_titanes"); 
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Estadísticas para exportar imagen
    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { 
            const type = c.type || "Otros";
            if (counts[type] !== undefined) counts[type] += c.cantidad; 
        });
        return { counts };
    }, [mazo]);

    // Cargar mazo para editar
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            if (d.format === "imperio") {
                setNombreMazo(d.name);
                setEditingDeckId(d._id);
                setIsPublic(d.isPublic || false);
                setMazo(d.cards.map(c => ({ 
                    ...c, 
                    cantidad: c.quantity || 1, 
                    imgUrl: getImg(c),
                    type: c.type || "Otros" // Aseguramos que tenga tipo
                })));
            }
        }
    }, [location.state]);

    // Fetch de cartas
    useEffect(() => {
        const fetchCartas = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", mainEditionSelected);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { 
                console.error(e); 
            } finally { 
                setLoading(false); 
            }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, mainEditionSelected, tipoSeleccionado]);

    // ✅ LÓGICA DE AGREGADO REPARADA (COMO PB)
    const handleAdd = (c) => {
        setMazo(prevMazo => {
            const ex = prevMazo.find(x => x.slug === c.slug);
            const totalActual = prevMazo.reduce((acc, card) => acc + card.cantidad, 0);

            if (totalActual >= 50 && !ex) {
                alert("Mazo lleno (50/50)");
                return prevMazo;
            }

            if (ex) {
                if (ex.cantidad < 3) {
                    return prevMazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x);
                }
                return prevMazo;
            } else {
                // Importante: Guardamos el tipo de la carta para que la lista lateral la clasifique
                return [...prevMazo, { ...c, cantidad: 1, imgUrl: getImg(c), type: c.type || "Otros" }];
            }
        });
    };

    const handleRemove = (slug) => {
        setMazo(prev => prev.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));
    };

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
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    // ✅ LÓGICA DE AGRUPACIÓN REPARADA PARA LA LISTA DERECHA
    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { 
            const t = c.type || "Otros"; 
            if (!g[t]) g[t] = []; 
            g[t].push(c); 
        });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    const handleTakeScreenshot = async () => {
        alert("Generando imagen...");
        // (Aquí va tu lógica de canvas igual a la de PB)
    };

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#070504] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header Superior */}
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all italic tracking-tighter">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Imperio</h2>
                    <div className="w-10"></div>
                </div>

                {/* Filtros */}
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {EDICIONES_IMPERIO.map(ed => (
                            <button key={ed.id} onClick={() => { setMainEditionSelected(ed.id); setBusqueda(""); }}
                                className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 shadow-lg ${mainEditionSelected === ed.id ? `bg-gradient-to-r ${ed.color} border-white scale-105` : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'}`}>
                                {ed.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Búsqueda de cartas..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500 font-bold" />
                    </div>
                </div>

                {/* Grid de Cartas */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold uppercase tracking-tighter">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-pulse"><div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xl border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-orange-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ LISTADO DERECHO REPARADO (side-bar) */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0c0e14] to-black shadow-2xl">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase tracking-widest flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18}/><span className="italic">Grimorio Imperio</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all duration-500 border ${totalCartas === 50 ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3"><div className="h-[2px] flex-1 bg-gradient-to-r from-orange-600/50 to-transparent"></div><h3 className="text-orange-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3></div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 group hover:bg-orange-600/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500 text-green-500 rounded-xl active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-600 text-red-400 rounded-xl active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={handleTakeScreenshot} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Camera size={16} /> Descargar Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 shadow-xl"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* Modal Zoom y Modal Guardar (Mantén tus componentes de modal aquí abajo) */}
            {/* ... */}
        </div>
    );
}
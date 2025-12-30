import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  Users, Star, Layers, Shield, Sword, ChevronDown
} from "lucide-react";

// Mapeo de IDs de tipo a nombres (según tu base de datos type: "2", etc.)
const TYPE_MAP = {
    "1": "Aliado",
    "2": "Talismán",
    "3": "Arma",
    "4": "Tótem",
    "5": "Oro"
};

const EDICIONES_IMPERIO = [
    { id: "kvsm_titanes", label: "KVSM Titanes" },
    { id: "25_Aniversario_Imp", label: "25 Aniversario" },
    { id: "libertadores", label: "Libertadores" },
    { id: "onyria", label: "Onyria" },
    { id: "toolkit_cenizas_de_fuego", label: "Toolkit Cenizas" },
    { id: "toolkit_hielo_inmortal", label: "Toolkit Hielo" },
    { id: "lootbox_2024", label: "Lootbox 2024" },
    { id: "secretos_arcanos", label: "Secretos Arcanos" },
    { id: "bestiarium", label: "Bestiarium" },
    { id: "escuadronmecha", label: "Escuadrón Mecha" },
    { id: "amenazakaiju", label: "Amenaza Kaiju" },
    { id: "zodiaco", label: "Zodiaco" },
    { id: "espiritu_samurai", label: "Espíritu Samurai" }
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

    // ✅ Normalización de tipos para el listado
    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { 
            const typeName = TYPE_MAP[c.type] || c.type || "Otros";
            if (counts[typeName] !== undefined) counts[typeName] += c.cantidad; 
        });
        return { counts };
    }, [mazo]);

    // ✅ Carga de edición reparada
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            if (d.format === "imperio") {
                setNombreMazo(d.name || "");
                setEditingDeckId(d._id);
                setIsPublic(d.isPublic || false);
                setMazo(d.cards.map(c => ({ 
                    ...c, 
                    cantidad: c.quantity || 1, 
                    imgUrl: getImg(c),
                    type: String(c.type) // Forzamos string para el TYPE_MAP
                })));
            }
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
                
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, mainEditionSelected, tipoSeleccionado]);

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
                return [...prevMazo, { ...c, cantidad: 1, imgUrl: getImg(c), type: String(c.type) }];
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

    // ✅ Agrupación funcional para el listado derecho usando TYPE_MAP
    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { 
            const t = TYPE_MAP[c.type] || "Otros"; 
            if (!g[t]) g[t] = []; 
            g[t].push(c); 
        });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    const handleTakeScreenshot = async () => {
        alert("Generando captura...");
        // Lógica de captura idéntica a PB...
    };

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#070504] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all uppercase italic">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Imperio</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* ✅ SELECTOR DE EDICIONES REQUERIDO */}
                        <div className="relative flex-1">
                            <select 
                                value={mainEditionSelected} 
                                onChange={(e) => { setMainEditionSelected(e.target.value); setBusqueda(""); }}
                                className="w-full bg-slate-950 border-2 border-slate-800 text-orange-500 p-3 rounded-xl appearance-none font-black uppercase text-xs tracking-widest focus:border-orange-600 outline-none cursor-pointer"
                            >
                                {EDICIONES_IMPERIO.map(ed => (
                                    <option key={ed.id} value={ed.id}>{ed.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-orange-500 pointer-events-none" size={18} />
                        </div>

                        <input 
                            type="text" 
                            placeholder="Buscar en el Reino..." 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                            className="flex-[2] p-3 rounded-xl bg-slate-950 border-2 border-slate-800 text-sm outline-none focus:border-orange-500 font-bold placeholder:text-slate-600" 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold uppercase italic tracking-widest">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
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

            {/* ✅ LISTADO DERECHO REPARADO */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0c0e14] to-black shadow-2xl">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase tracking-widest flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18}/><span className="italic">Grimorio Imperio</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all border ${totalCartas === 50 ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3"><div className="h-[2px] flex-1 bg-gradient-to-r from-orange-600/50 to-transparent"></div><h3 className="text-orange-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3></div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 group hover:bg-orange-600/10 transition-all duration-300 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-orange-500/20 hover:bg-orange-500 text-orange-500 rounded-xl active:scale-90"><Plus size={16} strokeWidth={3} /></button>
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

            {/* MODAL ZOOM */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.3)] border-4 border-orange-500/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={24} strokeWidth={3} /></button>
                            <span className="text-4xl font-black text-white leading-none">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-orange-500 tracking-tighter italic text-center">Guardar Estrategia</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-600 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                            <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tighter">Arena Global <Globe size={14} className="inline ml-1 text-orange-500" /></span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-black px-4 hover:text-white transition-colors uppercase italic text-xs tracking-widest">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-2 italic"><Save size={16} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
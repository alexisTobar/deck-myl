import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Shield, Star, Sword
} from "lucide-react";

const EDICIONES_IMPERIO = { 
    "kvsm_titanes": "KVSM Titanes",
    "25_Aniversario_Imp": "25 aniversario",
    "libertadores": "Libertadores", 
    "onyria": "Onyria", 
    "toolkit_cenizas_de_fuego": "Toolkit Cenizas", 
    "toolkit_hielo_inmortal": "Toolkit Hielo", 
    "lootbox_2024": "Lootbox 2024", 
    "secretos_arcanos": "Secretos Arcanos", 
    "bestiarium": "Bestiarium", 
    "escuadronmecha": "Escuadrón Mecha", 
    "amenazakaiju": "Amenaza Kaiju", 
    "zodiaco": "Zodiaco", 
    "espiritu_samurai": "Espíritu Samurai" 
};

const TIPOS_IMPERIO = [
    { id: "Aliado", label: "Aliado", icon: "👤", color: "border-blue-500 text-blue-400" },
    { id: "Talismán", label: "Talismán", icon: "✨", color: "border-purple-500 text-purple-400" },
    { id: "Arma", label: "Arma", icon: "⚔️", color: "border-red-500 text-red-400" },
    { id: "Tótem", label: "Tótem", icon: "🗿", color: "border-green-500 text-green-400" },
    { id: "Oro", label: "Oro", icon: "💰", color: "border-yellow-500 text-yellow-400" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);

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
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += c.cantidad; });
        return { counts };
    }, [mazo]);

    // ✅ REPARADO: Carga y normalización estricta por SLUG
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name || "");
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            
            // Usamos un Map para asegurar que no haya duplicados por slug al cargar
            const uniqueCards = [];
            d.cards.forEach(c => {
                const existing = uniqueCards.find(x => x.slug === c.slug);
                if (existing) {
                    existing.cantidad += (c.quantity || c.cantidad || 1);
                } else {
                    uniqueCards.push({
                        ...c,
                        cantidad: c.quantity || c.cantidad || 1,
                        imgUrl: getImg(c)
                    });
                }
            });
            setMazo(uniqueCards);
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

    // ✅ REPARADO: handleAdd usa slug para evitar duplicar filas
    const handleAdd = (c) => {
        setMazo(prev => {
            const exIndex = prev.findIndex(x => x.slug === c.slug);
            const total = prev.reduce((acc, curr) => acc + curr.cantidad, 0);
            
            if (total >= 50 && exIndex === -1) {
                alert("Mazo lleno");
                return prev;
            }

            if (exIndex !== -1) {
                const newMazo = [...prev];
                if (newMazo[exIndex].cantidad < 3) {
                    newMazo[exIndex] = { ...newMazo[exIndex], cantidad: newMazo[exIndex].cantidad + 1 };
                }
                return newMazo;
            } else {
                return [...prev, { ...c, cantidad: 1, imgUrl: getImg(c) }];
            }
        });
    };

    const handleRemove = (slug) => {
        setMazo(prev => prev.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));
    };

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
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
            <div className="flex-1 flex flex-col h-full relative overflow-hidden border-r border-white/5">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all uppercase italic tracking-tighter">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Imperio</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500 font-bold" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-orange-400">{Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4">
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-black uppercase tracking-widest">Escaneando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const mazoItem = mazo.find(x => x.slug === c.slug);
                                const cant = mazoItem ? mazoItem.cantidad : 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-500 transform group-hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_#f97316aa]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-xl border-2 border-white shadow-2xl">{cant}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-slate-950 text-white font-bold italic tracking-tighter shadow-2xl">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase flex justify-between shadow-xl">
                    <span>Grimorio Imperio</span>
                    <span className={totalCartas === 50 ? 'text-green-500' : 'text-slate-300'}>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                   {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <h3 className="text-orange-400 text-[11px] font-black uppercase mb-3 border-b border-orange-600/20 italic">{t}</h3>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-orange-600/10 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 group-hover:text-white uppercase text-[12px] tracking-tight">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleAdd(c); }} className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-500 rounded-xl active:scale-90 shadow-sm"><Plus size={16}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRemove(c.slug); }} className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-xl active:scale-90 shadow-sm"><Minus size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 shadow-2xl transition-all"><Save size={16} /> Guardar Deck</button>
                </div>
            </div>

            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.3)] border-4 border-orange-500/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={24} strokeWidth={3} /></button>
                            <span className="text-4xl font-black text-white leading-none">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-orange-500 tracking-tighter italic text-center">Guardar Estrategia</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                            <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tighter">Arena Global <Globe size={14} className="inline ml-1 text-orange-500" /></span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-black px-4 hover:text-white transition-colors uppercase italic text-xs tracking-widest">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-yellow-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-2 italic"><Save size={16} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
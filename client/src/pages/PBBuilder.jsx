import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

// Iconos estilo medieval para PB
const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: "🛡️", color: "border-yellow-600 text-yellow-500" },
    { id: "Talismán", label: "Talismán", icon: "📜", color: "border-blue-400 text-blue-300" },
    { id: "Arma", icon: "⚔️", label: "Arma", color: "border-red-600 text-red-500" },
    { id: "Tótem", icon: "🗿", label: "Tótem", color: "border-emerald-600 text-emerald-500" },
    { id: "Oro", icon: "🪙", label: "Oro", color: "border-amber-400 text-amber-300" }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const formato = "primer_bloque";
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("colmillos_avalon");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [razaSeleccionada, setRazaSeleccionada] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // ✅ Lógica de Búsqueda Global PB
    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda && !razaSeleccionada && !tipoSeleccionado) return;
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("format", formato);

                if (busqueda.trim() !== "") {
                    params.append("q", busqueda);
                } else {
                    params.append("edition", edicionSeleccionada);
                }

                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (razaSeleccionada) params.append("race", razaSeleccionada);

                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); setCartas([]); } 
            finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno (50 máx)");
        if (ex) {
            if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x));
        } else {
            setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
        }
    };

    const handleRemove = (s) => setMazo(mazo.map(c => c.slug === s ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const cardsPayload = mazo.map(c => ({ ...c, quantity: c.cantidad }));
            const res = await fetch(`${BACKEND_URL}/api/decks`, { 
                method: "POST", 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: cardsPayload, format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
            else alert("Error al guardar");
        } catch (e) { console.error(e); } finally { setGuardando(false); }
    };

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden text-sm">
            
            {/* IZQUIERDA: BUSCADOR */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 backdrop-blur-md border-b border-yellow-500/20 p-3 flex justify-between items-center px-4">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="text-xs font-black uppercase tracking-widest text-yellow-500 italic">Forja Legendaria (PB)</h2>
                    <div className="w-8 md:hidden"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[200px] relative group">
                            <input 
                                type="text" placeholder="Busca en toda la historia de PB..." value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                className="w-full p-3 pl-10 rounded-2xl bg-slate-950 border border-slate-700 outline-none focus:border-yellow-500 transition-all text-sm" 
                            />
                            <span className="absolute left-3.5 top-3.5 opacity-40 group-focus-within:text-yellow-500">🔍</span>
                        </div>
                        <select 
                            value={edicionSeleccionada} 
                            onChange={(e) => setEdicionSeleccionada(e.target.value)} 
                            className={`bg-slate-950 border border-slate-700 p-3 rounded-2xl text-[10px] font-bold text-yellow-500 outline-none ${busqueda ? 'opacity-30' : ''}`}
                        >
                            {Object.entries(EDICIONES_PB).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                        </select>
                        {/* Selector de Raza PB */}
                        <select 
                            value={razaSeleccionada} 
                            onChange={(e) => setRazaSeleccionada(e.target.value)} 
                            className="bg-slate-950 border border-yellow-500/30 p-3 rounded-2xl text-[10px] font-bold text-yellow-400 outline-none"
                        >
                            <option value="">Todas las Razas</option>
                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Botones de Tipo Estilo PB */}
                    <div className="flex flex-wrap gap-2">
                        {TIPOS_PB.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${tipoSeleccionado === tipo.id ? `${tipo.color} bg-slate-800 shadow-lg shadow-yellow-500/10` : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                                <span className="text-base">{tipo.icon}</span> <span>{tipo.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black animate-pop border-2 border-white">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg">👁️</button>
                                        <h3 className="text-[9px] text-center mt-1 font-bold text-slate-400 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR DERECHA PB */}
            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20 shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <div>
                        <h2 className="font-black italic text-yellow-500 text-lg uppercase tracking-tighter">Mi Grimorio</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-xs">Era PB</p>
                    </div>
                    <span className={`text-xl font-black px-3 py-1 rounded-xl ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-yellow-600 text-[10px] font-black border-b border-slate-700 mb-1 pb-1 uppercase tracking-tighter">{t}</h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[t].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center text-xs p-1.5 bg-slate-800/40 rounded-lg group">
                                        <span className="truncate flex-1 cursor-pointer font-medium" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleAdd(c)} className="text-green-500 font-bold px-1 hover:bg-green-500/20 rounded">+</button>
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold px-1 hover:bg-red-500/20 rounded">-</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-[10px] shadow-lg">👁️ GALERÍA VISUAL</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full py-3 rounded-xl font-black text-xs bg-yellow-600 hover:bg-yellow-500 shadow-lg">💾 GUARDAR DECK</button>
                </div>
            </div>
        </div>
    );
}
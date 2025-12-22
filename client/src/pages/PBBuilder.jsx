import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_FILTRO = [ { id: 1, label: "Aliado", value: "Aliado" }, { id: 2, label: "Talismán", value: "Talismán" }, { id: 3, label: "Arma", value: "Arma" }, { id: 4, label: "Tótem", value: "Tótem" }, { id: 5, label: "Oro", value: "Oro" } ];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [showMobileList, setShowMobileList] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda && !razaSeleccionada) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato, edition: edicionSeleccionada });
                if (busqueda) params.append("q", busqueda);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (razaSeleccionada) params.append("race", razaSeleccionada);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else { setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]); }
    };

    const handleRemove = (s) => setMazo(mazo.map(c => c.slug === s ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleSaveDeck = async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            await fetch(url, { 
                method: editingDeckId ? "PUT" : "POST", 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            navigate("/my-decks");
        } catch (e) { console.error(e); } finally { setGuardando(false); }
    };

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/50 backdrop-blur-md border-b border-yellow-900/30 p-3 flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 hover:bg-slate-800 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-xs font-black uppercase tracking-widest text-yellow-500">Constructor PB</h2>
                    </div>
                </div>

                <div className="p-4 flex flex-wrap gap-2 items-center bg-slate-900/20 border-b border-slate-800">
                    <div className="flex-1 min-w-[150px] relative">
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:ring-1 focus:ring-yellow-500" />
                        <span className="absolute left-3 top-3 opacity-40">🔍</span>
                    </div>
                    <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-[10px] font-bold text-yellow-500 outline-none">
                        {Object.entries(EDICIONES_PB).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                    </select>
                    <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-800 border border-yellow-500/40 text-yellow-500 p-2 rounded-xl text-[10px] font-black outline-none">
                        <option value="">Todas las Razas</option>
                        {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4" ref={gridContainerRef}>
                    {loading ? <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-500' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className={`w-full h-auto ${cant > 0 ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} alt={c.name} />
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600/90 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] shadow-lg">👁️</button>
                                        <h3 className="text-[8px] text-center mt-1 font-bold text-slate-500 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-black italic text-yellow-500">MI DECK PB</h2>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800">{totalCartas}/50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-yellow-600 text-[10px] font-black border-b border-slate-700 mb-1">{t}</h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[t].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center text-xs p-1.5 bg-slate-800/40 rounded hover:bg-slate-800 transition-all">
                                        <span className="truncate flex-1 cursor-pointer" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleAdd(c)} className="text-green-500 font-bold px-1">+</button>
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold px-1">-</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 py-2.5 rounded-xl font-black text-[10px] shadow-lg">👁️ GALERÍA</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full py-3 rounded-xl font-black text-xs bg-yellow-600 hover:bg-yellow-500 shadow-lg">💾 GUARDAR DECK</button>
                </div>
            </div>
            {/* ... (Aquí irían los mismos modales de Zoom, Guardar y Lista del código anterior) */}
        </div>
    );
}
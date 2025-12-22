import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

// --- CONSTANTES ---
const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };
const TIPOS_FILTRO = [ { id: 1, label: "Aliado", value: 1 }, { id: 2, label: "Talismán", value: 2 }, { id: 3, label: "Arma", value: 3 }, { id: 4, label: "Tótem", value: 4 }, { id: 5, label: "Oro", value: 5 } ];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => { 
    if (!c) return "https://via.placeholder.com/250x350?text=Error"; 
    return c.imgUrl || c.imageUrl || c.img || c.imagen || c.image || (c.image && c.image.secure_url) || "https://via.placeholder.com/250x350?text=No+Image"; 
};

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);

    // Determinar formato por URL
    const isPB = location.pathname.includes("primer-bloque");
    const formato = isPB ? "primer_bloque" : "imperio";

    // Estados
    const [gridColumns, setGridColumns] = useState(window.innerWidth < 768 ? 3 : 5);
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
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
    const [guardando, setGuardando] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [showMobileList, setShowMobileList] = useState(false);

    const edicionesActivas = useMemo(() => isPB ? EDICIONES_PB : EDICIONES_IMPERIO, [isPB]);

    // Efectos Visuales
    const themeColor = isPB ? "yellow-500" : "orange-500";
    const glowClass = isPB 
        ? "shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-500" 
        : "shadow-[0_0_15px_rgba(249,115,22,0.5)] border-orange-500";

    // Selección inicial de edición
    useEffect(() => {
        const claves = Object.keys(edicionesActivas);
        if (claves.length > 0) setEdicionSeleccionada(claves[0]);
    }, [edicionesActivas]);

    // Carga de deck para editar
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            if(d.isPublic !== undefined) setIsPublic(d.isPublic);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location]);

    // Buscador
    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda && !razaSeleccionada) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato, edition: edicionSeleccionada });
                if (busqueda) params.append("q", busqueda);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (isPB && razaSeleccionada) params.append("race", razaSeleccionada);

                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } 
            finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada, formato, isPB]);

    const handleAdd = (carta) => {
        const existe = mazo.find(c => c.slug === carta.slug);
        if (mazo.reduce((acc, c) => acc + c.cantidad, 0) >= 50 && !existe) return alert("Mazo lleno");
        if (existe) {
            if (existe.cantidad < 3) setMazo(mazo.map(c => c.slug === carta.slug ? { ...c, cantidad: c.cantidad + 1 } : c));
        } else {
            const type = (!isNaN(carta.type) ? TIPOS_ID_TO_NAME[carta.type] : carta.type) || "Otros";
            setMazo([...mazo, { ...carta, type, cantidad: 1, imgUrl: getImg(carta) }]);
        }
    };

    const handleRemove = (slug) => {
        setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));
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
                method, 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
        } catch (e) { console.error(e); } finally { setGuardando(false); }
    };

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className={`h-screen flex flex-col md:flex-row font-sans ${isPB ? 'bg-[#0c0e14]' : 'bg-[#110d0a]'} text-white overflow-hidden`}>
            
            {/* IZQUIERDA: BUSCADOR */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                
                {/* Cabecera */}
                <div className={`bg-slate-900/50 backdrop-blur-md border-b ${isPB ? 'border-yellow-900/30' : 'border-orange-900/30'} p-3 flex justify-between items-center px-6`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${isPB ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`}></div>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>
                            {isPB ? '📜 Primer Bloque' : '🏛️ Imperio'}
                        </h2>
                    </div>
                </div>

                {/* Barra de Filtros */}
                <div className="p-4 flex flex-wrap gap-2 items-center bg-slate-900/20">
                    <div className="flex-1 min-w-[200px] relative">
                        <input 
                            type="text" placeholder="Buscar carta..." value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                            className={`w-full p-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:ring-1 ${isPB ? 'focus:ring-yellow-500' : 'focus:ring-orange-500'}`}
                        />
                        <span className="absolute left-3 top-3 opacity-40">🔍</span>
                    </div>

                    <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs font-bold outline-none">
                        {Object.entries(edicionesActivas).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                    </select>

                    <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs font-bold outline-none">
                        <option value="">Todos los Tipos</option>
                        {TIPOS_FILTRO.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                    </select>

                    {isPB && (
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-800 border border-yellow-500/50 text-yellow-400 p-2 rounded-xl text-xs font-bold outline-none">
                            <option value="">Todas las Razas</option>
                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    )}
                </div>

                {/* Grid de Cartas */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? (
                        <div className="flex flex-col items-center mt-20 gap-4">
                            <div className={`w-12 h-12 border-4 ${isPB ? 'border-yellow-500' : 'border-orange-500'} border-t-transparent rounded-full animate-spin`}></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative group cursor-pointer" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? glowClass : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className={`w-full h-auto ${cant > 0 ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} alt={c.name} />
                                        </div>
                                        {cant > 0 && (
                                            <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xl ${isPB ? 'bg-yellow-500 text-black' : 'bg-orange-600 text-white'}`}>
                                                {cant}
                                            </div>
                                        )}
                                        <h3 className="text-[9px] text-center mt-1 font-bold text-slate-400 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR PC */}
            <div className={`hidden md:flex w-80 border-l border-slate-800 flex-col h-screen`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                    <h2 className={`font-black italic ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>MI MAZO</h2>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800">{totalCartas}/50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className={`${isPB ? 'text-yellow-600' : 'text-orange-600'} text-[10px] font-black border-b border-slate-800 mb-1`}>{t}</h3>
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
                <div className="p-4 border-t border-slate-800 flex flex-col gap-2 bg-slate-900/30">
                    <button onClick={() => setModalGuardarOpen(true)} className={`w-full py-3 rounded-xl font-black text-xs shadow-lg transition-all ${isPB ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-orange-600 hover:bg-orange-500'}`}>
                        💾 GUARDAR DECK
                    </button>
                </div>
            </div>

            {/* FOOTER MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between">
                <div className="flex flex-col px-3">
                    <span className="text-[10px] text-slate-500 font-bold">TOTAL</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700">LISTA</button>
                    <button onClick={() => setModalGuardarOpen(true)} className={`${isPB ? 'bg-yellow-600' : 'bg-orange-600'} text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg`}>GUARDAR</button>
                </div>
            </div>

            {/* MODAL ZOOM */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4" onClick={() => setCardToZoom(null)}>
                    <div className="relative max-w-sm w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className={`w-full h-auto rounded-2xl shadow-2xl border-4 ${isPB ? 'border-yellow-500/50' : 'border-orange-500/50'}`} alt="zoom" />
                        <div className="mt-8 flex items-center gap-8 bg-slate-900 p-4 rounded-3xl border border-slate-700">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-12 h-12 rounded-full bg-red-600 text-white text-3xl font-bold">-</button>
                            <span className="text-3xl font-black">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-12 h-12 rounded-full bg-green-600 text-white text-3xl font-bold">+</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className={`text-xl font-black mb-6 uppercase ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>Guardar Estrategia</h3>
                        <input 
                            autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} 
                            className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-600 outline-none focus:border-blue-500 mb-4" 
                            placeholder="Nombre del mazo..." 
                        />
                        <label className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl cursor-pointer">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                            <span className="text-sm font-bold text-slate-300">Hacer público en comunidad 🌍</span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-4 hover:text-white transition">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className={`${isPB ? 'bg-yellow-600' : 'bg-orange-600'} text-white px-8 py-2 rounded-xl font-black shadow-lg`}>CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL MÓVIL LISTA */}
            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-slate-900 rounded-t-3xl h-[70vh] p-4 overflow-auto border-t border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase italic">MI LISTA ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-2xl">✕</button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4">
                                <h4 className={`${isPB ? 'text-yellow-600' : 'text-orange-600'} text-[10px] font-black uppercase mb-2`}>{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-sm">{c.name}</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold px-2 text-xl">-</button>
                                            <span className="font-bold">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} className="text-green-500 font-bold px-2 text-xl">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
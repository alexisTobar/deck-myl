import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

// --- CONFIGURACIÓN DE CONSTANTES POR FORMATO ---
const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };
const TIPOS_FILTRO = [ { id: 1, label: "Aliado", value: 1 }, { id: 2, label: "Talismán", value: 2 }, { id: 3, label: "Arma", value: 3 }, { id: 4, label: "Tótem", value: 4 }, { id: 5, label: "Oro", value: 5 } ];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => { if (!c) return "https://via.placeholder.com/250x350?text=Error"; return c.imgUrl || c.imageUrl || c.img || c.imagen || c.image || (c.image && c.image.secure_url) || (c.image && c.image.url) || "https://via.placeholder.com/250x350?text=No+Image"; };

const animationStyles = `
  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popElastic { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.4); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
  .animate-slide-in { animation: slideInRight 0.3s ease-out forwards; }
  .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
  .card-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .animate-pop { animation: popElastic 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
`;

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    // Estados de UI y Filtros
    const [gridColumns, setGridColumns] = useState(window.innerWidth < 768 ? 3 : 5);
    const [formato, setFormato] = useState(location.state?.selectedFormat || "imperio");
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados del Mazo
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);

    // Modales y Visibilidad
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [vistaPorTipo, setVistaPorTipo] = useState(true);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const edicionesActivas = useMemo(() => formato === 'imperio' ? EDICIONES_IMPERIO : EDICIONES_PB, [formato]);

    // Selección automática de edición al cambiar formato
    useEffect(() => {
        const claves = Object.keys(edicionesActivas);
        if (claves.length > 0) setEdicionSeleccionada(claves[0]);
    }, [edicionesActivas]);

    const cambiarFormato = (nuevo) => {
        if (formato === nuevo) return;
        setFormato(nuevo); setTipoSeleccionado(""); setBusqueda(""); setCartas([]);
    };

    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollTop(container.scrollTop > 300);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => gridContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    // Carga de datos iniciales
    useEffect(() => {
        if (location.state && location.state.deckToEdit) {
            const deck = location.state.deckToEdit;
            setNombreMazo(deck.name);
            setEditingDeckId(deck._id);
            if(deck.format) setFormato(deck.format);
            if(deck.isPublic !== undefined) setIsPublic(deck.isPublic);
            const cartasCargadas = deck.cards.map(c => ({
                ...c, cantidad: c.quantity || 1, type: c.type, imgUrl: getImg(c)
            }));
            setMazo(cartasCargadas);
        } else if (location.state?.selectedFormat) {
            setFormato(location.state.selectedFormat);
            setCartas([]); setBusqueda("");
        }
        window.history.replaceState({}, document.title);
    }, [location]);

    // Buscador
    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda) return;
            const cacheKey = `search-v17-${formato}-${busqueda}-${edicionSeleccionada}-${tipoSeleccionado}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) { setCartas(JSON.parse(cachedData)); return; }
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("format", formato);
                if (busqueda) params.append("q", busqueda);
                if (edicionSeleccionada) params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) { console.error(e); setCartas([]); } 
            finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, formato]); 

    // Lógica del Mazo
    const handleAdd = (carta) => {
        const existe = mazo.find(c => c.slug === carta.slug);
        const total = mazo.reduce((acc, c) => acc + c.cantidad, 0);
        if (total >= 50 && !existe) return alert("Mazo lleno (50 cartas)");
        if (existe) {
            if (existe.cantidad < 3) {
                const nuevoMazo = mazo.map(c => c.slug === carta.slug ? { ...c, cantidad: c.cantidad + 1 } : c);
                setMazo(nuevoMazo);
            }
        } else {
            const nombreTipo = (!isNaN(carta.type) ? TIPOS_ID_TO_NAME[carta.type] : carta.type) || "Otros";
            setMazo([...mazo, { ...carta, type: nombreTipo, cantidad: 1 }]);
        }
    };

    const handleRemove = (slug) => {
        const newMazo = mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0);
        setMazo(newMazo);
    };

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Escribe un nombre");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            const cardsPayload = mazo.map(c => ({ ...c, quantity: c.cantidad }));
            const res = await fetch(url, { 
                method, 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: cardsPayload, format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
            else { const data = await res.json(); alert(data.error || "Error"); }
        } catch (e) { alert("Error conexión"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        await new Promise(r => setTimeout(r, 200)); 
        try {
            const node = galleryRef.current;
            const dataUrl = await toPng(node, { quality: 1.0, backgroundColor: '#0f172a' });
            const link = document.createElement('a'); link.download = `${nombreMazo || "Mazo"}.png`; link.href = dataUrl; link.click();
        } catch (err) { alert('Error captura'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => { const g = {}; mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); }); return g; }, [mazo]);
    const getSortedTypes = () => ORDER_TYPES.filter(t => Object.keys(mazoAgrupado).includes(t)).concat(Object.keys(mazoAgrupado).filter(t => !ORDER_TYPES.includes(t)));
    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-slate-900 text-white overflow-hidden">
            <style>{animationStyles}</style>

            {/* IZQUIERDA: BUSCADOR */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-center gap-4">
                    <button onClick={() => cambiarFormato('imperio')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'imperio' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>🏛️ IMPERIO</button>
                    <button onClick={() => cambiarFormato('primer_bloque')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'primer_bloque' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>📜 PRIMER BLOQUE</button>
                </div>

                <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2 shadow-md">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">🔙</button>
                    <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded border md:hidden bg-slate-800 border-slate-700">⚙️</button>
                    <div className="flex-1 relative"><input type="text" placeholder={`Buscar en ${formato}...`} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-orange-500 outline-none" /><span className="absolute left-3 top-2.5 text-slate-500">🔍</span></div>
                    <div className="hidden md:flex gap-2 ml-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                            <option value="">🃏 Todos</option>
                            {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* Filtros Móvil */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 bg-slate-800 border-b border-slate-700 ${showFilters ? 'max-h-40 p-2' : 'max-h-0'}`}>
                    <div className="flex gap-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs"><option value="">🃏 Todos</option>{TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}</select>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-2 pb-24 md:pb-2 custom-scrollbar relative">
                        {loading ? <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div> : (
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                                {cartas.length > 0 ? cartas.map((c) => (
                                    <div key={c._id || c.slug} className="relative group cursor-pointer animate-fade-in" onClick={() => handleAdd(c)}>
                                        <div className="rounded-xl overflow-hidden border-2 border-slate-800 relative bg-slate-800 group-hover:border-orange-500 transition-all">
                                            <img src={getImg(c)} alt={c.name} className="w-full h-auto" loading="lazy" onError={(e) => { e.target.src = "https://via.placeholder.com/250x350?text=No+Image"; }} />
                                            {mazo.find(x => x.slug === c.slug)?.cantidad > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                    <div className="absolute inset-0 bg-black/30"></div>
                                                    <div className="animate-pop w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-white font-black text-xl">{mazo.find(x => x.slug === c.slug).cantidad}</div>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600/90 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100">👁️</button>
                                        <h3 className="text-[9px] text-center text-slate-400 mt-1 truncate">{c.name}</h3>
                                    </div>
                                )) : <div className="col-span-full text-center text-slate-500 mt-10">No se encontraron cartas.</div>}
                            </div>
                        )}
                        {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-24 right-4 bg-slate-800/80 p-2 rounded-full shadow-lg text-orange-500">⬆</button>}
                    </div>
                </div>
            </div>

            {/* BARRA INFERIOR MÓVIL (RESTAURADA) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mazo</span>
                    <span className={`text-lg font-black leading-none ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}<span className="text-slate-600 text-xs">/50</span></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-xs">📋 Lista</button>
                    <button onClick={() => {setModalMazoOpen(true); setVistaPorTipo(false);}} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs">👁️ Ver</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-xs">💾</button>
                </div>
            </div>

            {/* SIDEBAR PC */}
            <div className="hidden md:flex w-80 bg-slate-800 border-l border-slate-700 flex-col h-screen shadow-2xl z-20 relative">
                <div className="p-4 border-b border-slate-700 bg-slate-800/95 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">🛡️ Mi Mazo</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${totalCartas === 50 ? 'bg-green-600 text-white' : 'text-orange-400'}`}>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {getSortedTypes().map(tipo => (
                        <div key={tipo} className="animate-fade-in">
                            <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-1 border-b border-slate-700 flex justify-between">{tipo} <span>{mazoAgrupado[tipo].reduce((a,c)=>a+c.cantidad,0)}</span></h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[tipo].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center bg-slate-700/40 p-1.5 rounded group border border-transparent hover:border-slate-600">
                                        <div className="flex items-center gap-2 overflow-hidden cursor-pointer w-full" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-900 text-orange-500 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] border border-slate-600">{c.cantidad}</div>
                                            <span className="text-xs text-slate-200 truncate">{c.name}</span>
                                        </div>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition gap-1">
                                            <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="bg-green-600/20 text-green-400 hover:bg-green-600 w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs">+</button>
                                            <button onClick={() => handleRemove(c.slug)} className="bg-red-600/20 text-red-400 hover:bg-red-600 w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs">-</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-700 bg-slate-800 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg shadow transition">👁️ Galería Visual</button>
                    <button onClick={() => setModalGuardarOpen(true)} className={`w-full font-bold py-3 rounded-lg shadow-lg transition ${mazo.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-green-600 to-green-500 text-white'}`}>💾 Guardar Mazo</button>
                </div>
            </div>

            {/* MODAL LISTA MÓVIL (RESTAURADO) */}
            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end">
                    <div className="bg-slate-900 rounded-t-3xl h-[70vh] p-4 overflow-auto animate-slide-up border-t border-slate-700">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                            <h3 className="text-xl font-black text-white uppercase italic">Mi Lista ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-white bg-slate-800 w-8 h-8 rounded-full">✕</button>
                        </div>
                        {getSortedTypes().map(t => (
                            <div key={t} className="mb-4 bg-slate-800/30 p-2 rounded-xl border border-slate-800">
                                <h4 className="text-orange-400 text-[10px] font-black mb-2 uppercase tracking-tighter">{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-white text-sm py-2 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img src={getImg(c)} className="w-10 h-10 rounded object-cover" />
                                            <span className="font-medium">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-900 p-1 px-3 rounded-full border border-slate-700">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold">-</button>
                                            <span className="font-bold text-xs">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="text-green-500 font-bold disabled:opacity-30">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL ZOOM (RESTAURADO CON CONTROLES) */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setCardToZoom(null)}>
                    <div className="relative max-w-sm w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} alt={cardToZoom.name} className="w-full h-auto rounded-2xl shadow-2xl border-4 border-slate-800" />
                        <div className="mt-8 flex items-center gap-8 bg-slate-900 p-4 rounded-3xl border border-slate-700 shadow-2xl">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 text-3xl font-bold flex items-center justify-center border border-red-500/50 shadow-lg active:scale-90 transition">-</button>
                            <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-slate-500 text-[10px] font-bold uppercase">Copias</span>
                                <span className="text-3xl font-black text-white">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            </div>
                            <button onClick={() => handleAdd(cardToZoom)} disabled={(mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0) >= 3} className="w-12 h-12 rounded-full bg-green-600/20 text-green-500 text-3xl font-bold flex items-center justify-center border border-green-500/50 shadow-lg active:scale-90 transition disabled:opacity-10">+</button>
                        </div>
                        <button onClick={() => setCardToZoom(null)} className="absolute -top-12 right-0 bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl">✕</button>
                    </div>
                </div>
            )}

            {/* MODAL GALERÍA (CON ZOOM) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-slide-up">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-lg">
                        <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Galería Visual del Mazo</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-900/80 custom-scrollbar">
                        <div ref={galleryRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-4 pb-20">
                            {mazo.map(c => (
                                <div key={c.slug} className="cursor-pointer relative group" onClick={() => setCardToZoom(c)}>
                                    <img src={getImg(c)} className="w-full h-auto rounded-lg shadow-lg border border-slate-800 group-hover:border-orange-500 transition-all" />
                                    <div className="absolute bottom-0 right-0 bg-orange-600 text-white px-2 font-black text-xs rounded-tl-lg shadow-lg border-l border-t border-slate-900">x{c.cantidad}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center gap-4">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition">📸 Descargar Imagen</button>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Cerrar</button>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl animate-fade-in text-white">
                        <h3 className="text-2xl font-black mb-6 italic uppercase tracking-tighter text-orange-500">Guardar Grimorio</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase ml-1">Nombre de la Estrategia</label>
                                <input autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-orange-500 transition" placeholder="Ej: Dragon Force..." />
                            </div>
                            
                            <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition shadow-inner" onClick={() => setIsPublic(!isPublic)}>
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isPublic ? 'bg-orange-600 border-orange-500' : 'border-slate-600 bg-slate-800'}`}>
                                    {isPublic && <span className="text-white text-xs font-bold">✓</span>}
                                </div>
                                <label className="text-sm text-slate-300 font-bold cursor-pointer select-none">Hacer público en la comunidad 🌍</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-4 hover:text-white transition">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-tighter shadow-lg shadow-orange-900/30 transition active:scale-95 disabled:opacity-50">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

// --- CONFIGURACIÓN DE CONSTANTES POR FORMATO ---
const EDICIONES_IMPERIO = {
    "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria",
    "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo",
    "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium",
    "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco",
    "espiritu_samurai": "Espíritu Samurai"
};

const EDICIONES_PB = {
    "colmillos_avalon": "Colmillos de Avalon",
    "extensiones_pb_2023": "Extensiones PB 2023",
    "espada_sagrada_aniversario": "Espada Sagrada (Aniv)",
    "Relatos": "Relatos",
    "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)",
    "25 aniversario": "25 Aniversario",
    "Festividades": "Festividades",
    "aniversario-de-ra": "Aniversario de Ra",
    "colmillos_inframundo": "Colmillos del Inframundo",
    "encrucijada": "Encrucijada",
    "festividades": "Festividades (Extra)",
    "helenica_aniversario": "Helénica (Aniv)",
    "inferno": "Inferno",
    "jo lanzamiento ra": "Jo Lanzamiento Ra",
    "kit-de-batalla-de-ra": "Kit de Batalla de Ra",
    "kit-raciales-2023": "Kit Raciales 2023",
    "kit-raciales-2024": "Kit Raciales 2024",
    "leyendas_pb_2.0": "Leyendas PB 2.0",
    "lootbox-2023": "Lootbox 2023",
    "lootbox-pb-2024": "Lootbox PB 2024",
    "promo_daana": "Promo Daana",
    "promo_helenica": "Promo Helénica",
    "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada",
    "relatos-de-helenica": "Relatos Helénica",
    "toolkit-pb-2025": "Toolkit PB 2025",
    "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino",
    "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad",
    "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder"
};

const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };

const TIPOS_FILTRO = [
    { id: 1, label: "Aliado", value: 1 }, 
    { id: 2, label: "Talismán", value: 2 }, 
    { id: 3, label: "Arma", value: 3 }, 
    { id: 4, label: "Tótem", value: 4 }, 
    { id: 5, label: "Oro", value: 5 }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => {
    if (!c) return "https://via.placeholder.com/250x350?text=Error";
    return c.imgUrl || c.imageUrl || c.img || c.imagen || c.image || (c.image && c.image.secure_url) || (c.image && c.image.url) || "https://via.placeholder.com/250x350?text=No+Image";
};

const animationStyles = `
  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popElastic {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.4); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
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

    const [gridColumns, setGridColumns] = useState(window.innerWidth < 768 ? 3 : 5);
    const [formato, setFormato] = useState(location.state?.selectedFormat || "imperio"); 
    const [edicionSeleccionada, setEdicionSeleccionada] = useState(""); 
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null); 
    
    // ✅ MEJORA: Estado para manejar si el mazo será público o privado desde aquí
    const [isPublic, setIsPublic] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [vistaPorTipo, setVistaPorTipo] = useState(true);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null); 
    const [showScrollTop, setShowScrollTop] = useState(false);

    const edicionesActivas = useMemo(() => {
        return formato === 'imperio' ? EDICIONES_IMPERIO : EDICIONES_PB;
    }, [formato]);

    // ✅ AUTOMATIZACIÓN: Selecciona edición automáticamente al cambiar formato
    useEffect(() => {
        const clavesEdiciones = Object.keys(edicionesActivas);
        if (clavesEdiciones.length > 0) {
            setEdicionSeleccionada(clavesEdiciones[0]);
        } else {
            setEdicionSeleccionada("");
        }
    }, [edicionesActivas]);

    const cambiarFormato = (nuevoFormato) => {
        if (formato === nuevoFormato) return;
        setFormato(nuevoFormato);
        setTipoSeleccionado("");
        setBusqueda("");
        setCartas([]); 
    };

    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollTop(container.scrollTop > 300);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => gridContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    useEffect(() => {
        if (location.state && location.state.deckToEdit) {
            const deck = location.state.deckToEdit;
            setNombreMazo(deck.name);
            setEditingDeckId(deck._id);
            if(deck.format) setFormato(deck.format);
            // ✅ Cargar estado de privacidad si existe
            if(deck.isPublic !== undefined) setIsPublic(deck.isPublic);

            const cartasCargadas = deck.cards.map(c => ({
                ...c, cantidad: c.quantity || 1, type: c.type, imgUrl: getImg(c)
            }));
            setMazo(cartasCargadas);
        } else if (location.state?.selectedFormat) {
            setFormato(location.state.selectedFormat);
            setCartas([]);
            setBusqueda("");
        }
        window.history.replaceState({}, document.title);
    }, [location]);

    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda) return;
            const cacheKey = `search-v15-AUTO-${formato}-${busqueda}-${edicionSeleccionada}-${tipoSeleccionado}`;
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
                if (!res.ok) throw new Error("Error API");
                const data = await res.json();
                const safeData = Array.isArray(data) ? data : (data.results || []);
                setCartas(safeData);
                localStorage.setItem(cacheKey, JSON.stringify(safeData));
            } catch (error) { console.error(error); setCartas([]); } 
            finally { setLoading(false); }
        };
        const timer = setTimeout(() => { fetchCartas(); }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, formato]); 

    const handleAdd = (carta) => {
        const existe = mazo.find(c => c.slug === carta.slug);
        const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);
        if (totalCartas >= 50 && !existe) return alert("Mazo lleno (50 cartas)");
        if (existe) { if (existe.cantidad < 3) { existe.cantidad++; setMazo([...mazo]); } } 
        else { const nombreTipo = (!isNaN(carta.type) ? TIPOS_ID_TO_NAME[carta.type] : carta.type) || "Otros"; setMazo([...mazo, { ...carta, type: nombreTipo, cantidad: 1 }]); }
    };

    const handleRemove = (slug) => {
        const newMazo = mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0);
        setMazo(newMazo);
    };

    // ✅ CORRECCIÓN DE GUARDADO: Aquí enviamos 'format' e 'isPublic'
    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Escribe un nombre");
        const token = localStorage.getItem("token");
        if (!token) { alert("Inicia sesión"); navigate("/login"); return; }
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            const cardsPayload = mazo.map(c => ({ ...c, quantity: c.cantidad }));
            
            const res = await fetch(url, { 
                method: method, 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ 
                    name: nombreMazo, 
                    cards: cardsPayload, 
                    format: formato,    // <--- ESTO LO GUARDA EN LA DB COMO PB O IMPERIO
                    isPublic: isPublic   // <--- ESTO LO MANDA A LA COMUNIDAD
                }) 
            });

            if (res.ok) { 
                alert("Mazo guardado correctamente"); 
                navigate("/my-decks"); 
            } else { 
                const data = await res.json(); alert(data.error || "Error"); 
            }
        } catch (error) { alert("Error conexión"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        await new Promise(r => setTimeout(r, 200)); 
        try {
            const node = galleryRef.current;
            const width = node.scrollWidth + 40;
            const height = node.scrollHeight + 100;
            const dataUrl = await toPng(node, { quality: 1.0, backgroundColor: '#0f172a', width, height, style: { transform: 'none', overflow: 'visible', width: `${width}px`, height: `${height}px`, padding: '20px' }, filter: (child) => !child.classList?.contains('hide-on-capture') });
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
                <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-center gap-4 shadow-inner">
                    <button onClick={() => cambiarFormato('imperio')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'imperio' ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>🏛️ IMPERIO</button>
                    <button onClick={() => cambiarFormato('primer_bloque')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'primer_bloque' ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>📜 PRIMER BLOQUE</button>
                </div>

                <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2 shadow-md">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition">🔙</button>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border md:hidden ${showFilters ? 'bg-orange-600 border-orange-500' : 'bg-slate-800 border-slate-700'}`}>⚙️</button>
                    <div className="flex-1 relative"><input type="text" placeholder={`Buscar en ${formato}...`} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-orange-500 outline-none transition-all" /><span className="absolute left-3 top-2.5 text-slate-500">🔍</span></div>
                    
                    {/* SELECTS PC */}
                    <div className="hidden md:flex gap-2 ml-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs hover:border-orange-500 cursor-pointer max-w-[150px]">
                            <option value="" disabled>Selecciona Edición</option>
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs hover:border-orange-500 cursor-pointer">
                            <option value="">🃏 Todos</option>
                            {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* Filtros Móvil */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 bg-slate-800 border-b border-slate-700 ${showFilters ? 'max-h-40 p-2' : 'max-h-0'}`}>
                    <div className="flex gap-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                            <option value="" disabled>Selecciona Edición</option>
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs"><option value="">🃏 Todos</option>{TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}</select>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-2 pb-20 md:pb-2 custom-scrollbar relative">
                        {loading ? <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div> : (
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                                {cartas.length > 0 ? cartas.map((carta) => (
                                    <div key={carta._id || carta.slug} className="relative group cursor-pointer animate-fade-in card-transition transform hover:-translate-y-1 hover:z-10" onClick={() => handleAdd(carta)}>
                                        <div className="rounded-xl overflow-hidden border-2 border-slate-800 relative bg-slate-800 shadow-lg group-hover:border-orange-500">
                                            <img src={getImg(carta)} alt={carta.name} className="w-full h-auto object-cover min-h-[100px]" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/250x350?text=No+Image"; }} />
                                            {mazo.filter(c => c.slug === carta.slug).length > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                    <div className="absolute inset-0 bg-black/20"></div>
                                                    <div className="animate-pop w-14 h-14 rounded-full bg-orange-600 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-white font-black text-2xl">{mazo.find(c => c.slug === carta.slug).cantidad}</div>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(carta); }} className="absolute top-1 right-1 z-20 bg-blue-600/90 hover:bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity">👁️</button>
                                        <h3 className="text-[9px] text-center text-slate-400 mt-1 truncate">{carta.name}</h3>
                                    </div>
                                )) : <div className="col-span-full text-center text-slate-500 mt-10">No se encontraron cartas.</div>}
                            </div>
                        )}
                        {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-20 right-4 bg-slate-800/80 p-2 rounded-full shadow-lg text-orange-500 animate-bounce">⬆</button>}
                    </div>
                </div>
            </div>

            {/* DERECHA: SIDEBAR PC */}
            <div className="hidden md:flex w-80 bg-slate-800 border-l border-slate-700 flex-col h-screen shadow-2xl z-20 relative">
                <div className="p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">🛡️ Mi Mazo</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${totalCartas === 50 ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-700 border-slate-600 text-orange-400'}`}>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {getSortedTypes().map(tipo => (
                        <div key={tipo} className="animate-fade-in">
                            <h3 className="text-orange-400 text-[10px] font-extrabold uppercase tracking-widest mb-1 border-b border-slate-700 pb-1 flex justify-between">{tipo} <span>{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span></h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[tipo].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center bg-slate-700/40 p-1.5 rounded hover:bg-slate-700 transition-all group border border-transparent hover:border-slate-600 animate-slide-in">
                                        <div className="flex items-center gap-2 overflow-hidden cursor-pointer w-full" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-900 text-orange-500 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] border border-slate-600 shadow-inner">{c.cantidad}</div>
                                            <span className="text-xs text-slate-200 truncate font-medium hover:text-orange-400 transition">{c.name}</span>
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
                <div className="p-4 border-t border-slate-700 bg-slate-800 z-10 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg shadow transition">👁️ Galería</button>
                    <button onClick={() => setModalGuardarOpen(true)} className={`w-full font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2 text-sm ${mazo.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-green-600 to-green-500 text-white'}`}>💾 Guardar</button>
                </div>
            </div>

            {/* MODAL GUARDAR: MEJORADO CON CHECKBOX PÚBLICO */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">{editingDeckId ? "Actualizar" : "Guardar Mazo"}</h3>
                        <input type="text" autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 text-white mb-6 focus:border-orange-500 outline-none" placeholder="Nombre del mazo..." />
                        
                        {/* --- CHECKBOX COMUNIDAD --- */}
                        <div className="flex items-center gap-3 mb-6 bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <input 
                                type="checkbox" 
                                id="isPublicCheck" 
                                checked={isPublic} 
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-5 h-5 accent-orange-600 cursor-pointer" 
                            />
                            <label htmlFor="isPublicCheck" className="cursor-pointer text-sm text-slate-300 select-none font-bold">Hacer público en la comunidad 🌍</label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-3 hover:text-white transition">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold transition disabled:opacity-50">{guardando ? "Guardando..." : "Confirmar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTROS MODALES (Galería, Zoom, Lista Móvil) - IGUALES A TU CÓDIGO */}
            {modalMazoOpen && <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-slide-up"><div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center"><h2 className="text-lg font-bold text-white">Galería Visual</h2><button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition">✕</button></div><div className="flex-1 overflow-y-auto p-4 bg-slate-900/80"><div ref={galleryRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-16 mt-4 pb-10">{mazo.map(c => <CardItem key={c.slug} carta={c} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom} />)}</div></div></div>}
            {cardToZoom && <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setCardToZoom(null)}><div className="relative max-w-lg w-full flex flex-col items-center"><img src={getImg(cardToZoom)} alt={cardToZoom.name} className="w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" /><button onClick={() => setCardToZoom(null)} className="absolute -top-12 right-0 text-white text-3xl">✕</button></div></div>}
            {showMobileList && <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end"><div className="bg-slate-900 rounded-t-xl h-[70vh] p-4 overflow-auto animate-slide-up"><div className="flex justify-between mb-4"><h3 className="text-white font-bold">Lista de Cartas</h3><button onClick={() => setShowMobileList(false)} className="text-white">✕</button></div>{getSortedTypes().map(t => (<div key={t} className="mb-4"><h4 className="text-orange-400 text-xs font-bold mb-2 uppercase">{t}</h4>{mazoAgrupado[t].map(c => (<div key={c.slug} className="flex justify-between text-white text-xs py-1 border-b border-slate-800"><span>{c.name}</span><span>x{c.cantidad}</span></div>))}</div>))}</div></div>}
        </div>
    );
}

function CardItem({ carta, onAdd, onRemove, onZoom }) {
    return (<div onClick={() => onZoom(carta)} className="cursor-pointer relative"><img src={getImg(carta)} className="w-full h-auto rounded shadow-lg" /><div className="absolute bottom-0 right-0 bg-black/80 text-orange-400 px-2 font-bold text-xs rounded-tl-lg">x{carta.cantidad}</div></div>);
}
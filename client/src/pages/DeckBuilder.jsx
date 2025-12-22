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

// --- HELPER IMÁGENES ---
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
    
    // Edición seleccionada por defecto vacía, pero se llenará automáticamente
    const [edicionSeleccionada, setEdicionSeleccionada] = useState(""); 
    
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null); 
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

    // 🔥 AUTOMATIZACIÓN CLAVE: Al cambiar el formato, selecciona automáticamente la primera edición
    useEffect(() => {
        const clavesEdiciones = Object.keys(edicionesActivas);
        if (clavesEdiciones.length > 0) {
            // Selecciona la primera edición disponible (ej: "kvsm_titanes")
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
        setCartas([]); // Limpia visualmente mientras carga la nueva edición automática
    };

    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollTop(container.scrollTop > 300);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => gridContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    // Carga inicial (desde Navbar o Editar)
    useEffect(() => {
        if (location.state && location.state.deckToEdit) {
            const deck = location.state.deckToEdit;
            setNombreMazo(deck.name);
            setEditingDeckId(deck._id);
            if(deck.format) setFormato(deck.format);
            const cartasCargadas = deck.cards.map(c => ({
                ...c, cantidad: c.quantity || 1, type: c.type, imgUrl: getImg(c)
            }));
            setMazo(cartasCargadas);
        } else if (location.state?.selectedFormat) {
            // Si viene del Navbar con formato, lo seteamos. El useEffect de arriba pondrá la edición.
            setFormato(location.state.selectedFormat);
            setCartas([]);
            setBusqueda("");
        }
        window.history.replaceState({}, document.title);
    }, []);

    // Buscador
    useEffect(() => {
        const fetchCartas = async () => {
            // Si no hay edición ni búsqueda, esperamos (para no cargar todo sin querer)
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

                console.log(`Buscando: ${BACKEND_URL}/api/cards/search?${params.toString()}`);
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

    // Manejadores
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
    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Escribe un nombre");
        const token = localStorage.getItem("token");
        if (!token) { alert("Inicia sesión"); navigate("/login"); return; }
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            const cardsPayload = mazo.map(c => ({ ...c, quantity: c.cantidad }));
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "auth-token": token }, body: JSON.stringify({ name: nombreMazo, cards: cardsPayload, format: formato }) });
            if (res.ok) { alert(editingDeckId ? "Actualizado" : "Guardado"); navigate("/my-decks"); } 
            else { const data = await res.json(); alert(data.error || "Error"); }
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
            
            {/* IZQUIERDA: PANEL CONTROL */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                {/* SWITCH FORMATO */}
                <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-center gap-4 shadow-inner">
                    <button onClick={() => cambiarFormato('imperio')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'imperio' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>🏛️ IMPERIO</button>
                    <button onClick={() => cambiarFormato('primer_bloque')} className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${formato === 'primer_bloque' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>📜 PRIMER BLOQUE</button>
                </div>
                
                {/* HEADER SEARCH */}
                <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2 shadow-md">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white">🔙</button>
                    <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-lg border md:hidden bg-slate-800 border-slate-700">⚙️</button>
                    <div className="flex-1 relative"><input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-orange-500 outline-none" /><span className="absolute left-3 top-2.5 text-slate-500">🔍</span></div>
                    
                    {/* FILTROS PC */}
                    <div className="hidden md:flex gap-2 ml-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer max-w-[150px]">
                            {/* Si no hay seleccionada, mostramos opción por defecto, aunque el efecto lo cambia rápido */}
                            <option value="" disabled>Selecciona Edición</option>
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer">
                            <option value="">🃏 Todos</option>
                            {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* FILTROS MOVIL */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 bg-slate-800 border-b border-slate-700 ${showFilters ? 'max-h-40 p-2' : 'max-h-0'}`}>
                    <div className="flex gap-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                            <option value="" disabled>Selecciona Edición</option>
                            {Object.entries(edicionesActivas).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs"><option value="">🃏 Todos</option>{TIPOS_FILTRO.map(t=><option key={t.id} value={t.value}>{t.label}</option>)}</select>
                    </div>
                </div>

                {/* GRID RESULTADOS */}
                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-2 pb-20 md:pb-2 custom-scrollbar relative">
                        {loading ? <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div> : (
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                                {cartas.length > 0 ? cartas.map(c => (
                                    <div key={c._id || c.slug} className="relative group cursor-pointer animate-fade-in hover:-translate-y-1" onClick={() => handleAdd(c)}>
                                        <div className="rounded-xl overflow-hidden border-2 border-slate-800 relative bg-slate-800 shadow-lg group-hover:border-orange-500">
                                            <img src={getImg(c)} alt={c.name} className="w-full h-auto object-cover min-h-[100px]" loading="lazy" onError={(e)=>{e.target.onerror=null;e.target.src="https://via.placeholder.com/250x350?text=No+Image"}}/>
                                            {mazo.filter(x=>x.slug===c.slug).length>0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold shadow border-2 border-white">{mazo.find(x=>x.slug===c.slug).cantidad}</div></div>}
                                        </div>
                                        <button onClick={(e)=>{e.stopPropagation();setCardToZoom(c)}} className="absolute top-1 right-1 z-20 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow">👁️</button>
                                        <h3 className="text-[9px] text-center text-slate-400 mt-1 truncate">{c.name}</h3>
                                    </div>
                                )) : <div className="col-span-full text-center text-slate-500 mt-10">Sin resultados</div>}
                            </div>
                        )}
                        {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-20 right-4 bg-slate-800 p-2 rounded-full shadow text-orange-500 animate-bounce">⬆</button>}
                    </div>
                </div>
            </div>

            {/* SIDEBAR PC */}
            <div className="hidden md:flex w-80 bg-slate-800 border-l border-slate-700 flex-col h-screen shadow-2xl z-20 relative">
               <div className="p-4 border-b border-slate-700"><h2 className="font-bold text-white">🛡️ Mi Mazo ({totalCartas}/50)</h2></div>
               <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                   {getSortedTypes().map(tipo => (
                       <div key={tipo} className="mb-2">
                           <h3 className="text-orange-400 text-xs font-bold border-b border-slate-700 mb-1">{tipo}</h3>
                           {mazoAgrupado[tipo].map(c => (
                               <div key={c.slug} className="flex justify-between items-center text-xs text-slate-300 py-1 hover:bg-slate-700 px-1 rounded cursor-pointer" onClick={()=>setCardToZoom(c)}>
                                   <span className="truncate flex-1">{c.cantidad} x {c.name}</span>
                                   <div className="flex gap-1"><button onClick={(e)=>{e.stopPropagation();handleAdd(c)}} className="text-green-400">+</button><button onClick={(e)=>{e.stopPropagation();handleRemove(c.slug)}} className="text-red-400">-</button></div>
                               </div>
                           ))}
                       </div>
                   ))}
               </div>
               <div className="p-4 border-t border-slate-700 flex flex-col gap-2">
                   <button onClick={()=>setModalMazoOpen(true)} className="w-full bg-blue-600 text-white text-xs py-2 rounded">👁️ Galería</button>
                   <button onClick={()=>setModalGuardarOpen(true)} className="w-full bg-green-600 text-white text-xs py-2 rounded">💾 Guardar</button>
               </div>
            </div>

            {/* FOOTER MOVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between">
                <div className="flex flex-col px-2"><span className="text-[9px] text-slate-400 font-bold">Cartas</span><span className="text-lg font-black text-white">{totalCartas}<span className="text-slate-600 text-xs">/50</span></span></div>
                <div className="flex gap-2">
                    <button onClick={()=>setShowMobileList(true)} className="bg-slate-800 text-white px-3 py-2 rounded font-bold text-xs">📋 Lista</button>
                    <button onClick={()=>{setModalMazoOpen(true);setVistaPorTipo(false)}} className="bg-blue-600 text-white px-3 py-2 rounded font-bold text-xs">👁️ Ver</button>
                    <button onClick={()=>setModalGuardarOpen(true)} className="bg-orange-600 text-white px-3 py-2 rounded font-bold text-xs">💾</button>
                </div>
            </div>

            {/* MODALES */}
            {modalMazoOpen && <div className="fixed inset-0 bg-slate-900 z-[100] p-4 overflow-auto animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold">Galería</h2>
                    <button onClick={()=>setModalMazoOpen(false)} className="text-white text-xl">✕</button>
                </div>
                <div ref={galleryRef} className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {mazo.map(c=><CardItem key={c.slug} carta={c} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom}/>)}
                </div>
            </div>}
            
            {modalGuardarOpen && <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
                <div className="bg-slate-800 p-6 rounded text-white border border-slate-600">
                    <h3>Guardar Mazo</h3>
                    <input autoFocus value={nombreMazo} onChange={e=>setNombreMazo(e.target.value)} className="w-full p-2 text-black rounded my-4" placeholder="Nombre..."/>
                    <div className="flex justify-end gap-2">
                        <button onClick={()=>setModalGuardarOpen(false)} className="text-slate-400 px-4">Cancelar</button>
                        <button onClick={handleSaveDeck} className="bg-orange-600 px-4 py-2 rounded font-bold">Confirmar</button>
                    </div>
                </div>
            </div>}

            {showMobileList && <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end">
                <div className="bg-slate-900 rounded-t-xl h-[70vh] p-4 overflow-auto">
                    <div className="flex justify-between mb-4"><h3 className="text-white font-bold">Lista</h3><button onClick={()=>setShowMobileList(false)} className="text-white">✕</button></div>
                    {getSortedTypes().map(t=><div key={t} className="mb-4"><h4 className="text-orange-400 text-xs font-bold mb-2">{t}</h4>{mazoAgrupado[t].map(c=><div key={c.slug} className="flex justify-between text-white text-xs py-1 border-b border-slate-800"><span>{c.name}</span><span>x{c.cantidad}</span></div>)}</div>)}
                </div>
            </div>}

            {cardToZoom && <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4" onClick={()=>setCardToZoom(null)}>
                <img src={getImg(cardToZoom)} className="max-h-full max-w-full rounded shadow-[0_0_30px_rgba(255,100,0,0.3)]" />
            </div>}
        </div>
    );
}

function CardItem({ carta, onAdd, onRemove, onZoom }) {
    return (
        <div onClick={()=>onZoom(carta)} className="cursor-pointer relative">
            <img src={getImg(carta)} className="w-full h-auto rounded"/>
            <div className="absolute bottom-0 right-0 bg-black/80 text-white px-2 font-bold text-xs">x{carta.cantidad}</div>
        </div>
    );
}
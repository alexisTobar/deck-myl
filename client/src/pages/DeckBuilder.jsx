import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config"; 

// --- CONFIGURACIÓN ---
const EDICIONES = {
    "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", 
    "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", 
    "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", 
    "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", 
    "espiritu_samurai": "Espíritu Samurai"
};

const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };
const TIPOS_FILTRO = [ { id: 1, label: "Aliado", value: 1 }, { id: 2, label: "Talismán", value: 2 }, { id: 3, label: "Arma", value: 3 }, { id: 4, label: "Tótem", value: 4 }, { id: 5, label: "Oro", value: 5 } ];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

// --- ESTILOS DE ANIMACIÓN ---
const animationStyles = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-slide-in {
    animation: slideInRight 0.3s ease-out forwards;
  }
  .card-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    // --- ESTADO DE COLUMNAS (GRID DINÁMICO) ---
    // Detectamos si es móvil (pantalla < 768px) para empezar con 3, si es PC con 5.
    const [gridColumns, setGridColumns] = useState(window.innerWidth < 768 ? 3 : 5);

    // Estados Generales
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("kvsm_titanes");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    
    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false); 
    const [vistaPorTipo, setVistaPorTipo] = useState(true);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [nombreMazo, setNombreMazo] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [cardToZoom, setCardToZoom] = useState(null);

    // Scroll Top
    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollTop(container.scrollTop > 300);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToTop = () => gridContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar mazo a editar
    useEffect(() => {
        if (location.state && location.state.deckToEdit) {
            const deck = location.state.deckToEdit;
            setNombreMazo(deck.name);
            setEditingDeckId(deck._id);
            const cartasCargadas = deck.cards.map(c => ({ ...c, cantidad: c.quantity, type: c.type }));
            setMazo(cartasCargadas);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Buscador con CACHÉ
    useEffect(() => {
        const fetchCartas = async () => {
            if (!busqueda && !edicionSeleccionada && !tipoSeleccionado) { setCartas([]); return; }
            
            const cacheKey = `search-${busqueda}-${edicionSeleccionada}-${tipoSeleccionado}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) { setCartas(JSON.parse(cachedData)); return; }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (busqueda) params.append("q", busqueda);
                if (edicionSeleccionada) params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(data);
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        const timer = setTimeout(() => { fetchCartas(); }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado]);

    // Lógica Mazo
    const handleAdd = (carta) => {
        const existe = mazo.find(c => c.slug === carta.slug);
        const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);
        if (totalCartas >= 50 && !existe) return alert("Mazo lleno (50 cartas)");
        if (existe) {
            if (existe.cantidad < 3) { existe.cantidad++; setMazo([...mazo]); }
        } else {
            const nombreTipo = TIPOS_ID_TO_NAME[carta.type] || carta.type || "Otros";
            setMazo([...mazo, { ...carta, type: nombreTipo, cantidad: 1 }]);
        }
    };
    const handleRemove = (slug) => {
        const newMazo = mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0);
        setMazo(newMazo);
    };

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Escribe un nombre para tu mazo");
        const token = localStorage.getItem("token");
        if (!token) { alert("Inicia sesión para guardar"); navigate("/login"); return; }
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ name: nombreMazo, cards: mazo })
            });
            if (res.ok) {
                alert(editingDeckId ? "¡Mazo actualizado! 🔄" : "¡Mazo guardado! 🎉");
                setMazo([]); setNombreMazo(""); setEditingDeckId(null); setModalGuardarOpen(false);
            } else {
                const data = await res.json(); alert(data.error || "Error al guardar");
            }
        } catch (error) { console.error(error); alert("Error de conexión"); } finally { setGuardando(false); }
    };

    // Captura
    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        await new Promise(r => setTimeout(r, 200));
        try {
            const node = galleryRef.current;
            const width = node.scrollWidth + 40; const height = node.scrollHeight + 100;
            const dataUrl = await toPng(node, {
                quality: 1.0, backgroundColor: '#0f172a', width: width, height: height,
                style: { transform: 'none', overflow: 'visible', maxHeight: 'none', maxWidth: 'none', width: `${width}px`, height: `${height}px`, margin: '0', padding: '20px' },
                filter: (child) => !child.classList?.contains('hide-on-capture')
            });
            const link = document.createElement('a');
            link.download = `${nombreMazo ? nombreMazo.replace(/\s+/g, '-') : "MiMazo"}-DeckMyL.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error('Error al capturar:', err); alert('Error al generar imagen.'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const grupos = {};
        mazo.forEach(carta => { const tipo = carta.type || "Otros"; if (!grupos[tipo]) grupos[tipo] = []; grupos[tipo].push(carta); });
        return grupos;
    }, [mazo]);

    const getSortedTypes = () => {
        const tiposEnMazo = Object.keys(mazoAgrupado);
        return ORDER_TYPES.filter(t => tiposEnMazo.includes(t)).concat(tiposEnMazo.filter(t => !ORDER_TYPES.includes(t)));
    };

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-slate-900 text-white overflow-hidden">
            <style>{animationStyles}</style>

            {/* ================= IZQUIERDA: GRID DE CARTAS ================= */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                
                {/* Header Compacto */}
                <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2 shadow-md">
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border md:hidden ${showFilters ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </button>
                    
                    <div className="flex-1 relative">
                        <input type="text" placeholder="Buscar carta..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-orange-500 focus:outline-none transition-all focus:bg-slate-700" />
                        <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                    </div>

                    {/* --- CONTROLES DE ZOOM (+ / -) --- */}
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700 shadow-sm ml-1">
                        <button 
                            onClick={() => setGridColumns(prev => Math.max(2, prev - 1))} 
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white rounded font-bold transition text-lg"
                            title="Cartas más grandes"
                        >
                            -
                        </button>
                        <span className="text-xs font-bold text-slate-500 w-4 text-center select-none">
                            {gridColumns}
                        </span>
                        <button 
                            onClick={() => setGridColumns(prev => Math.min(8, prev + 1))} 
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white rounded font-bold transition text-lg"
                            title="Cartas más pequeñas"
                        >
                            +
                        </button>
                    </div>

                    {/* Filtros PC */}
                    <div className="hidden md:flex gap-2 ml-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs hover:border-orange-500 transition cursor-pointer">
                            <option value="">📚 Ediciones</option>
                            {Object.entries(EDICIONES).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs hover:border-orange-500 transition cursor-pointer">
                            <option value="">🃏 Tipos</option>
                            {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* Filtros Móvil */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 bg-slate-800 border-b border-slate-700 ${showFilters ? 'max-h-40 p-2' : 'max-h-0'}`}>
                    <div className="flex gap-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                            <option value="">📚 Todas</option>
                            {Object.entries(EDICIONES).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                            <option value="">🃏 Todos</option>
                            {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                        </select>
                    </div>
                </div>

                {/* Area Cartas */}
                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-2 pb-20 md:pb-2 custom-scrollbar relative">
                        {loading ? (
                            <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div>
                        ) : (
                            // GRID DINÁMICO: Usamos 'style' para el control preciso de columnas
                            <div 
                                className="grid gap-2 transition-all duration-300 ease-in-out"
                                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
                            >
                                {cartas.map((carta) => (
                                    <div key={carta._id} className="relative group cursor-pointer animate-fade-in card-transition transform hover:-translate-y-1 hover:z-10" onClick={() => handleAdd(carta)}>
                                        
                                        <div className="rounded overflow-hidden border border-slate-800 relative bg-slate-800 shadow-sm group-hover:shadow-orange-500/30 group-hover:border-orange-500 transition-all">
                                            <img src={carta.imgUrl} alt={carta.name} className="w-full h-auto object-cover" loading="lazy" />
                                            
                                            {/* Contador */}
                                            {mazo.filter(c => c.slug === carta.slug).length > 0 && (
                                                <div className="absolute top-0 left-0 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-br-lg shadow-md z-10 animate-bounce">
                                                    {mazo.find(c => c.slug === carta.slug).cantidad}
                                                </div>
                                            )}

                                            {/* Overlay PC */}
                                            <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 items-center justify-center transition-opacity z-10 pointer-events-none">
                                                <span className="text-white font-bold text-3xl drop-shadow-md">+</span>
                                            </div>
                                        </div>

                                        {/* BOTÓN DE ZOOM CON LUPA */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setCardToZoom(carta); }}
                                            className="absolute top-1 right-1 z-20 bg-blue-600/90 hover:bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>

                                        <h3 className="text-[9px] sm:text-[10px] text-center text-slate-400 mt-1 truncate group-hover:text-orange-400 transition-colors">{carta.name}</h3>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {showScrollTop && (
                            <button onClick={scrollToTop} className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-slate-800/80 backdrop-blur border border-slate-600 p-2 rounded-full shadow-lg text-orange-500 hover:bg-slate-700 transition animate-bounce">
                                ⬆
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= SOLO MÓVIL: FOOTER PEGAJOSO ================= */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-3 pb-4 z-50 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cartas</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>
                        {totalCartas}<span className="text-slate-600 text-sm">/50</span>
                    </span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setModalMazoOpen(true)} disabled={mazo.length === 0} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition shadow-lg disabled:opacity-50">
                        Ver Mazo
                    </button>
                    <button onClick={() => setModalGuardarOpen(true)} disabled={mazo.length === 0} className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide transition shadow-lg disabled:opacity-50 ${mazo.length === 0 ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'}`}>
                        Guardar
                    </button>
                </div>
            </div>

             {/* ================= SOLO DESKTOP: SIDEBAR LATERAL ================= */}
            <div className="hidden md:flex w-80 bg-slate-800 border-l border-slate-700 flex-col h-screen shadow-2xl z-20 relative">
                <div className="p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur shadow-md z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>🛡️ Mi Mazo</span></h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${totalCartas === 50 ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-700 border-slate-600 text-orange-400'}`}>
                        {totalCartas} / 50
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {mazo.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60"><span className="text-4xl mb-2">🎴</span><p className="text-sm font-medium">Vacío</p></div>
                    ) : (
                        getSortedTypes().map(tipo => (
                            <div key={tipo} className="animate-fade-in">
                                <h3 className="text-orange-400 text-[10px] font-extrabold uppercase tracking-widest mb-1 border-b border-slate-700 pb-1 flex justify-between">
                                    {tipo} <span>{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span>
                                </h3>
                                <ul className="space-y-1">
                                    {mazoAgrupado[tipo].map(c => (
                                        <li key={c.slug} className="flex justify-between items-center bg-slate-700/40 p-1.5 rounded hover:bg-slate-700 transition-all group border border-transparent hover:border-slate-600 animate-slide-in">
                                            <div className="flex items-center gap-2 overflow-hidden cursor-pointer w-full" onClick={() => setCardToZoom(c)}>
                                                <div className="bg-slate-900 text-orange-500 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] border border-slate-600 shadow-inner">{c.cantidad}</div>
                                                <span className="text-xs text-slate-200 truncate font-medium hover:text-orange-400 transition">{c.name}</span>
                                            </div>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition gap-1">
                                                <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs disabled:opacity-30">+</button>
                                                <button onClick={() => handleRemove(c.slug)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs">-</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800 z-10 flex flex-col gap-2">
                     <button onClick={() => setModalMazoOpen(true)} disabled={mazo.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg shadow transition flex justify-center items-center gap-2 disabled:opacity-50 hover:scale-[1.02]">
                        👁️ Galería / Captura
                    </button>
                    <button onClick={() => setModalGuardarOpen(true)} disabled={mazo.length === 0} className={`w-full font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:transform-none ${mazo.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 text-white'}`}>
                        {editingDeckId ? "💾 Actualizar" : "💾 Guardar"}
                    </button>
                </div>
            </div>

            {/* ================= MODALES ================= */}
            
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-slide-up">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-lg">
                        <h2 className="text-lg font-bold text-white flex gap-2 items-center"><span className="text-orange-500">❖</span> Lista de Mazo</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition">✕</button>
                    </div>
                    <div className="hidden md:flex p-2 bg-slate-900/50 justify-center gap-2 border-b border-slate-800">
                         <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setVistaPorTipo(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${vistaPorTipo ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>POR TIPO</button>
                            <button onClick={() => setVistaPorTipo(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${!vistaPorTipo ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>TODO</button>
                        </div>
                         {!vistaPorTipo && ( <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 text-white px-3 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-blue-500 transition">{guardando ? '⏳' : '📸 FOTO'}</button> )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-900/80">
                        <div ref={galleryRef} className="galeria-content max-w-3xl mx-auto pb-10">
                            {mazo.length === 0 ? ( <div className="text-center py-20 text-slate-500">Tu mazo está vacío</div> ) : (
                                vistaPorTipo ? (
                                    getSortedTypes().map(tipo => (
                                        <div key={tipo} className="mb-8 animate-fade-in">
                                            <h3 className="text-orange-400 font-bold border-b border-slate-700 mb-4 pb-1 flex justify-between text-sm uppercase tracking-wider">{tipo} <span>{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span></h3>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                {mazoAgrupado[tipo].map(carta => <CardItem key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom} />)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 animate-fade-in">
                                        {mazo.map(carta => <CardItem key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom} />)}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-4">{editingDeckId ? "Actualizar" : "Guardar Mazo"}</h3>
                        <input type="text" autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 text-white mb-6 focus:border-orange-500 outline-none" placeholder="Nombre del mazo..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-3 hover:text-white transition">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold transition disabled:opacity-50">{guardando ? "Guardando..." : "Confirmar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {cardToZoom && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setCardToZoom(null)}>
                    <div className="relative max-w-lg w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img src={cardToZoom.imgUrl} alt={cardToZoom.name} className="w-full max-h-[70vh] object-contain rounded-lg shadow-[0_0_50px_rgba(255,100,0,0.3)]" />
                        
                        <div className="mt-6 flex items-center gap-6">
                             <button onClick={() => { handleRemove(cardToZoom.slug); setCardToZoom(null); }} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 text-red-500 text-2xl font-bold flex items-center justify-center hover:bg-red-900/50 transition">-</button>
                             <div className="text-white font-bold flex flex-col items-center">
                                 <span className="text-orange-500 text-sm tracking-widest uppercase">CANTIDAD</span>
                                 <span className="text-3xl">{mazo.find(c => c.slug === cardToZoom.slug)?.cantidad || 0}</span>
                             </div>
                             <button onClick={() => { handleAdd(cardToZoom); }} disabled={(mazo.find(c => c.slug === cardToZoom.slug)?.cantidad || 0) >= 3} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 text-green-500 text-2xl font-bold flex items-center justify-center hover:bg-green-900/50 transition disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                        </div>
                        
                        <button onClick={() => setCardToZoom(null)} className="absolute -top-12 right-0 md:-right-12 text-white text-3xl opacity-70 hover:opacity-100 transition">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CardItem({ carta, onAdd, onRemove, onZoom }) {
    const copias = Array.from({ length: carta.cantidad });
    const offset = 20; 
    const totalHeight = 150 + ((carta.cantidad - 1) * offset);
    return (
        <div className="relative w-full select-none animate-fade-in" style={{ height: `${totalHeight}px` }} onClick={() => onZoom(carta)}>
             {copias.map((_, index) => {
                const isTop = index === copias.length - 1;
                return (
                    <div key={index} className="absolute top-0 left-0 w-full rounded border border-slate-800 overflow-hidden bg-slate-800 shadow-sm" style={{ transform: `translateY(${index * offset}px)`, zIndex: index }}>
                        <img src={carta.imgUrl} alt={carta.name} crossOrigin="anonymous" className="w-full h-auto block" />
                        {isTop && (
                            <div className="hide-on-capture absolute bottom-0 left-0 right-0 bg-black/70 p-1 flex justify-center gap-3 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); onRemove(carta.slug); }} className="text-red-400 font-bold text-lg leading-none w-6 h-6 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition">-</button>
                                <span className="font-bold text-orange-500 text-sm">{carta.cantidad}</span>
                                <button onClick={(e) => { e.stopPropagation(); onAdd(carta); }} disabled={carta.cantidad >= 3} className={`font-bold text-lg leading-none w-6 h-6 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition ${carta.cantidad >= 3 ? 'text-slate-500 cursor-not-allowed' : 'text-green-400'}`}>+</button>
                            </div>
                        )}
                    </div>
                )
             })}
        </div>
    );
}
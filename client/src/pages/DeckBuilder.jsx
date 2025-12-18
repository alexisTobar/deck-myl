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

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    // Estados
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    
    // UI States
    const [showFilters, setShowFilters] = useState(false); // Para mostrar/ocultar filtros en móvil
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

    // Buscador con CACHÉ LOCAL
    useEffect(() => {
        const fetchCartas = async () => {
            if (!busqueda && !edicionSeleccionada && !tipoSeleccionado) { setCartas([]); return; }
            
            const cacheKey = `search-${busqueda}-${edicionSeleccionada}-${tipoSeleccionado}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                setCartas(JSON.parse(cachedData));
                return; 
            }

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

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        await new Promise(r => setTimeout(r, 200));

        try {
            const node = galleryRef.current;
            const width = node.scrollWidth + 40; 
            const height = node.scrollHeight + 100;

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
        <div className="h-screen flex flex-col font-sans bg-slate-900 text-white overflow-hidden">
            
            {/* --- HEADER COMPACTO (Estilo App) --- */}
            <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2 shadow-md">
                <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border ${showFilters ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </button>
                <div className="flex-1 relative">
                    <input type="text" placeholder="Buscar carta..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:border-orange-500 focus:outline-none" />
                    <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                </div>
            </div>

            {/* --- FILTROS DESPLEGABLES --- */}
            <div className={`overflow-hidden transition-all duration-300 bg-slate-800 border-b border-slate-700 ${showFilters ? 'max-h-40 p-2' : 'max-h-0'}`}>
                <div className="flex gap-2">
                    <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                        <option value="">📚 Todas las Ediciones</option>
                        {Object.entries(EDICIONES).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                    <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="flex-1 p-2 rounded bg-slate-900 border border-slate-600 text-xs">
                        <option value="">🃏 Todos los Tipos</option>
                        {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                    </select>
                </div>
            </div>

            {/* --- AREA PRINCIPAL (GRID 3 COLUMNAS) --- */}
            <div className="flex-1 flex overflow-hidden">
                <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-2 pb-24 custom-scrollbar relative">
                    {loading ? (
                        <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div>
                    ) : (
                        // AQUÍ ESTÁ LA CLAVE: grid-cols-3 para móvil
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                            {cartas.map((carta) => (
                                <div key={carta._id} className="relative group cursor-pointer animate-fade-in" onClick={() => handleAdd(carta)}>
                                    <div className="rounded overflow-hidden border border-slate-800 relative bg-slate-800 shadow-sm">
                                        <img src={carta.imgUrl} alt={carta.name} className="w-full h-auto object-cover" loading="lazy" />
                                        {/* Contador pequeño sobre la carta si ya está en el mazo */}
                                        {mazo.filter(c => c.slug === carta.slug).length > 0 && (
                                            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg shadow-md">
                                                {mazo.find(c => c.slug === carta.slug).cantidad}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-[9px] sm:text-[10px] text-center text-slate-400 mt-1 truncate">{carta.name}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Botón Flotante Scroll Top */}
                    {showScrollTop && (
                        <button onClick={scrollToTop} className="fixed bottom-20 right-4 z-40 bg-slate-800/80 backdrop-blur border border-slate-600 p-2 rounded-full shadow-lg text-orange-500">
                            ⬆
                        </button>
                    )}
                </div>
            </div>

            {/* --- STICKY FOOTER (BARRA INFERIOR FIJA) --- */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 pb-5 z-50 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                {/* Contador */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cartas</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>
                        {totalCartas}<span className="text-slate-600 text-sm">/50</span>
                    </span>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => setModalMazoOpen(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-full font-bold transition shadow-lg"
                    >
                        <span className="text-xl">👁️</span> <span className="text-sm">Ver Mazo</span>
                    </button>
                    
                    <button 
                        onClick={() => setModalGuardarOpen(true)}
                        disabled={mazo.length === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-lg text-sm ${mazo.length === 0 ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'}`}
                    >
                        💾 Guardar
                    </button>
                </div>
            </div>

            {/* --- MODAL PANTALLA COMPLETA (VER MAZO) --- */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-slide-up">
                    {/* Header Modal */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-lg">
                        <h2 className="text-lg font-bold text-white flex gap-2 items-center"><span className="text-orange-500">❖</span> Lista de Mazo</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white">✕</button>
                    </div>

                    {/* Controles Modal */}
                    <div className="p-2 bg-slate-900/50 flex justify-center gap-2 border-b border-slate-800">
                         <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setVistaPorTipo(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold ${vistaPorTipo ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>POR TIPO</button>
                            <button onClick={() => setVistaPorTipo(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold ${!vistaPorTipo ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>TODO</button>
                        </div>
                         {/* Botón Captura */}
                         {!vistaPorTipo && (
                            <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 text-white px-3 rounded-lg font-bold text-xs flex items-center gap-1">
                                {guardando ? '⏳' : '📸 FOTO'}
                            </button>
                        )}
                    </div>

                    {/* Lista Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-900/80">
                        <div ref={galleryRef} className="galeria-content max-w-2xl mx-auto pb-10">
                            {mazo.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">Tu mazo está vacío</div>
                            ) : (
                                vistaPorTipo ? (
                                    getSortedTypes().map(tipo => (
                                        <div key={tipo} className="mb-8">
                                            <h3 className="text-orange-400 font-bold border-b border-slate-700 mb-4 pb-1 flex justify-between text-sm uppercase tracking-wider">
                                                {tipo} <span>{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span>
                                            </h3>
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                {mazoAgrupado[tipo].map(carta => <CardItem key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom} />)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                        {mazo.map(carta => <CardItem key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} onZoom={setCardToZoom} />)}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL GUARDAR --- */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">{editingDeckId ? "Actualizar" : "Guardar Mazo"}</h3>
                        <input type="text" autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 text-white mb-6 focus:border-orange-500 outline-none" placeholder="Nombre..." />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-3">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando} className="bg-orange-600 text-white px-5 py-2 rounded-lg font-bold">{guardando ? "..." : "Confirmar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ZOOM --- */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4" onClick={() => setCardToZoom(null)}>
                    <img src={cardToZoom.imgUrl} alt={cardToZoom.name} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-[0_0_30px_rgba(255,100,0,0.3)]" />
                    <button className="absolute top-4 right-4 text-white text-3xl opacity-70">✕</button>
                </div>
            )}
        </div>
    );
}

// Subcomponente de Carta para el Modal de Mazo
function CardItem({ carta, onAdd, onRemove, onZoom }) {
    const copias = Array.from({ length: carta.cantidad });
    // Offset vertical para simular pila
    const offset = 20; 
    const totalHeight = 150 + ((carta.cantidad - 1) * offset);

    return (
        <div className="relative w-full select-none" style={{ height: `${totalHeight}px` }} onClick={() => onZoom(carta)}>
             {copias.map((_, index) => {
                const isTop = index === copias.length - 1;
                return (
                    <div key={index} className="absolute top-0 left-0 w-full rounded border border-slate-800 overflow-hidden bg-slate-800" style={{ transform: `translateY(${index * offset}px)`, zIndex: index }}>
                        <img src={carta.imgUrl} alt={carta.name} crossOrigin="anonymous" className="w-full h-auto block" />
                        {isTop && (
                            <div className="hide-on-capture absolute bottom-0 left-0 right-0 bg-black/70 p-1 flex justify-center gap-3 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); onRemove(carta.slug); }} className="text-red-400 font-bold text-lg leading-none w-6 h-6 flex items-center justify-center bg-white/10 rounded">-</button>
                                <span className="font-bold text-orange-500 text-sm">{carta.cantidad}</span>
                                <button onClick={(e) => { e.stopPropagation(); onAdd(carta); }} disabled={carta.cantidad >= 3} className={`font-bold text-lg leading-none w-6 h-6 flex items-center justify-center bg-white/10 rounded ${carta.cantidad >= 3 ? 'text-slate-500' : 'text-green-400'}`}>+</button>
                            </div>
                        )}
                    </div>
                )
             })}
        </div>
    );
}

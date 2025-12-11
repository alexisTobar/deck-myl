import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
// 1. IMPORTAR LA VARIABLE DE CONFIGURACIÓN
import BACKEND_URL from "../config"; 

// --- CONFIGURACIÓN ---
const EDICIONES = {
    "kvsm_titanes": "KVSM Titanes",
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

const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };
const TIPOS_FILTRO = [
    { id: 1, label: "Aliado", value: 1 },
    { id: 2, label: "Talismán", value: 2 },
    { id: 3, label: "Arma", value: 3 },
    { id: 4, label: "Tótem", value: 4 },
    { id: 5, label: "Oro", value: 5 }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

export default function DeckBuilder() { // Renombrado a DeckBuilder para ser consistente
    const navigate = useNavigate();
    const location = useLocation();
    
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [vistaPorTipo, setVistaPorTipo] = useState(true);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [nombreMazo, setNombreMazo] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [cardToZoom, setCardToZoom] = useState(null);

    // --- EFECTOS ---
    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        const handleScroll = () => setShowScrollTop(container.scrollTop > 300);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        gridContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // Buscador
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!busqueda && !edicionSeleccionada && !tipoSeleccionado) { setCartas([]); return; }
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (busqueda) params.append("q", busqueda);
                if (edicionSeleccionada) params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                
                // 2. CORRECCIÓN VITAL: USAR BACKEND_URL AQUÍ
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                
                const data = await res.json();
                setCartas(data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado]);

    // Lógica Mazo
    const handleAdd = (carta) => {
        const existe = mazo.find(c => c.slug === carta.slug);
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

    // Guardar Mazo
    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Escribe un nombre para tu mazo");
        const token = localStorage.getItem("token");
        if (!token) { alert("Inicia sesión para guardar"); navigate("/login"); return; }

        setGuardando(true);
        try {
            // 3. CORRECCIÓN VITAL: USAR BACKEND_URL AQUÍ TAMBIÉN
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

    // --- CAPTURA ---
    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        await new Promise(r => setTimeout(r, 200));

        try {
            const node = galleryRef.current;
            const width = node.scrollWidth + 40; 
            const height = node.scrollHeight + 100;

            const dataUrl = await toPng(node, {
                quality: 1.0,
                backgroundColor: '#0f172a',
                width: width,
                height: height,
                style: {
                    transform: 'none',
                    overflow: 'visible',
                    maxHeight: 'none',
                    maxWidth: 'none',
                    width: `${width}px`,
                    height: `${height}px`,
                    margin: '0',
                    padding: '20px'
                },
                filter: (child) => !child.classList?.contains('hide-on-capture')
            });

            const link = document.createElement('a');
            link.download = `${nombreMazo ? nombreMazo.replace(/\s+/g, '-') : "MiMazo"}-DeckMyL.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error al capturar:', err);
            alert('Error al generar la imagen. Intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
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

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-slate-900">
            {/* IZQUIERDA: CONSTRUCTOR */}
            <div className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
                <div className="p-4 md:p-6 pb-0 z-20 bg-slate-900 shadow-md">
                    <div className="animate-fade-in">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6 drop-shadow-md tracking-tight">
                            {editingDeckId ? "✏️ Editando Mazo" : "Constructor de Mazos"}
                        </h1>
                        <div className="flex flex-col md:flex-row gap-3 mb-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
                            <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition w-full md:w-auto shadow-sm">
                                <option value="">📚 Ediciones</option>
                                {Object.entries(EDICIONES).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                            </select>
                            <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition w-full md:w-auto shadow-sm">
                                <option value="">🃏 Tipos</option>
                                {TIPOS_FILTRO.map((t) => (<option key={t.id} value={t.value}>{t.label}</option>))}
                            </select>
                            <div className="flex-1 relative">
                                <input type="text" placeholder="🔍 Buscar carta..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-10 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder-slate-500 shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
                <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 custom-scrollbar relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center mt-20 gap-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 shadow-lg shadow-orange-500/20"></div>
                            <p className="text-orange-400 font-bold animate-pulse">Invocando cartas...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-20">
                            {cartas.map((carta, index) => (
                                <div key={carta._id} className="relative group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 0.02}s` }}>
                                    <div className="card-hover-effect rounded-lg overflow-hidden shadow-lg border border-slate-800 bg-slate-800 relative" onClick={() => handleAdd(carta)}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none"></div>
                                        <img src={carta.imgUrl} alt={carta.name} className="w-full h-auto object-cover" loading="lazy" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 z-20 bg-black/60 backdrop-blur-[1px]">
                                            <span className="bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg transform scale-0 group-hover:scale-100 transition duration-300 delay-75">+</span>
                                            <button onClick={(e) => { e.stopPropagation(); setCardToZoom(carta); }} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition duration-300 delay-100" title="Ver carta en grande">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-1 px-0.5 text-center leading-tight">
                                        <h3 className="text-[10px] font-bold truncate text-gray-300 group-hover:text-orange-400 transition">{carta.name}</h3>
                                    </div>
                                </div>
                            ))}
                            {cartas.length === 0 && (busqueda || edicionSeleccionada || tipoSeleccionado) && !loading && (
                                <div className="col-span-full text-center p-10 bg-slate-800/50 rounded-2xl border border-dashed border-slate-600">
                                    <p className="text-xl text-slate-400">🔮 No se encontraron cartas con esos filtros.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {showScrollTop && (
                        <button onClick={scrollToTop} className="fixed bottom-8 right-[22rem] z-50 bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-full shadow-2xl transition transform hover:scale-110 animate-fade-in border-2 border-orange-400" title="Volver Arriba">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* DERECHA: SIDEBAR */}
            <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-screen shadow-2xl z-20 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 pointer-events-none -z-10"></div>
                <div className="p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur shadow-md z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm"><span>🛡️ Mi Mazo</span></h2>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${mazo.reduce((acc, c) => acc + c.cantidad, 0) === 50 ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-700 border-slate-600 text-orange-400'}`}>
                            {mazo.reduce((acc, c) => acc + c.cantidad, 0)} / 50
                        </span>
                    </div>
                    <button onClick={() => setModalMazoOpen(true)} disabled={mazo.length === 0} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg transition transform hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        👁️ Ver Galería Visual
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {mazo.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <span className="text-4xl mb-2">🎴</span>
                            <p className="text-sm font-medium">El mazo está vacío.</p>
                        </div>
                    ) : (
                        getSortedTypes().map(tipo => (
                            <div key={tipo} className="animate-fade-in">
                                <h3 className="text-orange-400 text-[10px] font-extrabold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 flex justify-between">
                                    {tipo} <span>{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span>
                                </h3>
                                <ul className="space-y-1.5">
                                    {mazoAgrupado[tipo].map(c => (
                                        <li key={c.slug} className="flex justify-between items-center bg-slate-700/40 p-1.5 rounded hover:bg-slate-700 transition group border border-transparent hover:border-slate-600">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="bg-slate-900 text-orange-500 font-bold w-5 h-5 flex items-center justify-center rounded text-[10px] border border-slate-600 shadow-inner">{c.cantidad}</div>
                                                <span className="text-xs text-slate-200 truncate font-medium">{c.name}</span>
                                            </div>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition gap-1">
                                                <button onClick={() => handleAdd(c)} className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs">+</button>
                                                <button onClick={() => handleRemove(c.slug)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white w-5 h-5 rounded flex items-center justify-center transition font-bold text-xs">-</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-slate-700 bg-slate-800 z-10">
                    <button onClick={() => setModalGuardarOpen(true)} disabled={mazo.length === 0} className={`btn-epic w-full font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-1 flex justify-center items-center gap-2 text-sm ${mazo.length === 0 ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 text-white'}`}>
                        {editingDeckId ? "💾 Actualizar Mazo" : "💾 Guardar Mazo"}
                    </button>
                    {editingDeckId && (
                        <button onClick={() => { setEditingDeckId(null); setMazo([]); setNombreMazo(""); navigate("/"); }} className="w-full mt-2 text-slate-400 text-xs hover:text-white underline transition">
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </div>

            {/* MODAL ZOOM */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-zoom-out" onClick={() => setCardToZoom(null)}>
                    <div className="relative max-w-[90vh] max-h-[90vh] flex flex-col items-center">
                        <img src={cardToZoom.imgUrl} alt={cardToZoom.name} className="max-w-full max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(234,88,12,0.5)] border-2 border-orange-500/50 object-contain transform transition-transform hover:scale-105 duration-300" onClick={(e) => e.stopPropagation()} />
                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold text-white tracking-wide text-shadow">{cardToZoom.name}</h2>
                            <p className="text-orange-400 text-sm font-bold uppercase tracking-widest">{TIPOS_ID_TO_NAME[cardToZoom.type] || "Carta"}</p>
                        </div>
                        <button onClick={() => setCardToZoom(null)} className="absolute -top-10 right-0 text-white hover:text-orange-500 font-bold text-2xl transition">✕</button>
                    </div>
                </div>
            )}

            {/* MODAL GALERÍA VISUAL */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col animate-fade-in backdrop-blur-sm">
                    <div className="p-4 flex justify-between items-center border-b border-slate-700 bg-slate-900 shadow-xl">
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><span className="text-orange-500">❖</span> Galería Visual</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                                <button onClick={() => setVistaPorTipo(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${vistaPorTipo ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>POR TIPO</button>
                                <button onClick={() => setVistaPorTipo(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${!vistaPorTipo ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>TODO</button>
                            </div>
                            
                            {!vistaPorTipo && (
                                <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" title="Descargar imagen del mazo completo">
                                    {guardando ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                </button>
                            )}

                            <button onClick={() => setModalMazoOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center transition text-xl font-bold">✕</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50">
                        <div ref={galleryRef} className="galeria-content max-w-7xl mx-auto pb-20">
                            {vistaPorTipo ? (
                                getSortedTypes().map(tipo => (
                                    <div key={tipo} className="mb-16 animate-fade-in">
                                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-8 border-b border-slate-700 pb-2 flex items-center gap-3">
                                            {tipo} <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">{mazoAgrupado[tipo].reduce((a, c) => a + c.cantidad, 0)}</span>
                                        </h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-8 justify-start">
                                            {mazoAgrupado[tipo].map(carta => <CardItemRealStack key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} />)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-8 justify-center mt-8 animate-fade-in">
                                    {mazo.map(carta => <CardItemRealStack key={carta.slug} carta={carta} onAdd={handleAdd} onRemove={handleRemove} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            {editingDeckId ? "🔄 Actualizar Mazo" : "💾 Guardar Mazo"}
                        </h2>
                        <div className="mb-6">
                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nombre del Mazo</label>
                            <input type="text" autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-4 rounded-xl bg-slate-900 border border-slate-600 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder-slate-600 transition shadow-inner" placeholder="Ej: Dragones del Norte" />
                        </div>
                        <div className="flex gap-3 justify-end mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="px-5 py-2.5 text-slate-300 hover:text-white font-bold transition hover:bg-slate-700 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando} className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-bold shadow-lg shadow-orange-900/20 flex items-center gap-2 transition transform hover:scale-105 disabled:opacity-50 disabled:transform-none">
                                {guardando ? <span className="animate-spin">⏳</span> : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// COMPONENTE VISUAL DE CARTAS APILADAS
function CardItemRealStack({ carta, onAdd, onRemove }) {
    const copias = Array.from({ length: carta.cantidad });
    const verticalOffset = 30; // Distancia hacia abajo

    const totalHeight = 220 + ((carta.cantidad - 1) * verticalOffset);

    return (
        <div className="relative w-full group select-none z-0" style={{ height: `${totalHeight}px` }}>
            {copias.map((_, index) => {
                const isTopCard = index === copias.length - 1;
                return (
                    <div 
                        key={index} 
                        className="absolute top-0 left-0 w-full rounded-lg border-2 border-slate-900 overflow-hidden bg-slate-800" 
                        style={{ transform: `translateY(${index * verticalOffset}px)`, zIndex: index, height: 'auto' }}
                    >
                        <img 
                            src={carta.imgUrl} 
                            alt={carta.name} 
                            crossOrigin="anonymous" 
                            className="w-full h-auto object-cover block" 
                        />
                        
                        {isTopCard && (
                            <>
                                <div className="absolute top-1 right-1 z-20 bg-black/90 text-orange-500 border border-orange-500/50 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md">
                                    {carta.cantidad}
                                </div>

                                <div className="hide-on-capture absolute inset-0 flex flex-col justify-center items-center gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60">
                                     <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); onRemove(carta.slug); }} className="w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold flex items-center justify-center border-2 border-slate-800 transition">-</button>
                                        <button onClick={(e) => { e.stopPropagation(); onAdd(carta); }} disabled={carta.cantidad >= 3} className={`w-8 h-8 rounded-full font-bold flex items-center justify-center border-2 border-slate-800 transition ${carta.cantidad >= 3 ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}>+</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

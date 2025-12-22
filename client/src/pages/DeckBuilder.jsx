import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

// --- CONSTANTES ---
const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_ID_TO_NAME = { 1: "Aliado", 2: "Talismán", 3: "Arma", 4: "Tótem", 5: "Oro" };
const TIPOS_FILTRO = [{ id: 1, label: "Aliado", value: 1 }, { id: 2, label: "Talismán", value: 2 }, { id: 3, label: "Arma", value: 3 }, { id: 4, label: "Tótem", value: 4 }, { id: 5, label: "Oro", value: 5 }];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => {
    if (!c) return "https://via.placeholder.com/250x350?text=Error";
    return c.imgUrl || c.imageUrl || c.img || c.imagen || c.image || (c.image && c.image.secure_url) || "https://via.placeholder.com/250x350?text=No+Image";
};

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

    // Estados
    const [gridColumns, setGridColumns] = useState(window.innerWidth < 768 ? 3 : 5);
    const [formato] = useState(location.state?.selectedFormat || "imperio"); // ✅ Solo lectura para bloquear cambio
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [razaSeleccionada, setRazaSeleccionada] = useState(""); // ✅ Nuevo filtro
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);

    // Visibilidad
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [vistaPorTipo, setVistaPorTipo] = useState(true);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const edicionesActivas = useMemo(() => formato === 'imperio' ? EDICIONES_IMPERIO : EDICIONES_PB, [formato]);

    useEffect(() => {
        const claves = Object.keys(edicionesActivas);
        if (claves.length > 0) setEdicionSeleccionada(claves[0]);
    }, [edicionesActivas]);

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
        if (location.state?.deckToEdit) {
            const deck = location.state.deckToEdit;
            setNombreMazo(deck.name);
            setEditingDeckId(deck._id);
            if (deck.isPublic !== undefined) setIsPublic(deck.isPublic);
            setMazo(deck.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location]);

    // Buscador
    useEffect(() => {
        // Dentro de useEffect [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada, formato]

        const fetchCartas = async () => {
            // Si no hay criterios, no buscamos
            if (!edicionSeleccionada && !busqueda && !razaSeleccionada) return;

            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("format", formato);

                // Si hay búsqueda por texto, la agregamos
                if (busqueda) params.append("q", busqueda);

                // Si hay tipo (Aliado, Talismán, etc)
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);

                // ✅ MEJORA: Filtro de Raza (Solo para Primer Bloque)
                if (formato === "primer_bloque" && razaSeleccionada) {
                    params.append("race", razaSeleccionada);
                    // Opcional: Si buscas por raza, quizás quieras ver todas las ediciones de esa raza
                    // if (!busqueda) params.delete("edition"); 
                }

                // Si hay edición seleccionada
                if (edicionSeleccionada) params.append("edition", edicionSeleccionada);

                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();

                // Limpiamos resultados si no hay coincidencias
                setCartas(Array.isArray(data) ? data : (data.results || []));

            } catch (error) {
                console.error("Error en filtro de razas:", error);
                setCartas([]);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada, formato]);

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
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({ ...c, quantity: c.cantidad })), format: formato, isPublic: isPublic })
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
        <div className="h-screen flex flex-col md:flex-row font-sans bg-slate-900 text-white overflow-hidden">
            <style>{animationStyles}</style>

            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                {/* Switch de Formato Bloqueado */}
                <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-center shadow-inner">
                    <span className={`px-6 py-1.5 rounded-full border text-xs font-bold shadow-lg ${formato === 'imperio' ? 'bg-orange-600 border-orange-500' : 'bg-yellow-600 border-yellow-500'}`}>
                        MODO: {formato === 'imperio' ? '🏛️ IMPERIO' : '📜 PRIMER BLOQUE'}
                    </span>
                </div>

                {/* Buscador y Filtros */}
                <div className="bg-slate-900 border-b border-slate-800 p-2 z-30 flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 rounded bg-slate-800 text-slate-400">🔙</button>
                    <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded border md:hidden bg-slate-800">⚙️</button>
                    <div className="flex-1 relative">
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm outline-none focus:border-orange-500" />
                        <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="p-2 rounded bg-slate-800 border border-slate-700 text-xs">
                            {Object.entries(edicionesActivas).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                        </select>
                        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="p-2 rounded bg-slate-800 border border-slate-700 text-xs">
                            <option value="">Tipos</option>
                            {TIPOS_FILTRO.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                        </select>
                        {formato === 'primer_bloque' && (
                            <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="p-2 rounded bg-slate-800 border border-yellow-500/50 text-yellow-400 font-bold text-xs">
                                <option value="">Razas</option>
                                {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* Grid Resultados */}
                <div className="flex-1 overflow-y-auto p-2 pb-24 md:pb-2 custom-scrollbar relative" ref={gridContainerRef}>
                    {loading ? <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div></div> : (
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                            {cartas.map(c => (
                                <div key={c.slug} className="relative group cursor-pointer animate-fade-in" onClick={() => handleAdd(c)}>
                                    <div className={`rounded-xl overflow-hidden border-2 transition-all ${mazo.find(x => x.slug === c.slug) ? 'border-orange-500' : 'border-slate-800'}`}>
                                        <img src={getImg(c)} alt={c.name} className="w-full h-auto" />
                                        {mazo.find(x => x.slug === c.slug)?.cantidad > 0 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-black shadow-xl">{mazo.find(x => x.slug === c.slug).cantidad}</div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600/90 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">👁️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR PC */}
            <div className="hidden md:flex w-80 bg-slate-800 border-l border-slate-700 flex-col h-screen">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="font-bold">🛡️ Mi Mazo</h2>
                    <span className="text-xs px-2 py-1 rounded bg-slate-700">{totalCartas}/50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-orange-400 text-[10px] font-black border-b border-slate-700 mb-1">{t}</h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[t].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center text-xs p-1 bg-slate-700/30 rounded">
                                        <span className="truncate flex-1 cursor-pointer" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleAdd(c)} className="text-green-400">+</button>
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-400">-</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-700 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 py-2 rounded text-xs font-bold">👁️ VER DECK</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 py-2 rounded text-xs font-bold">💾 GUARDAR</button>
                </div>
            </div>

            {/* FOOTER MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mazo</span>
                    <span className={`text-lg font-black leading-none ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}<span className="text-slate-600 text-xs">/50</span></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tight shadow-md border border-slate-700">📋 Lista</button>
                    <button onClick={() => { setModalMazoOpen(true); setVistaPorTipo(false); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tight shadow-md border border-blue-500">👁️ Ver Deck</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tight shadow-md border border-orange-500">💾</button>
                </div>
            </div>

            {/* MODAL ZOOM */}
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

            {/* MODAL MÓVIL LISTA */}
            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end">
                    <div className="bg-slate-900 rounded-t-3xl h-[75vh] p-4 overflow-auto animate-slide-up border-t border-slate-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                            <h3 className="text-xl font-black text-white uppercase italic">Mi Lista ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-white bg-slate-800 w-10 h-10 rounded-full font-bold">✕</button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4 bg-slate-800/30 p-2 rounded-xl border border-slate-800">
                                <h4 className="text-orange-400 text-[10px] font-black mb-2 uppercase tracking-tighter">{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-white text-sm py-2 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img src={getImg(c)} className="w-10 h-12 rounded object-cover" />
                                            <span className="font-medium truncate max-w-[120px]">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-900 p-1 px-3 rounded-full border border-slate-700">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold px-2 text-xl">-</button>
                                            <span className="font-bold text-sm w-4 text-center">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="text-green-500 font-bold px-2 text-xl disabled:opacity-30">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl animate-fade-in text-white">
                        <h3 className="text-2xl font-black mb-6 uppercase text-orange-500">Guardar Deck</h3>
                        <input autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-orange-500 mb-4" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-700 cursor-pointer shadow-inner" onClick={() => setIsPublic(!isPublic)}>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isPublic ? 'bg-orange-600 border-orange-500' : 'border-slate-600 bg-slate-800'}`}>
                                {isPublic && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            <span className="text-sm font-bold text-slate-300">Público en comunidad 🌍</span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-4 hover:text-white">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase shadow-lg shadow-orange-900/30">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
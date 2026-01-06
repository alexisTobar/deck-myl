import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // ✅ Agregado Link
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { Plus, Sword, ScrollText, Zap, Layout, Save, X, ChevronLeft } from "lucide-react"; // ✅ Agregados iconos

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
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popElastic { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
  .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
  .animate-pop { animation: popElastic 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  
  /* ✅ MEJORA: EFECTO CARTA 3D ZOOM */
  .card-container { perspective: 1000px; }
  .card-3d {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
    transform-style: preserve-3d;
  }
  .card-3d:hover {
    transform: scale(1.1) rotateX(5deg) translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    z-index: 50;
  }
`;

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const isPB = location.pathname.includes("primer-bloque");
    const formato = isPB ? "primer_bloque" : "imperio";

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

    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [showMobileList, setShowMobileList] = useState(false);

    const edicionesActivas = useMemo(() => isPB ? EDICIONES_PB : EDICIONES_IMPERIO, [isPB]);

    const glowClass = isPB
        ? "shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-500/60"
        : "shadow-[0_0_15px_rgba(249,115,22,0.5)] border-orange-500/60";

    useEffect(() => {
        const claves = Object.keys(edicionesActivas);
        if (claves.length > 0) setEdicionSeleccionada(claves[0]);
    }, [edicionesActivas]);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            if (d.isPublic !== undefined) setIsPublic(d.isPublic);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location]);

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
        if (mazo.reduce((acc, c) => acc + c.cantidad, 0) >= 50 && !existe) return alert("Mazo lleno (Máx 50)");
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
        if (!nombreMazo.trim()) return alert("El mazo necesita un nombre");
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
            else alert("Error al guardar");
        } catch (e) { console.error(e); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, backgroundColor: '#0f172a' });
            const link = document.createElement('a'); link.download = `${nombreMazo || "Mazo"}.png`; link.href = dataUrl; link.click();
        } catch (err) { alert('Error captura'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className={`h-screen flex flex-col md:flex-row font-sans ${isPB ? 'bg-[#0c0e14]' : 'bg-[#110d0a]'} text-white overflow-hidden relative`}>
            <style>{animationStyles}</style>

            {/* ✅ MEJORA: BOTONES FLOTANTES DE ACCESO DIRECTO (Crear Deck) */}
            <div className="fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
                <Link to="/primer-bloque/builder" className="pointer-events-auto group flex items-center gap-3 bg-yellow-600 hover:bg-yellow-500 text-black p-3 md:px-5 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95">
                    <ScrollText size={20} className="font-bold" />
                    <span className="hidden md:block text-[10px] font-black uppercase italic">Nuevo PB</span>
                </Link>
                <Link to="/imperio/builder" className="pointer-events-auto group flex items-center gap-3 bg-orange-600 hover:bg-orange-500 text-white p-3 md:px-5 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95">
                    <Sword size={20} />
                    <span className="hidden md:block text-[10px] font-black uppercase italic">Nuevo Imperio</span>
                </Link>
            </div>

            {/* IZQUIERDA: BUSCADOR */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">

                {/* Cabecera con Botón Volver */}
                <div className={`bg-slate-900/50 backdrop-blur-md border-b ${isPB ? 'border-yellow-900/30' : 'border-orange-900/30'} p-3 flex justify-between items-center px-4`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(isPB ? "/primer-bloque" : "/imperio")} className={`p-1.5 rounded-lg border ${isPB ? 'border-yellow-500/30 text-yellow-500' : 'border-orange-500/30 text-orange-500'} hover:bg-slate-800 transition-colors`}>
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${isPB ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`}></div>
                            <h2 className={`text-xs font-black uppercase tracking-widest ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>
                                Constructor {isPB ? 'PB' : 'Imperio'}
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => { if (window.confirm("¿Salir del constructor?")) navigate(isPB ? "/primer-bloque" : "/imperio") }} className="text-[10px] font-bold text-slate-500 hover:text-red-500 transition uppercase">Cancelar</button>
                </div>

                {/* Filtros */}
                <div className="p-4 flex flex-wrap gap-2 items-center bg-slate-900/20 border-b border-slate-800">
                    <div className="flex-1 min-w-[150px] relative">
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={`w-full p-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:ring-1 ${isPB ? 'focus:ring-yellow-500' : 'focus:ring-orange-500'}`} />
                        <span className="absolute left-3 top-3 opacity-40">🔍</span>
                    </div>
                    <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-[10px] font-bold outline-none max-w-[120px]">
                        {Object.entries(edicionesActivas).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                    </select>
                    <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-[10px] font-bold outline-none">
                        <option value="">Tipos</option>
                        {TIPOS_FILTRO.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                    </select>
                    {isPB && (
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-800 border border-yellow-500/40 text-yellow-500 p-2 rounded-xl text-[10px] font-black outline-none">
                            <option value="">Todas las Razas</option>
                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    )}
                </div>

                {/* ✅ MEJORA: Grid con Efecto 3D */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? (
                        <div className="flex justify-center mt-20"><div className={`w-10 h-10 border-4 ${isPB ? 'border-yellow-500' : 'border-orange-500'} border-t-transparent rounded-full animate-spin`}></div></div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 card-container">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`card-3d rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? glowClass : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className={`w-full h-auto ${cant > 0 ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} alt={c.name} />
                                            {cant > 0 && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <div className={`w-10 h-10 rounded-full ${isPB ? 'bg-yellow-500 text-black' : 'bg-orange-600 text-white'} flex items-center justify-center font-black shadow-2xl animate-pop text-lg border-2 border-white`}>{cant}</div>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600/90 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">👁️</button>
                                        <h3 className="text-[8px] text-center mt-1 font-bold text-slate-500 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR PC */}
            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <h2 className={`font-black italic ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>MI DECK</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${totalCartas === 50 ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className={`${isPB ? 'text-yellow-600' : 'text-orange-600'} text-[10px] font-black border-b border-slate-800 mb-1`}>{t}</h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[t].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center text-xs p-1.5 bg-slate-800/40 rounded hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                                        <span className="truncate flex-1 cursor-pointer font-medium" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
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
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 py-2.5 rounded-xl font-black text-[10px] shadow-lg hover:bg-blue-500 transition">👁️ GALERÍA VISUAL</button>
                    <button onClick={() => setModalGuardarOpen(true)} className={`w-full py-3 rounded-xl font-black text-xs shadow-lg transition-all ${isPB ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-orange-600 hover:bg-orange-500'}`}>💾 GUARDAR GRIMORIO</button>
                </div>
            </div>

            {/* FOOTER MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3">
                    <span className="text-[10px] text-slate-500 font-bold">CARTAS</span>
                    <span className={`text-lg font-black leading-none ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase border border-slate-700"><Layout size={18}/></button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-md">Ver</button>
                    <button onClick={() => setModalGuardarOpen(true)} className={`${isPB ? 'bg-yellow-600' : 'bg-orange-600'} text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg`}>💾</button>
                </div>
            </div>

            {/* MODAL LISTA MÓVIL */}
            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-slate-900 rounded-t-3xl h-[75vh] p-5 overflow-auto border-t border-slate-700 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Mi Mazo ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-white bg-slate-800 w-10 h-10 rounded-full">✕</button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4 bg-slate-800/20 p-3 rounded-2xl border border-slate-800">
                                <h4 className={`${isPB ? 'text-yellow-600' : 'text-orange-600'} text-[10px] font-black uppercase mb-3`}>{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2.5 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img src={getImg(c)} className="w-10 h-12 rounded shadow-md object-cover" />
                                            <span className="text-sm font-medium truncate max-w-[120px]">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-950 p-1.5 px-4 rounded-full border border-slate-800">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-black text-xl">-</button>
                                            <span className="font-black text-sm w-4 text-center">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} disabled={c.cantidad >= 3} className="text-green-500 font-black text-xl disabled:opacity-20">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ✅ MEJORA: MODAL ZOOM PROFESIONAL */}
            {cardToZoom && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 touch-none animate-fade-in"
                    onClick={() => setCardToZoom(null)}
                >
                    <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl font-bold border border-white/20 z-[210] active:scale-90" onClick={() => setCardToZoom(null)}>✕</button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-pop" onClick={e => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10" alt="zoom" />
                        <div className="mt-8 flex items-center gap-8 bg-slate-900/90 p-5 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 text-red-500 text-4xl font-black transition-all active:scale-75">-</button>
                            <div className="flex flex-col items-center min-w-[70px]">
                                <span className="text-5xl font-black text-white leading-none">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">En Deck</span>
                            </div>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 text-green-500 text-4xl font-black transition-all active:scale-75">+</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GALERÍA */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-slide-up">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6">
                        <h2 className="text-lg font-black uppercase italic tracking-tighter">Galería Visual</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-white">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div ref={galleryRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 mt-4 pb-20 card-container">
                            {mazo.map(c => (
                                <div key={c.slug} className="cursor-pointer relative card-3d" onClick={() => setCardToZoom(c)}>
                                    <img src={getImg(c)} className="w-full h-auto rounded-xl border border-slate-800 shadow-lg" />
                                    <div className={`absolute bottom-0 right-0 ${isPB ? 'bg-yellow-500 text-black' : 'bg-orange-600 text-white'} px-3 py-0.5 font-black text-xs rounded-tl-xl border-l border-t border-slate-900 shadow-2xl`}>x{c.cantidad}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center gap-4">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase shadow-lg shadow-blue-900/20 active:scale-95 transition">📸 Descargar Deck</button>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black uppercase shadow-lg">Cerrar</button>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-7 rounded-[32px] w-full max-w-sm border border-slate-700 shadow-2xl text-white animate-pop" onClick={e => e.stopPropagation()}>
                        <h3 className={`text-2xl font-black mb-6 uppercase tracking-tighter ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>Guardar Deck</h3>
                        <div className="space-y-4">
                            <input autoFocus value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" placeholder="Escribe un nombre..." />
                            <label className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700 cursor-pointer shadow-inner" onClick={() => setIsPublic(!isPublic)}>
                                <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${isPublic ? 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'border-slate-600 bg-slate-800'}`}>
                                    {isPublic && <span className="text-white text-sm font-black">✓</span>}
                                </div>
                                <span className="text-sm font-bold text-slate-300 select-none">Hacer público</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-bold px-4 hover:text-white transition">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className={`bg-${isPB ? 'yellow-600' : 'orange-600'} text-white px-8 py-3 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all`}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
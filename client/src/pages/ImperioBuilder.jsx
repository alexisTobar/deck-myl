import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

const EDICIONES_IMPERIO = { 
    "25_Aniversario_Imp": "25 aniversario", // ✅ Añadido
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

const TIPOS_IMPERIO = [
    { id: 1, label: "Aliado", icon: "👤", color: "border-blue-500 text-blue-400" },
    { id: 2, label: "Talismán", icon: "✨", color: "border-purple-500 text-purple-400" },
    { id: 3, label: "Arma", icon: "⚔️", color: "border-red-500 text-red-400" },
    { id: 4, label: "Tótem", icon: "🗿", color: "border-green-500 text-green-400" },
    { id: 5, label: "Oro", icon: "💰", color: "border-yellow-500 text-yellow-400" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

// ✅ Mejora en la detección de imagen para ser compatible con cualquier formato de URL
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const [formato] = useState("imperio");
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("25_Aniversario_Imp"); // ✅ Cambiado por defecto
    const [tipoSeleccionado, setTipoSeleccionado] = useState(""); 
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name);
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
        }
    }, [location]);

    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda && !tipoSeleccionado) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", edicionSeleccionada);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, formato]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else { 
            // ✅ MEJORA: Buscamos el label comparando como String para evitar fallos si el type es un número
            const typeLabel = TIPOS_IMPERIO.find(t => String(t.id) === String(c.type))?.label || c.type || "Otros";
            setMazo([...mazo, { ...c, cantidad: 1, type: typeLabel, imgUrl: getImg(c) }]); 
        }
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

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
        } catch (e) { alert("Error al guardar"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, backgroundColor: '#0f0a07' });
            const link = document.createElement('a'); link.download = `${nombreMazo || "Mazo_Imperio"}.png`; link.href = dataUrl; link.click();
        } catch (err) { alert('Error captura'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest">Imperio Workshop</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-3">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[10px] font-bold text-orange-400">
                            {Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {TIPOS_IMPERIO.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-[10px] uppercase font-black ${tipoSeleccionado === tipo.id ? `${tipo.color} bg-slate-800 shadow-lg` : 'border-slate-800 text-slate-500'}`}>
                                {tipo.icon} {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold">Buscando cartas...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_#f97316]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform group-hover:scale-105" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} 
                                            className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-2xl border border-white/20 hover:bg-orange-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20">
                <div className="p-4 border-b border-slate-800 font-black text-orange-500 uppercase tracking-tighter flex justify-between">
                    <span>Mi Deck</span>
                    <span className={totalCartas === 50 ? "text-green-500" : "text-slate-400"}>{totalCartas}/50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-orange-600 text-[10px] font-black border-b border-slate-700 mb-1">{t}</h3>
                            {mazoAgrupado[t].map(c => (
                                <div key={c.slug} className="flex justify-between items-center text-xs py-1.5 px-2 bg-slate-800/40 rounded-lg mb-1 group hover:bg-slate-700 transition-colors">
                                    <span className="truncate flex-1 cursor-pointer" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleAdd(c)} className="text-green-500 font-bold">+</button>
                                        <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-bold">-</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 py-2 rounded-xl font-bold text-xs uppercase text-white shadow-lg active:scale-95 transition-transform">Ver Galería</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 py-2 rounded-xl font-bold text-xs uppercase shadow-lg active:scale-95 transition-transform">{editingDeckId ? 'Actualizar Deck' : 'Guardar Deck'}</button>
                </div>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3">
                    <span className="text-[10px] text-slate-500 font-bold">TOTAL</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700">LISTA</button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs">VER</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg">💾</button>
                </div>
            </div>

            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-slate-900 rounded-t-3xl h-[70vh] p-5 overflow-auto border-t border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-orange-500">Mi Lista ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-2xl text-slate-400">✕</button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4">
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-2 border-b border-slate-800">{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                        <span className="text-sm font-medium">{c.name}</span>
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

            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button 
                        onClick={() => setCardToZoom(null)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-black border border-white/20 shadow-2xl z-[210] transition-all active:scale-90"
                    >
                        ✕
                    </button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.3)] border-4 border-orange-500/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-3xl font-black border border-red-500/30 active:scale-90 transition-all">-</button>
                            <span className="text-4xl font-black text-white">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white text-3xl font-black border border-green-500/30 active:scale-90 transition-all">+</button>
                        </div>
                    </div>
                </div>
            )}

            {modalMazoOpen && (
                <div className="fixed inset-0 bg-[#0f0a07] z-[100] flex flex-col transition-all">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-slate-800 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-orange-500 italic tracking-widest">Galería Imperio</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full text-white hover:bg-red-600 transition-colors">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={galleryRef}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pb-20 p-4 bg-[#0f0a07]">
                            {mazo.map(c => (
                                <div key={c.slug} className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setCardToZoom(c)}>
                                    <img src={getImg(c)} className="w-full h-auto rounded-lg shadow-lg border border-white/5" alt={c.name} />
                                    <div className="absolute bottom-0 right-0 bg-orange-600 text-white px-2.5 py-0.5 font-black text-[10px] rounded-tl-lg shadow-2xl border-t border-l border-slate-900">x{c.cantidad}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-900 flex flex-col sm:flex-row gap-4 justify-center border-t border-slate-800">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="bg-blue-600 px-8 py-3 rounded-2xl font-black text-white shadow-xl hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                             {guardando ? 'Procesando...' : '📸 Descargar Imagen'}
                        </button>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-700 px-8 py-3 rounded-2xl font-black text-white hover:bg-slate-600 transition-all">Cerrar</button>
                    </div>
                </div>
            )}

            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-orange-500 tracking-tighter">Guardar Estrategia</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-600 outline-none focus:border-orange-500 mb-4 transition-all" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                            <span className="text-sm font-bold text-slate-300">Publicar en la Arena Global 🌍</span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => m(() => setModalGuardarOpen(false))} className="text-slate-400 font-bold px-4 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
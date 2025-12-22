import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };

const TIPOS_IMPERIO = [
    { id: 1, label: "Aliado", icon: "👤", color: "border-blue-500 text-blue-400" },
    { id: 2, label: "Talismán", icon: "✨", color: "border-purple-500 text-purple-400" },
    { id: 3, label: "Arma", icon: "⚔️", color: "border-red-500 text-red-400" },
    { id: 4, label: "Tótem", icon: "🗿", color: "border-green-500 text-green-400" },
    { id: 5, label: "Oro", icon: "💰", color: "border-yellow-500 text-yellow-400" }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

    const formato = "imperio";
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("kvsm_titanes");
    const [tipoSeleccionado, setTipoSeleccionado] = useState(""); 
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [modalMazoOpen, setModalMazoOpen] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // ✅ LÓGICA DE BÚSQUEDA GLOBAL MEJORADA
    useEffect(() => {
        const fetchCartas = async () => {
            // No buscar si no hay criterios mínimos
            if (!edicionSeleccionada && !busqueda && !tipoSeleccionado) return;

            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("format", formato);

                // --- CAMBIO CLAVE AQUÍ ---
                if (busqueda.trim() !== "") {
                    // Si hay texto, buscamos por nombre en TODO Imperio (ignoramos edición)
                    params.append("q", busqueda);
                } else {
                    // Si el buscador está vacío, filtramos por la edición elegida
                    params.append("edition", edicionSeleccionada);
                }

                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { 
                console.error("Error en búsqueda:", e); 
                setCartas([]);
            } finally { 
                setLoading(false); 
            }
        };

        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado]); // Reacciona a cambios en buscador o selectores

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) {
            if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x));
        } else {
            // Intentar detectar tipo si viene como ID numérico
            const typeName = TIPOS_IMPERIO.find(t => t.id === Number(c.type))?.label || c.type || "Otros";
            setMazo([...mazo, { ...c, type: typeName, cantidad: 1, imgUrl: getImg(c) }]);
        }
    };

    const handleRemove = (s) => setMazo(mazo.map(c => c.slug === s ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const cardsPayload = mazo.map(c => ({ ...c, quantity: c.cantidad }));
            const res = await fetch(`${BACKEND_URL}/api/decks`, { 
                method: "POST", 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: cardsPayload, format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
            else alert("Error al guardar");
        } catch (e) { console.error(e); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, backgroundColor: '#0f0a07' });
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
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header Superior */}
                <div className="bg-slate-900/80 backdrop-blur-md border-b border-orange-500/20 p-3 flex justify-between items-center px-4">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 italic">Imperio Builder</h2>
                    <div className="w-8 md:hidden"></div>
                </div>

                {/* Filtros e Iconos de Tipo */}
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[200px] relative group">
                            <input 
                                type="text" 
                                placeholder="Búsqueda global (ignora edición)..." 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                className="w-full p-3 pl-10 rounded-2xl bg-slate-950 border border-slate-700 outline-none focus:border-orange-500 text-sm" 
                            />
                            <span className="absolute left-3.5 top-3.5 opacity-40">🔍</span>
                        </div>
                        <select 
                            value={edicionSeleccionada} 
                            onChange={(e) => setEdicionSeleccionada(e.target.value)} 
                            disabled={busqueda.trim() !== ""}
                            className={`bg-slate-950 border border-slate-700 p-3 rounded-2xl text-[10px] font-bold text-orange-400 outline-none transition-opacity ${busqueda ? 'opacity-20 cursor-not-allowed' : 'opacity-100'}`}
                        >
                            {Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TIPOS_IMPERIO.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${tipoSeleccionado === tipo.id ? `${tipo.color} bg-slate-800 border-current shadow-lg` : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                                <span className="text-base">{tipo.icon}</span> <span>{tipo.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visualización de Cartas */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-orange-600 border-2 border-white text-white flex items-center justify-center font-black">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1 right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg">👁️</button>
                                        <h3 className="text-[9px] text-center mt-1 font-bold text-slate-400 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Derecha */}
            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20 shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <h2 className="font-black italic text-orange-500 text-lg uppercase tracking-tighter">Mi Mazo</h2>
                    <span className={`text-xl font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-orange-600 text-[10px] font-black border-b border-slate-700 mb-1 pb-1 uppercase tracking-tighter">{t}</h3>
                            <ul className="space-y-1">
                                {mazoAgrupado[t].map(c => (
                                    <li key={c.slug} className="flex justify-between items-center text-xs p-1.5 bg-slate-800/40 rounded-lg group">
                                        <span className="truncate flex-1 cursor-pointer font-medium" onClick={() => setCardToZoom(c)}>{c.cantidad} x {c.name}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-black text-[10px]">👁️ GALERÍA VISUAL</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full py-3 rounded-xl font-black text-xs bg-orange-600 hover:bg-orange-500">💾 GUARDAR MAZO</button>
                </div>
            </div>

            {/* Los modales de Zoom, Galería y Guardar se mantienen igual al código anterior */}
        </div>
    );
}
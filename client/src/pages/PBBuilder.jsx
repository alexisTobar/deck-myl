import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import {
    Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout,
    ShieldCheck, Users, Star, Layers, Shield, ShieldAlert
} from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-800" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-800" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-800" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-yellow-800" }
];

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: <Users size={14} />, color: "border-yellow-600 text-yellow-500" },
    { id: "Talismán", label: "Talismán", icon: <Shield size={14} />, color: "border-blue-400 text-blue-300" },
    { id: "Arma", icon: <Layout size={14} />, label: "Arma", color: "border-red-600 text-red-500" },
    { id: "Tótem", icon: <Layout size={14} />, label: "Tótem", color: "border-emerald-600 text-emerald-500" },
    { id: "Oro", icon: <Globe size={14} />, label: "Oro", color: "border-amber-400 text-amber-300" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);

    const formato = "primer_bloque";
    const [mainEditionSelected, setMainEditionSelected] = useState(location.state?.initialEdition || "espada_sagrada");
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [razaSeleccionada, setRazaSeleccionada] = useState("");
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

    // ✅ NUEVO: Estado para Mano de Prueba
    const [manoPrueba, setManoPrueba] = useState([]);

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += c.cantidad; });
        return { counts };
    }, [mazo]);

    // ✅ NUEVO: Lógica de Curva de Oro
    const goldCurve = useMemo(() => {
        const curve = { 0: 0, 1: 0, 2: 0, 3: 0, "4+": 0 };
        mazo.forEach(c => {
            if (c.type !== "Oro") {
                const cost = parseInt(c.cost) || 0;
                if (cost >= 4) curve["4+"] += c.cantidad;
                else curve[cost] += c.cantidad;
            }
        });
        return curve;
    }, [mazo]);

    // ✅ NUEVO: Función para barajar y simular mano
    const simularMano = () => {
        let baraja = [];
        mazo.forEach(c => {
            for (let i = 0; i < c.cantidad; i++) baraja.push(c);
        });
        for (let i = baraja.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
        }
        setManoPrueba(baraja.slice(0, 8));
    };

    useEffect(() => {
        if (location.state?.initialEdition) setMainEditionSelected(location.state.initialEdition);
    }, [location.state]);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            if (d.format === "primer_bloque") {
                setNombreMazo(d.name);
                setEditingDeckId(d._id);
                setIsPublic(d.isPublic || false);
                setMazo(d.cards.map(c => ({ ...c, cantidad: c.quantity || 1, imgUrl: getImg(c) })));
            }
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCartas = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato });
                if (busqueda) params.append("q", busqueda);
                else params.append("edition", mainEditionSelected);
                if (tipoSeleccionado) params.append("type", tipoSeleccionado);
                if (razaSeleccionada) params.append("race", razaSeleccionada);
                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, mainEditionSelected, tipoSeleccionado, razaSeleccionada]);

    const handleAdd = (c) => {
        if (c.restriction === "banned") return alert(`🚫 ${c.name} está PROHIBIDA.`);
        const copiasMismoNombre = mazo
            .filter(x => x.name.toLowerCase().trim() === c.name.toLowerCase().trim())
            .reduce((acc, curr) => acc + curr.cantidad, 0);
        const totalMazo = mazo.reduce((a, b) => a + b.cantidad, 0);
        if (totalMazo >= 50 && !mazo.find(x => x.slug === c.slug)) return alert("Mazo lleno");
        let limit = 3;
        if (c.restriction === "limited1") limit = 1;
        if (c.restriction === "limited2") limit = 2;
        if (copiasMismoNombre >= limit) {
            return alert(`⚠️ Restricción DAR: Solo puedes tener ${limit} copias de "${c.name}" en total.`);
        }
        const ex = mazo.find(x => x.slug === c.slug);
        if (ex) {
            setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x));
        } else {
            setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
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
                method, headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({ ...c, quantity: c.cantidad })), format: formato, isPublic: isPublic })
            });
            if (res.ok) navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    const handleTakeScreenshot = async () => {
        setGuardando(true);
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const cardsPerRow = 10;
            const rows = Math.ceil(mazo.length / cardsPerRow);
            canvas.width = 1200;
            canvas.height = 300 + (rows * 160) + 180;
            ctx.fillStyle = "#0c0e14";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const loadImg = (url) => new Promise((resolve) => {
                const img = new Image(); img.crossOrigin = "anonymous";
                img.onload = () => resolve(img); img.onerror = () => resolve(null);
                img.src = url;
            });
            const logoUrl = "https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png";
            const logo = await loadImg(logoUrl);
            if (logo) {
                ctx.save(); ctx.globalAlpha = 0.04;
                ctx.drawImage(logo, canvas.width / 2 - 350, canvas.height / 2 - 350, 700, 700);
                ctx.restore(); ctx.drawImage(logo, 50, 30, 80, 80);
            }
            ctx.fillStyle = "#eab308"; ctx.font = "bold 20px Orbitron, Arial";
            ctx.fillText("ESTRATEGIA OFICIAL", 150, 60);
            ctx.fillStyle = "white"; ctx.font = "italic bold 55px Arial";
            ctx.fillText(nombreMazo.toUpperCase() || "MAZO SIN NOMBRE", 150, 110);
            const totalCards = mazo.reduce((a, b) => a + b.cantidad, 0);
            ctx.fillStyle = "#1e293b";
            if (ctx.roundRect) ctx.roundRect(950, 50, 200, 60, 15); else ctx.fillRect(950, 50, 200, 60);
            ctx.fill();
            ctx.fillStyle = "#ffffffff"; ctx.font = "bold 17px Arial"; ctx.textAlign = "center";
            ctx.fillText(`${totalCards} CARTAS`, 1050, 90); ctx.textAlign = "left";

            let dx = 50, dy = 180;
            for (const card of mazo) {
                const img = await loadImg(card.imgUrl);
                if (img) {
                    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10;
                    ctx.drawImage(img, dx, dy, 105, 147); ctx.shadowBlur = 0;
                    ctx.fillStyle = "#eab308";
                    const badgeX = dx + 75; const badgeY = dy + 120;
                    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(badgeX, badgeY, 32, 28, 8); ctx.fill(); }
                    else { ctx.fillRect(badgeX, badgeY, 32, 28); }
                    ctx.fillStyle = "black"; ctx.font = "black 16px Arial";
                    ctx.fillText(`x${card.cantidad}`, badgeX + 4, badgeY + 20);
                }
                dx += 112; if (dx > 1120) { dx = 50; dy += 165; }
            }
            const footerY = canvas.height - 150; let startX = 50; const boxWidth = 215;
            ORDER_TYPES.forEach((type, index) => {
                const count = statsForExport.counts[type] || 0;
                const percentage = totalCards > 0 ? (count / totalCards) : 0;
                ctx.fillStyle = "#161b22";
                if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(startX, footerY, boxWidth, 100, 20); ctx.fill(); ctx.strokeStyle = "#eab30833"; ctx.stroke(); }
                ctx.fillStyle = "#eab308"; ctx.font = "bold 12px Arial"; ctx.fillText(type.toUpperCase(), startX + 15, footerY + 30);
                ctx.fillStyle = "white"; ctx.font = "bold 40px Arial"; ctx.fillText(count, startX + 15, footerY + 75);
                ctx.fillStyle = "#334155"; ctx.fillRect(startX + 15, footerY + 85, boxWidth - 40, 6);
                ctx.fillStyle = "#eab308"; ctx.fillRect(startX + 15, footerY + 85, (boxWidth - 40) * percentage, 6);
                startX += boxWidth + 15;
            });
            ctx.fillStyle = "#475569"; ctx.font = "12px Arial";
            ctx.fillText("GENERADO POR WARNING DECK BUILDER • 2025", 50, canvas.height - 20);
            canvas.toBlob((blob) => { saveAs(blob, `WD_PB_${nombreMazo || "Deck"}.png`); setGuardando(false); });
        } catch (err) { console.error(err); setGuardando(false); }
    };

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold hover:bg-yellow-500/10 transition-all italic tracking-tighter">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14} /> Forja Primer Bloque</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {MAIN_EDITIONS.map(ed => (
                            <button key={ed.id} onClick={() => { setMainEditionSelected(ed.id); setBusqueda(""); }}
                                className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 shadow-lg ${mainEditionSelected === ed.id ? `bg-gradient-to-r ${ed.color} border-white scale-105` : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'}`}>
                                {ed.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Búsqueda..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-yellow-500 font-bold" />
                        <select value={razaSeleccionada} onChange={(e) => setRazaSeleccionada(e.target.value)} className="bg-slate-950 border border-yellow-500/30 p-2 rounded-xl text-[11px] font-black text-yellow-400"><option value="">Raza...</option>{RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {TIPOS_PB.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-[10px] uppercase font-black ${tipoSeleccionado === tipo.id ? `border-yellow-500 text-yellow-500 bg-slate-800 shadow-lg` : 'border-slate-800 text-slate-500'}`}>
                                {tipo.icon} {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-yellow-500 font-bold uppercase tracking-tighter">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_#eab308]' : 'border-slate-800'
                                            } ${c.restriction === 'banned' ? 'opacity-40 grayscale' : ''}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {c.restriction && c.restriction !== 'unrestricted' && (
                                                <div className="absolute top-1 left-1 bg-red-600 p-1 rounded-md text-[8px] font-black uppercase text-white shadow-xl flex items-center gap-1">
                                                    <ShieldAlert size={10} /> {c.restriction === 'banned' ? 'BAN' : c.restriction === 'limited1' ? '1' : '2'}
                                                </div>
                                            )}
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-pulse"><div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-xl border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-yellow-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* BARRA LATERAL (GRIMORIO) */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0c0e14] to-black shadow-2xl">
                <div className="p-5 border-b border-yellow-500/30 bg-slate-900/50 backdrop-blur-md font-black text-yellow-500 uppercase tracking-widest flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18} /><span className="italic">Grimorio PB</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all duration-500 border ${totalCartas === 50 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">

                    {/* ✅ CALCULADORA DE CURVA DE ORO VISUAL */}
                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 mb-4 shadow-inner">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 text-center tracking-widest italic">Curva de Invocación</h4>
                        <div className="flex items-end justify-between px-2 h-16 gap-1">
                            {Object.entries(goldCurve).map(([cost, count]) => {
                                const maxCount = Math.max(...Object.values(goldCurve), 1);
                                const height = (count / maxCount) * 100;
                                return (
                                    <div key={cost} className="flex flex-col items-center flex-1 group relative">
                                        <div style={{ height: `${height}%` }} className="w-full bg-gradient-to-t from-yellow-700 to-yellow-400 rounded-t-sm min-h-[2px] transition-all duration-500 shadow-[0_0_5px_rgba(234,179,8,0.2)]"></div>
                                        <span className="text-[9px] font-black text-slate-400 mt-1">{cost}</span>
                                        <div className="absolute -top-6 bg-yellow-600 text-black text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">x{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3"><div className="h-[2px] flex-1 bg-gradient-to-r from-yellow-600/50 to-transparent"></div><h3 className="text-yellow-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3></div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 group hover:bg-yellow-600/10 hover:border-yellow-500/30 transition-all duration-300 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 rounded-xl active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-600 text-red-400 rounded-xl active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={simularMano} className="w-full bg-slate-800 hover:bg-indigo-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-white/5 shadow-lg"><Eye size={16} /> Mano de Prueba</button>
                    <button onClick={handleTakeScreenshot} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Camera size={16} /> Descargar Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 shadow-xl"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL REINTEGRADO AL 100% */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total</span>
                    <span className={`text-lg font-black ${totalCartas === 50 ? 'text-green-500' : 'text-white'}`}>{totalCartas}/50</span>
                </div>
                <div className="flex gap-2 pr-2">
                    <button onClick={simularMano} className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-[10px] border border-slate-700 uppercase">Mano</button>
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-[10px] border border-slate-700 uppercase">Lista</button>
                    <button onClick={handleTakeScreenshot} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Foto</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-yellow-600 text-black px-3 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center"><Save size={16} /></button>
                </div>
            </div>

            {/* MODAL MANO DE PRUEBA REINTEGRADO AL 100% */}
            {manoPrueba.length > 0 && (
                <div className="fixed inset-0 bg-black/95 z-[250] flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
                    <h3 className="text-xl md:text-2xl font-black text-yellow-500 uppercase italic mb-8 tracking-widest">Mano Inicial de Prueba</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 max-w-6xl px-4">
                        {manoPrueba.map((c, i) => (
                            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                                <img src={getImg(c)} className="w-full rounded-lg shadow-2xl border border-white/10" alt="mano" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 flex gap-4">
                        <button onClick={simularMano} className="bg-yellow-600 text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95">Mulligan</button>
                        <button onClick={() => setMazoPrueba([])} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest border border-white/10 active:scale-95">Cerrar</button>
                    </div>
                </div>
            )}

            {/* MODAL LISTA MÓVIL REINTEGRADO AL 100% */}
            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-slate-900 rounded-t-3xl h-[70vh] p-5 overflow-auto border-t border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase text-yellow-500 italic">Mi Lista ({totalCartas}/50)</h3>
                            <button onClick={() => setShowMobileList(false)} className="text-slate-400"><X size={24} /></button>
                        </div>
                        {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                            <div key={t} className="mb-4">
                                <h4 className="text-yellow-600 text-[10px] font-black uppercase mb-2 border-b border-orange-800 pb-1">{t}</h4>
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <img src={getImg(c)} className="w-10 h-12 rounded shadow-md object-cover" alt={c.name} />
                                            <span className="text-sm font-medium">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-950 p-1.5 px-4 rounded-full border border-slate-800">
                                            <button onClick={() => handleRemove(c.slug)} className="text-red-500 font-black"><Minus size={18} /></button>
                                            <span className="font-black text-sm w-4 text-center">{c.cantidad}</span>
                                            <button onClick={() => handleAdd(c)} className="text-green-500 font-black"><Plus size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL ZOOM REINTEGRADO AL 100% */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] border-4 border-yellow-500/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={24} strokeWidth={3} /></button>
                            <span className="text-4xl font-black text-white leading-none">
                                {mazo.filter(x => x.name.toLowerCase().trim() === cardToZoom.name.toLowerCase().trim()).reduce((acc, curr) => acc + curr.cantidad, 0)}
                            </span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GUARDA REINTEGRADO AL 100% */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-yellow-500 tracking-tighter italic text-center">Guardar Estrategia PB</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-yellow-600" />
                            <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tighter">Arena Global <Globe size={14} className="inline ml-1 text-orange-500" /></span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-black px-4 hover:text-white transition-colors uppercase italic text-xs tracking-widest">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-yellow-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-2 italic"><Save size={16} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
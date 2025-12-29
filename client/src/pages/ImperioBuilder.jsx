import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Shield, TrendingUp, Sword, Coins, Box
} from "lucide-react";

const EDICIONES_IMPERIO = { 
    "kvsm_titanes": "KVSM Titanes",
    "25_Aniversario_Imp": "25 aniversario",
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
    { id: 1, label: "Aliado", icon: <Users size={14} />, color: "border-blue-500 text-blue-400" },
    { id: 2, label: "Talismán", icon: <Shield size={14} />, color: "border-purple-500 text-purple-400" },
    { id: 3, label: "Arma", icon: <Sword size={14} />, color: "border-red-500 text-red-400" },
    { id: 4, label: "Tótem", icon: <Box size={14} />, color: "border-green-500 text-green-400" },
    { id: 5, label: "Oro", icon: <Coins size={14} />, color: "border-yellow-500 text-yellow-400" }
];
const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const canvasPreviewRef = useRef(null); // ✅ Ref para previsualización real como en PB

    const [formato] = useState("imperio");
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("kvsm_titanes");
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

    // ✅ Estadísticas unificadas (Igual que PB)
    const stats = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        const curve = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, "6+": 0 };
        mazo.forEach(c => {
            if (counts[c.type] !== undefined) counts[c.type] += c.cantidad;
            if (c.type !== "Oro") {
                const cost = parseInt(c.cost) || 0;
                if (cost >= 6) curve["6+"] += c.cantidad;
                else curve[cost] += c.cantidad;
            }
        });
        const maxCurve = Math.max(...Object.values(curve), 1);
        return { counts, curve, maxCurve };
    }, [mazo]);

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(d.name || "");
            setEditingDeckId(d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ 
                ...c, 
                cantidad: c.quantity || 1, 
                imgUrl: getImg(c) 
            })));
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCartas = async () => {
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
        if (ex) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: Math.min(x.cantidad + 1, 3) } : x));
        else setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        setGuardando(true);
        try {
            const token = localStorage.getItem("token");
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            await fetch(url, { 
                method, headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    // ✅ LÓGICA MAESTRA: Infografía Pro mediante Canvas (Preview + Download)
    const generateInfographic = async (isDownload = false) => {
        if (mazo.length === 0) return;
        setGuardando(true);
        const canvas = isDownload ? document.createElement("canvas") : canvasPreviewRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        canvas.width = 1600;
        canvas.height = 1200;
        ctx.fillStyle = "#0f0a07"; // Fondo Imperio
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const loadImg = (url) => new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });

        // Sello de Agua y Cabecera
        const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png");
        if (logo) {
            ctx.globalAlpha = 0.08;
            ctx.drawImage(logo, canvas.width/2 - 400, canvas.height/2 - 400, 800, 800);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(logo, 60, 40, 80, 80);
        }

        ctx.fillStyle = "#f97316"; // Color Imperio
        ctx.font = "bold 25px Arial";
        ctx.fillText("🏛️ IMPERIO MASTER WORKSHOP", 160, 70);
        ctx.fillStyle = "white";
        ctx.font = "italic bold 85px Arial";
        ctx.fillText(nombreMazo.toUpperCase() || "ESTRATEGIA LETAL", 160, 150);

        // Dibujar Cartas (Grid 7xX)
        let x = 60, y = 220;
        const cardW = 150, cardH = 210;
        for (const card of mazo) {
            const img = await loadImg(card.imgUrl);
            if (img) {
                ctx.drawImage(img, x, y, cardW, cardH);
                ctx.fillStyle = "#f97316";
                ctx.fillRect(x + cardW - 40, y + cardH - 35, 40, 35);
                ctx.fillStyle = "white";
                ctx.font = "bold 22px Arial";
                ctx.fillText(`x${card.cantidad}`, x + cardW - 35, y + cardH - 10);
            }
            x += 165;
            if (x > 1150) { x = 60; y += 230; }
        }

        // Panel Curva de Oro (Derecha)
        const curveX = 1250;
        const curveY = 650;
        ctx.fillStyle = "#1e1b18";
        if (ctx.roundRect) ctx.roundRect(curveX - 20, 580, 340, 350, 20); else ctx.fillRect(curveX - 20, 580, 340, 350);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("Curva de Oro", curveX + 85, 620);
        let barX = curveX + 25;
        Object.entries(stats.curve).forEach(([cost, count]) => {
            const barHeight = (count / stats.maxCurve) * 200;
            ctx.fillStyle = "#332d29"; ctx.fillRect(barX, curveY + 20, 30, 200);
            ctx.fillStyle = "#f97316"; ctx.fillRect(barX, curveY + 20 + (200 - barHeight), 30, barHeight);
            ctx.fillStyle = "white"; ctx.font = "bold 18px Arial"; ctx.fillText(cost, barX + 8, curveY + 245);
            barX += 45;
        });

        // Panel Distribución (Inferior Recuadros)
        ctx.fillStyle = "#1e1b18";
        if (ctx.roundRect) ctx.roundRect(60, 960, 1150, 210, 25); else ctx.fillRect(60, 960, 1150, 210);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("Distribución del Mazo", 90, 1005);
        let iconX = 100;
        const types = [
            { label: "Aliado", val: stats.counts.Aliado },
            { label: "Arma", val: stats.counts.Arma },
            { label: "Talismán", val: stats.counts.Talismán },
            { label: "Tótem", val: stats.counts.Tótem },
            { label: "Oro", val: stats.counts.Oro }
        ];
        types.forEach(t => {
            ctx.fillStyle = "#332d29";
            if (ctx.roundRect) ctx.roundRect(iconX, 1025, 180, 125, 15); else ctx.fillRect(iconX, 1025, 180, 125);
            ctx.fill();
            ctx.fillStyle = "#f97316"; ctx.font = "bold 45px Arial"; ctx.fillText(t.val, iconX + 60, 1085);
            ctx.fillStyle = "white"; ctx.font = "18px Arial"; ctx.fillText(t.label, iconX + 55, 1130);
            iconX += 210;
        });

        ctx.fillStyle = "#f97316"; ctx.font = "bold 28px Arial"; ctx.fillText("WarningDeck.cl", 1330, 1150);

        if (isDownload) {
            canvas.toBlob((blob) => { saveAs(blob, `WD_Imp_${nombreMazo}.png`); setGuardando(false); });
        } else { setGuardando(false); }
    };

    useEffect(() => { if (modalMazoOpen) setTimeout(() => generateInfographic(false), 200); }, [modalMazoOpen, mazo, nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all uppercase italic">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest italic leading-none">Imperio Workshop</h2>
                    <div className="w-10"></div>
                </div>
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500 font-bold" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-orange-400">{Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold uppercase tracking-widest">Escaneando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-500 transform group-hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_20px_#f97316aa]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-xl border-2 border-white shadow-2xl">{cant}</div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-orange-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-slate-950 text-white font-bold italic tracking-tighter">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase flex justify-between shadow-xl">
                    <span>Mi Deck</span>
                    <span className={totalCartas === 50 ? 'text-green-500' : 'text-slate-300'}>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                   {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <h3 className="text-orange-400 text-[11px] font-black uppercase mb-3 border-b border-orange-600/20 italic">{t}</h3>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-orange-600/10 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 group-hover:text-white uppercase text-[12px] tracking-tight">{c.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Eye size={16} /> Ver Infografía HD</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 shadow-xl"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 pb-4 z-50 flex items-center justify-between shadow-2xl">
                <div className="flex flex-col px-3"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total</span><span className="text-lg font-black">{totalCartas}/50</span></div>
                <div className="flex gap-2 pr-2">
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-700 uppercase tracking-tighter">Lista</button>
                    <button onClick={() => setModalMazoOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tighter">Ver</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center"><Save size={16} /></button>
                </div>
            </div>

            {/* ✅ MODAL CON PREVISUALIZACIÓN REAL (IGUAL QUE PB) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in text-white">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-orange-500 italic flex items-center gap-2 tracking-tighter"><Layout size={20} /> Generador máster</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-[#0f0a07]">
                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 mb-4 text-center">
                            <p className="text-slate-400 text-sm italic font-bold">Generando previsualización horizontal Máster...</p>
                        </div>
                        {/* Canvas de Previsualización */}
                        <div className="w-full max-w-6xl shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-slate-950">
                            <canvas ref={canvasPreviewRef} className="w-full h-auto block" />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center gap-4">
                        <button onClick={() => generateInfographic(true)} disabled={guardando} className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 uppercase text-sm tracking-widest active:scale-95 transition-all">
                             <Camera size={20} /> {guardando ? 'FORJANDO...' : 'Descargar Imagen Máster'}
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL ZOOM */}
            {cardToZoom && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] border-4 border-yellow-500/20" alt="zoom" />
                    </div>
                </div>
            )}
        </div>
    );
}
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  Users, Star, Shield, TrendingUp, Sword, Coins, Box
} from "lucide-react";

const MAIN_EDITIONS = [
    { id: "espada_sagrada", label: "Espada Sagrada", color: "from-blue-600 to-blue-800" },
    { id: "helenica", label: "Helénica", color: "from-red-600 to-red-800" },
    { id: "hijos_de_daana", label: "Hijos de Daana", color: "from-green-600 to-green-800" },
    { id: "dominios_de_ra", label: "Dominios de Ra", color: "from-yellow-600 to-yellow-800" }
];

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

const TIPOS_PB = [
    { id: "Aliado", label: "Aliado", icon: <Users size={14} />, color: "#3b82f6" },
    { id: "Talismán", label: "Talismán", icon: <Shield size={14} />, color: "#a855f7" },
    { id: "Arma", label: "Arma", icon: <Sword size={14} />, color: "#ef4444" },
    { id: "Tótem", label: "Tótem", icon: <Box size={14} />, color: "#10b981" },
    { id: "Oro", label: "Oro", icon: <Coins size={14} />, color: "#eab308" }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function PBBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const canvasPreviewRef = useRef(null);

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

    // Estadísticas para Gráficos
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
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: Math.min(x.cantidad + 1, 3) } : x));
        else setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    // Lógica de Canvas Pro (Similar a ElMeta)
    const generateCanvas = async (isDownload = false) => {
        if (mazo.length === 0) return;
        setGuardando(true);

        const canvas = isDownload ? document.createElement("canvas") : canvasPreviewRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Calcular altura dinámica
        const rows = Math.ceil(mazo.length / 5);
        canvas.width = 1200;
        canvas.height = Math.max(800, 250 + (rows * 210));

        // Fondo oscuro
        ctx.fillStyle = "#0c0e14";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const loadImg = (url) => new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });

        // 1. Logo Sello de Agua (Visible)
        const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png");
        if (logo) {
            ctx.globalAlpha = 0.08;
            ctx.drawImage(logo, canvas.width/2 - 300, canvas.height/2 - 300, 600, 600);
            ctx.globalAlpha = 1.0;
            // Logo pequeño en cabecera
            ctx.drawImage(logo, 50, 40, 60, 60);
        }

        // 2. Cabecera ElMeta Style
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 20px Arial";
        ctx.fillText("PRIMER BLOQUE", 130, 60);
        ctx.fillStyle = "white";
        ctx.font = "italic bold 55px Arial";
        ctx.fillText(nombreMazo.toUpperCase() || "MAZO SIN NOMBRE", 130, 115);

        // 3. Dibujar Cartas
        let x = 50, y = 180;
        const cardW = 140, cardH = 195;
        for (const card of mazo) {
            const img = await loadImg(card.imgUrl);
            if (img) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.drawImage(img, x, y, cardW, cardH);
                ctx.shadowBlur = 0;
                // Badge Cantidad
                ctx.fillStyle = "#eab308";
                ctx.fillRect(x + cardW - 35, y + cardH - 30, 35, 30);
                ctx.fillStyle = "black";
                ctx.font = "bold 18px Arial";
                ctx.fillText(`x${card.cantidad}`, x + cardW - 30, y + cardH - 8);
            }
            x += 155;
            if (x > 800) { x = 50; y += 215; }
        }

        // 4. Panel Lateral (Gráficos)
        const panelX = 850;
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(panelX, 180, 300, 550, 20) : ctx.fillRect(panelX, 180, 300, 550);
        ctx.fill();

        // Gráfico de Curva
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 18px Arial";
        ctx.fillText("CURVA DE ORO", panelX + 70, 220);
        let barY = 260;
        Object.entries(stats.curve).forEach(([cost, count]) => {
            ctx.fillStyle = "#334155";
            ctx.fillRect(panelX + 30, barY, 180, 15);
            ctx.fillStyle = "#eab308";
            const barWidth = (count / stats.maxCurve) * 180;
            ctx.fillRect(panelX + 30, barY, Math.max(barWidth, 5), 15);
            ctx.fillStyle = "white";
            ctx.font = "bold 14px Arial";
            ctx.fillText(`${cost}: ${count}`, panelX + 225, barY + 13);
            barY += 35;
        });

        // Distribución
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 18px Arial";
        ctx.fillText("DISTRIBUCIÓN", panelX + 75, 530);
        let distY = 565;
        ORDER_TYPES.forEach(type => {
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(panelX + 30, distY, 240, 35);
            ctx.fillStyle = "white";
            ctx.font = "13px Arial";
            ctx.fillText(type.toUpperCase(), panelX + 45, distY + 22);
            ctx.fillStyle = "#eab308";
            ctx.font = "bold 18px Arial";
            ctx.fillText(stats.counts[type] || 0, panelX + 230, distY + 25);
            distY += 42;
        });

        ctx.fillStyle = "#475569";
        ctx.font = "12px Arial";
        ctx.fillText("WARNINGDECK.CL", canvas.width - 160, canvas.height - 20);

        if (isDownload) {
            canvas.toBlob((blob) => {
                saveAs(blob, `WD_PB_${nombreMazo || "Deck"}.png`);
                setGuardando(false);
            });
        } else {
            setGuardando(false);
        }
    };

    // Efecto para actualizar previsualización cuando abre el modal
    useEffect(() => {
        if (modalMazoOpen) {
            setTimeout(() => generateCanvas(false), 100);
        }
    }, [modalMazoOpen, mazo, nombreMazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { const t = c.type || "Otros"; if (!g[t]) g[t] = []; g[t].push(c); });
        return g;
    }, [mazo]);

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0c0e14] text-white overflow-hidden">
            {/* LADO IZQUIERDO: BUILDER (Igual al anterior) */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-yellow-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/primer-bloque")} className="p-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 text-xs font-bold hover:bg-yellow-500/10 transition-all italic">Volver</button>
                    <h2 className="text-xs font-black uppercase text-yellow-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> WarningDeck Builder</h2>
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
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-yellow-500 font-bold text-xl uppercase">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all transform hover:scale-105 ${cant > 0 ? 'border-yellow-500 shadow-[0_0_15px_#eab308]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-black text-xl border-2 border-white shadow-xl">{cant}</div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-yellow-600"><Search size={14} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR DERECHO */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-slate-950">
                <div className="p-5 border-b border-yellow-500/30 bg-slate-900/50 font-black text-yellow-500 uppercase flex justify-between shadow-xl">
                    <span>Mi Grimorio</span>
                    <span className={totalCartas === 50 ? 'text-green-500' : 'text-slate-300'}>{totalCartas} / 50</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t}>
                            <h3 className="text-yellow-500 text-[11px] font-black uppercase mb-3 border-b border-orange-600/20 italic">{t}</h3>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2 px-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-yellow-600/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-yellow-500 w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 uppercase text-[11px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleAdd(c)} className="w-7 h-7 flex items-center justify-center bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg"><Plus size={14}/></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-7 h-7 flex items-center justify-center bg-red-500/20 hover:bg-red-600 text-red-400 rounded-lg"><Minus size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 border-t border-white/5 flex flex-col gap-3">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 border border-white/5"><Eye size={16} /> Ver Infografía HD</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-2xl font-black text-[11px] uppercase shadow-xl"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* MODAL GALERÍA HD (NUEVO DISEÑO ELMETA) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in text-white">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-yellow-500 italic flex items-center gap-2 tracking-tighter"><Layout size={20} /> Generador de Infografía Pro</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-[#0c0e14]">
                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 mb-4 text-center">
                            <p className="text-slate-400 text-sm italic font-bold">Generando previsualización real...</p>
                        </div>
                        {/* Canvas de Previsualización */}
                        <div className="w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden border border-white/10">
                            <canvas ref={canvasPreviewRef} className="w-full h-auto block bg-slate-900" />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center gap-4">
                        <button onClick={() => generateCanvas(true)} disabled={guardando} className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 uppercase text-sm tracking-widest active:scale-95 transition-all">
                             <Camera size={20} /> {guardando ? 'FORJANDO...' : 'Descargar Imagen Final'}
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
                        <div className="mt-8 flex items-center justify-center gap-10 bg-slate-900/90 p-4 px-10 rounded-full border border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={24} strokeWidth={3} /></button>
                            <span className="text-4xl font-black text-white leading-none">{mazo.find(x => x.slug === cardToZoom.slug)?.cantidad || 0}</span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={24} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL GUARDAR */}
            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-yellow-500 tracking-tighter italic text-center">Guardar Estrategia PB</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-600 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
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
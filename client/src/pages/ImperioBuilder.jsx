import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
// ✅ Iconos Lucide
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Star, Layers, Shield, Sword
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
    { id: "Aliado", label: "Aliado", icon: <Users size={14} />, color: "border-blue-500 text-blue-400" },
    { id: "Talismán", label: "Talismán", icon: <Shield size={14} />, color: "border-purple-500 text-purple-400" },
    { id: "Arma", label: "Arma", icon: <Layout size={14} />, color: "border-red-500 text-red-400" },
    { id: "Tótem", label: "Tótem", icon: <Layout size={14} />, color: "border-green-500 text-green-400" },
    { id: "Oro", label: "Oro", icon: <Globe size={14} />, label: "Oro", color: "border-yellow-500 text-yellow-400" }
];

const ORDER_TYPES = ["Oro", "Aliado", "Talismán", "Arma", "Tótem"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function ImperioBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);

    const formato = "imperio";
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

    // ✅ Listado lateral: Clasificación por tipo
    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { 
            const t = c.type || "Otros"; 
            if (!g[t]) g[t] = []; 
            g[t].push(c); 
        });
        return g;
    }, [mazo]);

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { if (counts[c.type] !== undefined) counts[c.type] += c.cantidad; });
        return { counts };
    }, [mazo]);

    // ✅ Carga del mazo para edición (Fix de normalización)
    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            if (d.format === "imperio") {
                setNombreMazo(d.name || "");
                setEditingDeckId(d._id);
                setIsPublic(d.isPublic || false);
                setMazo(d.cards.map(c => ({ 
                    ...c, 
                    cantidad: c.quantity || c.cantidad || 1, 
                    imgUrl: getImg(c) 
                })));
            }
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

    // ✅ handleAdd funcional para asegurar que se agregue a la lista de la derecha
    const handleAdd = (c) => {
        setMazo(prevMazo => {
            const ex = prevMazo.find(x => x.slug === c.slug);
            if (prevMazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) {
                alert("Mazo lleno");
                return prevMazo;
            }
            if (ex) {
                if (ex.cantidad < 3) {
                    return prevMazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x);
                }
                return prevMazo;
            }
            // Agregamos la carta asegurando que herede el 'type' para la agrupación
            return [...prevMazo, { ...c, cantidad: 1, imgUrl: getImg(c) }];
        });
    };

    const handleRemove = (slug) => setMazo(prev => prev.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

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
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            if (res.ok) navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    // ✅ handleTakeScreenshot íntegro (Igual que PB pero con colores de Imperio)
    const handleTakeScreenshot = async () => {
        setGuardando(true);
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const rows = Math.ceil(mazo.length / 8);
            canvas.width = 1200;
            canvas.height = 250 + (rows * 200) + 150; 
            ctx.fillStyle = "#0f0a07"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const loadImg = (url) => new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = url;
            });

            const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/cartas-pb-webp/refs/heads/main/logo.png");
            if (logo) {
                ctx.globalAlpha = 0.05;
                ctx.drawImage(logo, canvas.width/2 - 300, canvas.height/2 - 300, 600, 600);
                ctx.globalAlpha = 1.0;
            }

            ctx.fillStyle = "#f97316"; 
            ctx.font = "bold 24px Arial";
            ctx.fillText("WORKSHOP IMPERIO", 50, 60);
            ctx.fillStyle = "white";
            ctx.font = "italic bold 60px Arial";
            ctx.fillText(nombreMazo.toUpperCase() || "ESTRATEGIA", 50, 130);
            ctx.fillStyle = "#f97316";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "right";
            ctx.fillText(`${mazo.reduce((a, b) => a + b.cantidad, 0)} CARTAS`, 1150, 130);
            ctx.textAlign = "left";

            let x = 50, y = 180;
            for (const card of mazo) {
                const img = await loadImg(card.imgUrl);
                if (img) {
                    ctx.drawImage(img, x, y, 125, 175);
                    ctx.fillStyle = "#f97316";
                    ctx.fillRect(x + 95, y + 150, 30, 25);
                    ctx.fillStyle = "white";
                    ctx.font = "bold 16px Arial";
                    ctx.fillText(`x${card.cantidad}`, x + 100, y + 170);
                }
                x += 140;
                if (x > 1100) { x = 50; y += 200; }
            }

            const distY = canvas.height - 110;
            let startX = 50;
            ORDER_TYPES.forEach((type) => {
                ctx.fillStyle = "#1e1b18";
                ctx.fillRect(startX, distY, 210, 80);
                ctx.fillStyle = "#f97316";
                ctx.font = "bold 14px Arial";
                ctx.fillText(type.toUpperCase(), startX + 15, distY + 30);
                ctx.fillStyle = "white";
                ctx.font = "bold 35px Arial";
                ctx.fillText(statsForExport.counts[type] || 0, startX + 15, distY + 68);
                startX += 230;
            });

            canvas.toBlob((blob) => {
                saveAs(blob, `WD_Imp_${nombreMazo || "Deck"}.png`);
                setGuardando(false);
            });
        } catch (err) { alert('Error generando imagen'); setGuardando(false); }
    };

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500/10 transition-all italic tracking-tighter">Volver</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Imperio</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500 font-bold" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-orange-400">{Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {TIPOS_IMPERIO.map((tipo) => (
                            <button key={tipo.id} onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-[10px] uppercase font-black ${tipoSeleccionado === tipo.id ? `border-orange-500 text-orange-500 bg-slate-800 shadow-lg` : 'border-slate-800 text-slate-500'}`}>
                                {tipo.icon} {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-bold uppercase tracking-tighter">Invocando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_15px_#f97316]' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {cant > 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-pulse"><div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl border-2 border-white shadow-xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 hover:bg-orange-600 transition-colors"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR DERECHO (REPARADO) */}
            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-gradient-to-b from-slate-900 via-[#0f0a07] to-black shadow-2xl">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 backdrop-blur-md font-black text-orange-500 uppercase tracking-widest flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-2"><Layout size={18}/><span className="italic">Grimorio Imperio</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs transition-all duration-500 border ${totalCartas === 50 ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{totalCartas} / 50</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3"><div className="h-[2px] flex-1 bg-gradient-to-r from-orange-600/50 to-transparent"></div><h3 className="text-orange-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3></div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 group hover:bg-orange-600/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-slate-800 text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-200 uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-orange-500/20 hover:bg-orange-500 text-orange-500 rounded-xl active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-600 text-red-400 rounded-xl active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={handleTakeScreenshot} className="w-full bg-slate-800 hover:bg-blue-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-white/5"><Camera size={16} /> Descargar Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 shadow-xl"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* MODALES REINTEGRADOS */}
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

            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 uppercase text-orange-500 tracking-tighter italic text-center">Guardar Estrategia Imperio</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-yellow-500 mb-4 transition-all text-white font-bold" placeholder="Nombre del mazo..." />
                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl cursor-pointer hover:bg-slate-950 transition-colors">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                            <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tighter">Arena Global <Globe size={14} className="inline ml-1 text-orange-500" /></span>
                        </label>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalGuardarOpen(false)} className="text-slate-400 font-black px-4 hover:text-white transition-colors uppercase italic text-xs tracking-widest">Cancelar</button>
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-2 italic"><Save size={16} /> Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
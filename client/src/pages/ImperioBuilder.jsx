import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from 'file-saver';
import BACKEND_URL from "../config";
import { 
    Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
    Users, Star, Sword, ChevronDown, ShieldAlert, Filter 
} from "lucide-react";

const TYPE_MAP = { "1": "Aliado", "2": "Talismán", "3": "Arma", "4": "Tótem", "5": "Oro" };

// ✅ LISTA DE RAZAS PARA IMPERIO
const RAZAS_IMPERIO = [
    "Caballero", "Eterno", "Héroe", "Faerie", "Dragón", "Bestia", "Guerrero", "Sacerdote", "Sombra"
];

const EDICIONES_IMPERIO = { 
    "kvsm_titanes": "KVSM Titanes",
    "25_Aniversario_Imp": "25 Aniversario",
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
    { id: "1", label: "Aliado", icon: <Users size={14} />, color: "border-blue-500 text-blue-400" },
    { id: "2", label: "Talismán", icon: <Layout size={14} />, color: "border-purple-500 text-purple-400" },
    { id: "3", label: "Arma", icon: <Layout size={14} />, color: "border-red-500 text-red-400" },
    { id: "4", label: "Tótem", icon: <Layout size={14} />, color: "border-green-500 text-green-400" },
    { id: "5", label: "Oro", icon: <Globe size={14} />, label: "Oro", color: "border-yellow-500 text-yellow-400" }
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
    const [razaSeleccionada, setRazaSeleccionada] = useState(""); 
    const [busqueda, setBusqueda] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mazo, setMazo] = useState([]);
    const [nombreMazo, setNombreMazo] = useState("");
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [showMobileList, setShowMobileList] = useState(false);
    const [cardToZoom, setCardToZoom] = useState(null);
    const [guardando, setGuardando] = useState(false);
    
    // ✅ ESTADO PARA MANO DE PRUEBA
    const [manoPrueba, setManoPrueba] = useState([]);

    // ✅ Cálculo de totalCartas al inicio para evitar ReferenceError
    const totalCartas = useMemo(() => mazo.reduce((acc, c) => acc + c.cantidad, 0), [mazo]);

    const mazoAgrupado = useMemo(() => {
        const g = {};
        mazo.forEach(c => { 
            const t = TYPE_MAP[String(c.type)] || "Otros"; 
            if (!g[t]) g[t] = []; 
            g[t].push(c); 
        });
        return g;
    }, [mazo]);

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => { 
            const typeName = TYPE_MAP[String(c.type)];
            if (counts[typeName] !== undefined) counts[typeName] += c.cantidad; 
        });
        return { counts };
    }, [mazo]);

    // ✅ FUNCIÓN SIMULADOR DE MANO
    const simularMano = () => {
        let baraja = [];
        mazo.forEach(c => { for (let i = 0; i < c.cantidad; i++) baraja.push(c); });
        if (baraja.length < 8) return alert("Necesitas al menos 8 cartas en el mazo");
        for (let i = baraja.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
        }
        setManoPrueba(baraja.slice(0, 8));
    };

    useEffect(() => {
        if (location.state?.deckToEdit) {
            const d = location.state.deckToEdit;
            setNombreMazo(location.state.isCloning ? `${d.name} (Copia)` : d.name || "");
            setEditingDeckId(location.state.isCloning ? null : d._id);
            setIsPublic(d.isPublic || false);
            setMazo(d.cards.map(c => ({ 
                ...c, 
                cantidad: c.quantity || c.cantidad || 1, 
                imgUrl: getImg(c),
                type: String(c.type)
            })));
        }
    }, [location.state]);

    // ✅ EFECTO DE BÚSQUEDA CORREGIDO
    useEffect(() => {
        const fetchCartas = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("format", formato);
                
                if (busqueda) {
                    params.append("q", busqueda);
                } else {
                    params.append("edition", edicionSeleccionada);
                }
                
                if (razaSeleccionada) {
                    params.append("type", "1");
                    params.append("race", razaSeleccionada);
                } else if (tipoSeleccionado) {
                    params.append("type", tipoSeleccionado);
                }

                const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
                const data = await res.json();
                setCartas(Array.isArray(data) ? data : (data.results || []));
            } catch (e) { 
                console.error("Error fetching cards:", e); 
            } finally { 
                setLoading(false); 
            }
        };
        const timer = setTimeout(fetchCartas, 300);
        return () => clearTimeout(timer);
    }, [busqueda, edicionSeleccionada, tipoSeleccionado, razaSeleccionada, formato]);

    const handleAdd = (c) => {
        if (c.restriction === "banned") return alert(`🚫 ${c.name} está PROHIBIDA.`);
        const copiasMismoNombre = mazo
            .filter(x => x.name.toLowerCase().trim() === c.name.toLowerCase().trim())
            .reduce((acc, curr) => acc + curr.cantidad, 0);

        if (totalCartas >= 50 && !mazo.find(x => x.slug === c.slug)) return alert("Mazo lleno (Máximo 50 cartas)");

        let limit = 3;
        if (c.restriction === "limited1") limit = 1;
        if (c.restriction === "limited2") limit = 2;

        if (copiasMismoNombre >= limit) return alert(`⚠️ Sólo puedes tener ${limit} copia(s) de "${c.name}" en total.`);

        setMazo(prevMazo => {
            const ex = prevMazo.find(x => x.slug === c.slug);
            if (ex) return prevMazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x);
            return [...prevMazo, { ...c, cantidad: 1, imgUrl: getImg(c), type: String(c.type) }];
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
            
            const deckData = {
                name: nombreMazo,
                cards: mazo.map(c => ({ ...c, quantity: c.cantidad })),
                format: "imperio", 
                isPublic: isPublic
            };

            const res = await fetch(url, { 
                method, 
                headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify(deckData) 
            });

            if (res.ok) navigate("/my-decks");
            else {
                const err = await res.json();
                alert(err.error || "Error al guardar");
            }
        } catch (e) { alert("Error de conexión"); } finally { setGuardando(false); }
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
            ctx.fillStyle = "#0f0a07"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const loadImg = (url) => new Promise((resolve) => {
                const img = new Image(); img.crossOrigin = "anonymous";
                img.onload = () => resolve(img); img.onerror = () => resolve(null);
                img.src = url;
            });
            const logo = await loadImg("https://raw.githubusercontent.com/alexisTobar/deck-myl-assets/refs/heads/main/forja.png");
            if (logo) {
                ctx.save(); ctx.globalAlpha = 0.04;
                ctx.drawImage(logo, canvas.width/2 - 350, canvas.height/2 - 350, 700, 700);
                ctx.restore(); ctx.drawImage(logo, 50, 30, 80, 80);
            }
            ctx.fillStyle = "#f97316"; ctx.font = "bold 24px Arial";
            ctx.fillText("WORKSHOP IMPERIO", 150, 60);
            ctx.fillStyle = "white"; ctx.font = "italic bold 55px Arial";
            ctx.fillText(nombreMazo.toUpperCase() || "ESTRATEGIA", 150, 110);
            
            let curX = 50, curY = 180;
            for (const card of mazo) {
                const img = await loadImg(card.imgUrl);
                if (img) {
                    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10;
                    ctx.drawImage(img, curX, curY, 105, 147); ctx.shadowBlur = 0;
                    ctx.fillStyle = "#f97316";
                    if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(curX+75, curY+120, 32, 28, 8); ctx.fill(); }
                    else ctx.fillRect(curX+75, curY+120, 32, 28);
                    ctx.fillStyle = "white"; ctx.font = "bold 16px Arial";
                    ctx.fillText(`x${card.cantidad}`, curX+79, curY+140);
                }
                curX += 112; if (curX > 1120) { curX = 50; curY += 165; }
            }
            const footerY = canvas.height - 150; let startX = 50;
            ORDER_TYPES.forEach((type) => {
                const count = statsForExport.counts[type] || 0;
                const perc = totalCartas > 0 ? (count / totalCartas) : 0;
                ctx.fillStyle = "#1e1b18";
                if(ctx.roundRect) { ctx.beginPath(); ctx.roundRect(startX, footerY, 215, 100, 20); ctx.fill(); ctx.strokeStyle = "#f9731633"; ctx.stroke(); }
                ctx.fillStyle = "#f97316"; ctx.font = "bold 12px Arial"; ctx.fillText(type.toUpperCase(), startX + 15, footerY + 30);
                ctx.fillStyle = "white"; ctx.font = "bold 40px Arial"; ctx.fillText(count, startX + 15, footerY + 75);
                ctx.fillStyle = "#332211"; ctx.fillRect(startX + 15, footerY + 85, 175, 6);
                ctx.fillStyle = "#f97316"; ctx.fillRect(startX + 15, footerY + 85, 175 * perc, 6);
                startX += 230;
            });
            ctx.fillStyle = "#475569"; ctx.font = "12px Arial";
            ctx.fillText("GENERADO POR WARNING DECK BUILDER • 2025", 50, canvas.height - 20);
            canvas.toBlob((blob) => { saveAs(blob, `WD_Imp_${nombreMazo || "Deck"}.png`); setGuardando(false); });
        } catch (err) { alert('Error imagen'); setGuardando(false); }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#F8FAFC] dark:bg-[#0f0a07] text-slate-900 dark:text-white overflow-hidden transition-colors duration-500">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-sm z-20">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-slate-200 dark:border-orange-500/30 text-slate-500 dark:text-orange-500 text-xs font-bold hover:bg-slate-100 dark:hover:bg-orange-500/10 transition-all italic tracking-tighter uppercase">Volver</button>
                    <h2 className="text-xs font-black uppercase text-blue-600 dark:text-orange-500 tracking-widest leading-none italic flex items-center gap-2"><Star size={14}/> Forja Imperio</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-white/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 space-y-4 z-10 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <select value={edicionSeleccionada} onChange={(e) => { setEdicionSeleccionada(e.target.value); setBusqueda(""); }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-orange-400 p-2.5 rounded-xl appearance-none font-black outline-none focus:border-blue-500 dark:focus:border-orange-500 cursor-pointer text-sm transition-all"
                            >
                                {Object.entries(EDICIONES_IMPERIO).map(([id, label]) => (
                                    <option key={id} value={id}>{label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        <input type="text" placeholder="Búsqueda Global..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-[2] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-blue-500 dark:focus:border-orange-500 font-bold transition-all text-slate-900 dark:text-white" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {TIPOS_IMPERIO.map((tipo) => (
                            <button key={tipo.id} 
                                onClick={() => { setTipoSeleccionado(tipoSeleccionado === tipo.id ? "" : tipo.id); setRazaSeleccionada(""); }} 
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-[10px] uppercase font-black ${tipoSeleccionado === tipo.id ? `border-blue-600 dark:border-orange-500 text-blue-600 dark:text-orange-500 bg-blue-50 dark:bg-slate-800 shadow-md` : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                                {tipo.icon} {tipo.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-slate-200 dark:border-white/5">
                        <button onClick={() => setRazaSeleccionada("")} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all border ${razaSeleccionada === "" ? 'bg-slate-800 text-white border-slate-700' : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'}`}>Todas</button>
                        {RAZAS_IMPERIO.map(raza => (
                            <button key={raza} onClick={() => { setRazaSeleccionada(razaSeleccionada === raza ? "" : raza); setTipoSeleccionado(""); }}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all border ${razaSeleccionada === raza ? 'bg-blue-600 dark:bg-orange-600 text-white border-blue-500 dark:border-orange-400 shadow-lg scale-105' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-orange-500'}`}
                            >
                                {raza}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-4" ref={gridContainerRef}>
                    {loading ? <div className="text-center mt-20 animate-pulse text-blue-600 dark:text-orange-500 font-black uppercase tracking-widest italic">Invocando grimorio...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${cant > 0 ? 'border-blue-600 dark:border-orange-500 shadow-xl' : 'border-slate-200 dark:border-slate-800'} ${c.restriction === 'banned' ? 'opacity-40 grayscale' : ''}`}>
                                            <img src={getImg(c)} className="w-full h-auto transition-transform" alt={c.name} />
                                            {c.restriction && c.restriction !== 'unrestricted' && (
                                                <div className="absolute top-1 left-1 bg-red-600 p-1 rounded-md text-[8px] font-black uppercase text-white shadow-xl flex items-center gap-1">
                                                    <ShieldAlert size={10}/> {c.restriction === 'banned' ? 'BAN' : c.restriction === 'limited1' ? '1' : '2'}
                                                </div>
                                            )}
                                            {cant > 0 && <div className="absolute inset-0 bg-blue-600/20 dark:bg-black/40 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-orange-500 text-white flex items-center justify-center font-black text-xl border-2 border-white shadow-2xl">{cant}</div></div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setCardToZoom(c); }} className="absolute top-1.5 right-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-white w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/20 hover:bg-blue-600 dark:hover:bg-orange-600 hover:text-white transition-all"><Search size={14} strokeWidth={3} /></button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-slate-200 dark:border-white/10 flex-col h-screen bg-white dark:bg-[#0f0a07] shadow-2xl transition-colors duration-500">
                <div className="p-5 border-b border-slate-200 dark:border-orange-500/30 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col gap-2 shadow-sm">
                    <div className="flex justify-between items-center text-slate-900 dark:text-orange-500 font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Layout size={18}/><span className="italic">Grimorio Imperio</span></div>
                        <div className={`px-3 py-1 rounded-full text-xs font-black transition-all duration-500 border ${totalCartas === 50 ? 'bg-blue-600 dark:bg-orange-500/10 border-blue-600 dark:border-orange-500 text-white dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>{totalCartas} / 50</div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 pt-1">
                        {ORDER_TYPES.map(type => (
                            <div key={type} className="flex flex-col items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-white/5">
                                <span className="text-[7px] font-black text-slate-400 uppercase">{type}</span>
                                <span className="text-[10px] font-black text-slate-700 dark:text-orange-500">{statsForExport.counts[type] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-transparent">
                    {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                        <div key={t} className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 mb-3"><div className="h-[2px] flex-1 bg-gradient-to-r from-blue-600 dark:from-orange-600/50 to-transparent"></div><h3 className="text-blue-600 dark:text-orange-500 text-[11px] font-black uppercase tracking-tighter italic px-2">{t}</h3></div>
                            <div className="space-y-2">
                                {mazoAgrupado[t].map(c => (
                                    <div key={c.slug} className="flex justify-between items-center text-sm py-2.5 px-4 bg-slate-50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-blue-400 dark:hover:border-orange-500/30 transition-all duration-300 shadow-sm">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setCardToZoom(c)}>
                                            <div className="bg-white dark:bg-slate-800 text-blue-600 dark:text-orange-400 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm border dark:border-0">{c.cantidad}</div>
                                            <span className="truncate font-bold text-slate-700 dark:text-slate-200 uppercase text-[12px]">{c.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleAdd(c)} className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-orange-500/20 text-blue-600 dark:text-orange-500 rounded-xl hover:bg-blue-600 dark:hover:bg-orange-500 hover:text-white transition-colors"><Plus size={16} strokeWidth={3} /></button>
                                            <button onClick={() => handleRemove(c.slug)} className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-colors"><Minus size={16} strokeWidth={3} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex flex-col gap-3 transition-all shadow-inner">
                    <button onClick={simularMano} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-indigo-600 text-slate-700 dark:text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 shadow-sm transition-all"><Eye size={16} /> Mano de Prueba</button>
                    <button onClick={handleTakeScreenshot} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-700 dark:text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 shadow-sm transition-all"><Camera size={16} /> Descargar Imagen</button>
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full bg-blue-600 dark:bg-orange-600 hover:bg-blue-700 dark:hover:bg-orange-500 text-white py-3 rounded-2xl font-black text-[11px] uppercase active:scale-95 flex items-center justify-center gap-2 shadow-xl transition-all"><Save size={16} /> Guardar Mazo</button>
                </div>
            </div>

            {/* DOCK MÓVIL */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 pb-6 z-50 flex items-center justify-between shadow-2xl transition-colors">
                <div className="flex flex-col px-3"><span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">TOTAL</span><span className={`text-xl font-black leading-none ${totalCartas === 50 ? 'text-green-600 dark:text-green-500' : 'text-slate-900 dark:text-white'}`}>{totalCartas}/50</span></div>
                <div className="flex gap-2">
                    <button onClick={simularMano} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase border border-slate-200 dark:border-slate-700">Mano</button>
                    <button onClick={() => setShowMobileList(true)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase border border-slate-200 dark:border-slate-700">Lista</button>
                    {/* ✅ BOTÓN DESCARGAR IMAGEN EN MÓVIL */}
                    <button onClick={handleTakeScreenshot} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-3 py-2 rounded-xl font-black text-[10px] uppercase border border-slate-200 dark:border-slate-700 flex items-center justify-center"><Camera size={18} /></button>
                    <button onClick={() => setModalGuardarOpen(true)} className="bg-blue-600 dark:bg-orange-600 text-white px-5 py-2 rounded-xl font-black text-xs shadow-lg flex items-center justify-center"><Save size={16} /></button>
                </div>
            </div>

            {/* ✅ MODALES */}
            {manoPrueba.length > 0 && (
                <div className="fixed inset-0 bg-slate-950/95 z-[300] flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in">
                    <h3 className="text-xl md:text-2xl font-black text-blue-500 dark:text-orange-500 uppercase italic mb-8 tracking-widest text-center">Mano Inicial</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 max-w-6xl px-4">
                        {manoPrueba.map((c, i) => (
                            <div key={i} className="animate-in slide-in-from-bottom-4" style={{ transitionDelay: `${i * 50}ms` }}>
                                <img src={getImg(c)} className="w-full rounded-lg shadow-2xl border border-white/10" alt="mano" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 flex gap-4">
                        <button onClick={simularMano} className="bg-blue-600 dark:bg-orange-600 text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Mulligan</button>
                        <button onClick={() => setManoPrueba([])} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 active:scale-95 transition-all">Cerrar</button>
                    </div>
                </div>
            )}

            {showMobileList && (
                <div className="md:hidden fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end" onClick={() => setShowMobileList(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] h-[80vh] p-6 overflow-hidden border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black uppercase text-blue-600 dark:text-orange-500 italic tracking-tighter">Mi Grimorio ({totalCartas}/50)</h3>
                            <div className="flex gap-2">
                                {/* ✅ BOTÓN DESCARGAR IMAGEN EN LISTA MÓVIL */}
                                <button onClick={handleTakeScreenshot} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-blue-600 dark:text-orange-500 border border-slate-200 dark:border-slate-700"><Camera size={20}/></button>
                                <button onClick={() => setShowMobileList(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 transition-colors hover:text-red-500"><X size={24} /></button>
                            </div>
                        </div>
                        {/* ✅ CONTADORES MÓVIL */}
                        <div className="grid grid-cols-5 gap-1 mb-4">
                            {ORDER_TYPES.map(type => (
                                <div key={type} className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-white/5">
                                    <span className="text-[6px] font-black text-slate-400 uppercase">{type}</span>
                                    <span className="text-xs font-black text-slate-700 dark:text-orange-500">{statsForExport.counts[type] || 0}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {ORDER_TYPES.map(t => mazoAgrupado[t] && (
                                <div key={t} className="mb-6">
                                    <h4 className="text-slate-400 dark:text-orange-600 text-[10px] font-black uppercase mb-3 tracking-widest border-b dark:border-orange-800 pb-1">{t}</h4>
                                    <div className="space-y-3">
                                        {mazoAgrupado[t].map(c => (
                                            <div key={c.slug} className="flex justify-between items-center py-2">
                                                <div className="flex items-center gap-3">
                                                    <img src={getImg(c)} className="w-12 h-16 rounded-xl shadow-md object-cover border border-slate-100 dark:border-0" alt={c.name} />
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-[150px]">{c.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-950 p-2 px-5 rounded-2xl">
                                                    <button onClick={() => handleRemove(c.slug)} className="text-red-500 active:scale-90 transition-transform"><Minus size={20} strokeWidth={3}/></button>
                                                    <span className="font-black text-slate-800 dark:text-white text-base w-4 text-center">{c.cantidad}</span>
                                                    <button onClick={() => handleAdd(c)} className="text-green-500 active:scale-90 transition-transform"><Plus size={20} strokeWidth={3}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {cardToZoom && (
                <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300" onClick={() => setCardToZoom(null)}>
                    <button onClick={() => setCardToZoom(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl z-[410] transition-all"><X size={24} strokeWidth={3} /></button>
                    <div className="relative max-w-sm w-full flex flex-col items-center animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
                        <img src={getImg(cardToZoom)} className="w-full h-auto rounded-[2rem] shadow-[0_0_50px_rgba(37,99,235,0.3)] dark:shadow-[0_0_50px_rgba(249,115,22,0.3)] border-4 border-white/20" alt="zoom" />
                        <div className="mt-8 flex items-center justify-center gap-10 bg-white/90 dark:bg-slate-900/90 p-5 px-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-lg">
                            <button onClick={() => handleRemove(cardToZoom.slug)} className="w-14 h-14 rounded-2xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Minus size={28} strokeWidth={3} /></button>
                            <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">
                                {mazo.filter(x => x.name.toLowerCase().trim() === cardToZoom.name.toLowerCase().trim()).reduce((acc, curr) => acc + curr.cantidad, 0)}
                            </span>
                            <button onClick={() => handleAdd(cardToZoom)} className="w-14 h-14 rounded-2xl bg-green-500/10 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all active:scale-90"><Plus size={28} strokeWidth={3} /></button>
                        </div>
                    </div>
                </div>
            )}

            {modalGuardarOpen && (
                <div className="fixed inset-0 bg-slate-950/90 z-[500] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setModalGuardarOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-8 uppercase text-blue-600 dark:text-orange-500 tracking-tighter italic text-center leading-none">Archivar<br/>Estrategia Imperio</h3>
                        <input value={nombreMazo} onChange={(e) => setNombreMazo(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 dark:focus:border-orange-500 mb-4 transition-all text-slate-900 dark:text-white font-black uppercase text-sm tracking-widest" placeholder="NOMBRE DEL MAZO..." />
                        <label className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-950 transition-colors border border-slate-200 dark:border-slate-700">
                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-6 h-6 rounded-lg accent-blue-600 dark:accent-orange-600" />
                            <span className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest italic">Publicar en Arena <Globe size={14} className="inline ml-1 text-blue-600 dark:text-orange-500" /></span>
                        </label>
                        <div className="flex flex-col gap-2 mt-10">
                            <button onClick={handleSaveDeck} disabled={guardando || !nombreMazo.trim()} className="w-full bg-blue-600 dark:bg-orange-600 text-white dark:text-black py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 italic"><Save size={18} /> CONFIRMAR</button>
                            <button onClick={() => setModalGuardarOpen(false)} className="w-full text-slate-400 font-black py-2 hover:text-slate-600 dark:hover:text-white transition-colors uppercase italic text-[10px] tracking-[0.2em]">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
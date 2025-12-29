import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";
import { 
  Plus, Minus, Eye, Save, Search, X, Camera, Globe, Layout, 
  ShieldCheck, Users, Shield 
} from "lucide-react";

const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "25_Aniversario_Imp": "25 aniversario", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
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
    const location = useLocation();
    const gridContainerRef = useRef(null);
    const galleryRef = useRef(null);

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
    const [guardando, setGuardando] = useState(false);

    const statsForExport = useMemo(() => {
        const counts = { Aliado: 0, Talismán: 0, Arma: 0, Tótem: 0, Oro: 0 };
        mazo.forEach(c => {
            const label = c.type;
            if (counts[label] !== undefined) counts[label] += c.cantidad;
        });
        return { counts };
    }, [mazo]);

    // ✅ REPARADO: Lógica de carga para edición de mazos Imperio
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
    }, [busqueda, edicionSeleccionada, tipoSeleccionado]);

    const handleAdd = (c) => {
        const ex = mazo.find(x => x.slug === c.slug);
        if (mazo.reduce((a, b) => a + b.cantidad, 0) >= 50 && !ex) return alert("Mazo lleno");
        if (ex) { if (ex.cantidad < 3) setMazo(mazo.map(x => x.slug === c.slug ? { ...x, cantidad: x.cantidad + 1 } : x)); }
        else setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]);
    };

    const handleRemove = (slug) => setMazo(mazo.map(c => c.slug === slug ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const handleTakeScreenshot = useCallback(async () => {
        if (!galleryRef.current) return;
        setGuardando(true);
        try {
            const dataUrl = await toPng(galleryRef.current, { quality: 1.0, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `WarningDeck_Imp_${nombreMazo || "Deck"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { alert('Error captura'); } finally { setGuardando(false); }
    }, [nombreMazo]);

    const handleSaveDeck = async () => {
        if (!nombreMazo.trim()) return alert("Nombre requerido");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        setGuardando(true);
        try {
            const url = editingDeckId ? `${BACKEND_URL}/api/decks/${editingDeckId}` : `${BACKEND_URL}/api/decks`;
            const method = editingDeckId ? "PUT" : "POST";
            await fetch(url, { 
                method, headers: { "Content-Type": "application/json", "auth-token": token }, 
                body: JSON.stringify({ name: nombreMazo, cards: mazo.map(c => ({...c, quantity: c.cantidad})), format: formato, isPublic: isPublic }) 
            });
            navigate("/my-decks");
        } catch (e) { alert("Error"); } finally { setGuardando(false); }
    };

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#0f0a07] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/80 border-b border-orange-500/20 p-3 flex justify-between items-center px-4 shadow-xl">
                    <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all uppercase italic">← Workshop</button>
                    <h2 className="text-xs font-black uppercase text-orange-500 tracking-widest italic">Imperio Workshop</h2>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 bg-slate-900/40 border-b border-slate-800 space-y-4">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Búsqueda..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm outline-none focus:border-orange-500 font-bold" />
                        <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-[13px] font-bold text-orange-400">{Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}</select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
                    {loading ? <div className="text-center mt-20 animate-pulse text-orange-500 font-black uppercase">Escaneando...</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="group relative">
                                        <div 
                                            onClick={() => handleAdd(c)}
                                            className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-500 transform group-hover:scale-105 ${cant > 0 ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]' : 'border-slate-800 hover:border-orange-500/50'}`}
                                        >
                                            <img src={getImg(c)} className="w-full h-auto" alt={c.name} />
                                            {cant > 0 && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl border-2 border-white ring-4 ring-orange-600/20">{cant}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-85 border-l border-white/10 flex-col h-screen bg-[#0f0a07]">
                <div className="p-5 border-b border-orange-500/30 bg-slate-900/50 font-black text-orange-500 flex justify-between shadow-xl">
                    <span>Mi Deck</span>
                    <span className={totalCartas === 50 ? 'text-green-500' : 'text-slate-300'}>{totalCartas} / 50</span>
                </div>
                <div className="p-5 flex flex-col gap-2">
                    <button onClick={() => setModalMazoOpen(true)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase italic border border-white/10 active:scale-95 transition-all">Ver Galería</button>
                </div>
            </div>

            {/* ✅ MODAL EXPORTACIÓN HD (IMPERIO) */}
            {modalMazoOpen && (
                <div className="fixed inset-0 bg-black z-[120] flex flex-col overflow-hidden animate-fade-in text-white">
                    <div className="p-4 bg-slate-900 flex justify-between items-center px-6 border-b border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-black uppercase text-orange-500 italic flex items-center gap-2 tracking-tighter"><Layout size={20} /> Exportar Estrategia</h2>
                        <button onClick={() => setModalMazoOpen(false)} className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-10 bg-[#0f0a07] flex flex-col items-center">
                        <div className="w-full max-w-4xl space-y-6 md:hidden">
                            <h1 className="text-3xl font-black uppercase text-center text-orange-500 italic leading-none">{nombreMazo || "Deck Imperio"}</h1>
                            <div className="grid grid-cols-3 gap-2">
                                {mazo.map(c => (
                                    <div key={c.slug} className="relative group shadow-2xl">
                                        <img src={getImg(c)} className="w-full rounded-md border border-white/5" alt={c.name} />
                                        <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[9px] font-black px-1.5 rounded-sm border border-black shadow-xl">x{c.cantidad}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ÁREA DE CAPTURA HD */}
                        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                            <div ref={galleryRef} className="relative w-[1200px] flex flex-col bg-[#0f0a07] p-10 border border-orange-500/10 shadow-2xl overflow-hidden rounded-sm">
                                <div className="flex justify-between items-end mb-8 border-b-2 border-orange-500/20 pb-4 relative z-10 text-white font-black italic">
                                    <div>
                                        <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px] not-italic">Workshop Imperio</span>
                                        <h1 className="text-6xl uppercase tracking-tighter mt-1 leading-none">{nombreMazo || "Estrategia Imperio"}</h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl leading-none">{totalCartas} <span className="text-orange-500 text-xl">CARTAS</span></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest not-italic">WarningDeck.cl</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-8 gap-4 mb-10 relative z-10">
                                    {mazo.map(c => (
                                        <div key={c.slug} className="relative group shadow-2xl">
                                            <img src={getImg(c)} className="w-full rounded-md border border-white/5 shadow-2xl" alt={c.name} />
                                            <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border border-black shadow-xl">x{c.cantidad}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-5 gap-3 relative z-10">
                                    {TIPOS_IMPERIO.map(t => (
                                        <div key={t.id} className="flex flex-col items-center justify-center bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                                            <span className="text-3xl mb-1">{t.icon}</span>
                                            <span className="text-4xl font-black text-white">{statsForExport.counts[t.label] || 0}</span>
                                            <span className="text-[8px] uppercase font-black text-slate-500 mt-1">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-orange-500"><Shield size={650} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-center">
                        <button onClick={handleTakeScreenshot} disabled={guardando} className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 uppercase text-sm active:scale-95 transition-all tracking-widest italic">
                             <Camera size={20} /> {guardando ? 'SINCRONIZANDO...' : 'Descargar Infografía HD'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
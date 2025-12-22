import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BACKEND_URL from "../config";

const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const TIPOS_FILTRO = [ { id: 1, label: "Aliado", value: 1 }, { id: 2, label: "Talismán", value: 2 }, { id: 3, label: "Arma", value: 3 }, { id: 4, label: "Tótem", value: 4 }, { id: 5, label: "Oro", value: 5 } ];
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
    const [cardToZoom, setCardToZoom] = useState(null);
    const [modalGuardarOpen, setModalGuardarOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const fetchCartas = async () => {
            if (!edicionSeleccionada && !busqueda) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ format: formato, edition: edicionSeleccionada });
                if (busqueda) params.append("q", busqueda);
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
        else { setMazo([...mazo, { ...c, cantidad: 1, imgUrl: getImg(c) }]); }
    };

    const handleRemove = (s) => setMazo(mazo.map(c => c.slug === s ? { ...c, cantidad: c.cantidad - 1 } : c).filter(c => c.cantidad > 0));

    const totalCartas = mazo.reduce((acc, c) => acc + c.cantidad, 0);

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans bg-[#110d0a] text-white overflow-hidden">
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="bg-slate-900/50 backdrop-blur-md border-b border-orange-900/30 p-3 flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/imperio")} className="p-1.5 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-slate-800 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-xs font-black uppercase tracking-widest text-orange-500">Constructor Imperio</h2>
                    </div>
                </div>

                <div className="p-4 flex flex-wrap gap-2 items-center bg-slate-900/20 border-b border-slate-800">
                    <div className="flex-1 min-w-[150px] relative">
                        <input type="text" placeholder="Buscar en Imperio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2.5 pl-10 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:ring-1 focus:ring-orange-500" />
                        <span className="absolute left-3 top-3 opacity-40">🔍</span>
                    </div>
                    <select value={edicionSeleccionada} onChange={(e) => setEdicionSeleccionada(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-[10px] font-bold text-orange-500 outline-none">
                        {Object.entries(EDICIONES_IMPERIO).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative cursor-pointer group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${cant > 0 ? 'shadow-[0_0_15px_rgba(249,115,22,0.5)] border-orange-500' : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className={`w-full h-auto ${cant > 0 ? 'brightness-110' : 'brightness-75 group-hover:brightness-100'}`} alt={c.name} />
                                        </div>
                                        <h3 className="text-[8px] text-center mt-1 font-bold text-slate-500 truncate uppercase">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:flex w-80 border-l border-slate-800 flex-col h-screen bg-slate-900/20">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <h2 className="font-black italic text-orange-500">MI DECK IMPERIO</h2>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800">{totalCartas}/50</span>
                </div>
                {/* ... (Lista de cartas lateral) */}
                <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                    <button onClick={() => setModalGuardarOpen(true)} className="w-full py-3 rounded-xl font-black text-xs bg-orange-600 hover:bg-orange-500 shadow-lg">💾 GUARDAR</button>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toPng } from 'html-to-image';
import BACKEND_URL from "../config";

// ... (Mantenemos las constantes EDICIONES_IMPERIO, EDICIONES_PB, RAZAS_PB, etc.)

export default function DeckBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const gridContainerRef = useRef(null);
    
    // El formato ahora viene como PROP o por la URL
    const [formato] = useState(location.pathname.includes("primer-bloque") ? "primer_bloque" : "imperio");
    
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
    const [cardToZoom, setCardToZoom] = useState(null);

    // --- CONFIGURACIÓN VISUAL DINÁMICA ---
    const isPB = formato === "primer_bloque";
    const themeColor = isPB ? "yellow-500" : "orange-500";
    const glowClass = isPB 
        ? "shadow-[0_0_15px_rgba(234,179,8,0.4)] border-yellow-500/60" 
        : "shadow-[0_0_15px_rgba(249,115,22,0.4)] border-orange-500/60";

    // ... (Mantenemos useEffects de carga, búsqueda y handlers de mazo)

    return (
        <div className={`h-screen flex flex-col md:flex-row font-sans bg-slate-950 text-white overflow-hidden`}>
            
            {/* IZQUIERDA: BUSCADOR CON CABECERA ESTILIZADA */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
                
                {/* Cabecera con efecto de cristal (Glassmorphism) */}
                <div className={`bg-slate-900/50 backdrop-blur-md border-b ${isPB ? 'border-yellow-900/30' : 'border-orange-900/30'} p-3 flex justify-between items-center px-6`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${isPB ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`}></div>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>
                            Constructor: {isPB ? 'Era de Salo' : 'Era de Leyenda'}
                        </h2>
                    </div>
                    <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-500 hover:text-white transition">ESC PARA SALIR</button>
                </div>

                {/* BARRA DE BÚSQUEDA FLOTANTE */}
                <div className="p-4 flex gap-2 items-center">
                    <div className={`flex-1 relative group`}>
                        <input 
                            type="text" 
                            placeholder={`Buscar en ${isPB ? 'el pasado...' : 'el presente...'}`}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className={`w-full p-3 pl-10 rounded-2xl bg-slate-900 border ${isPB ? 'focus:border-yellow-500' : 'focus:border-orange-500'} outline-none transition-all duration-500 shadow-inner text-sm`}
                        />
                        <span className="absolute left-4 top-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
                    </div>
                    {/* Selectores con estilo según formato */}
                    <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-bold">
                        <option value="">Tipo</option>
                        {/* ... mapping tipos */}
                    </select>
                </div>

                {/* GRID DE CARTAS CON EFECTO GLOW */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={gridContainerRef}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center mt-20 gap-4">
                            <div className={`w-12 h-12 border-4 ${isPB ? 'border-yellow-500' : 'border-orange-500'} border-t-transparent rounded-full animate-spin shadow-lg`}></div>
                            <p className={`text-xs font-bold animate-pulse ${isPB ? 'text-yellow-600' : 'text-orange-600'}`}>INVOCANDO CARTAS...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {cartas.map(c => {
                                const cant = mazo.find(x => x.slug === c.slug)?.cantidad || 0;
                                return (
                                    <div key={c.slug} className="relative group" onClick={() => handleAdd(c)}>
                                        <div className={`rounded-xl overflow-hidden border-2 transition-all duration-300 transform group-hover:scale-105 ${cant > 0 ? glowClass : 'border-slate-800'}`}>
                                            <img src={getImg(c)} className={`w-full h-auto ${cant > 0 ? 'brightness-110' : 'brightness-90 group-hover:brightness-100'}`} alt={c.name} />
                                            {cant > 0 && (
                                                <div className={`absolute inset-0 bg-gradient-to-t ${isPB ? 'from-yellow-900/40' : 'from-orange-900/40'} pointer-events-none`}></div>
                                            )}
                                        </div>
                                        {/* Badge de cantidad con estilo */}
                                        {cant > 0 && (
                                            <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xl animate-pop ${isPB ? 'bg-yellow-500 text-black' : 'bg-orange-600 text-white'}`}>
                                                {cant}
                                            </div>
                                        )}
                                        <h3 className="text-[10px] text-center mt-2 font-bold text-slate-500 group-hover:text-white transition uppercase truncate">{c.name}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR DERECHA: EL GRIMORIO */}
            <div className={`hidden md:flex w-85 border-l ${isPB ? 'border-yellow-900/20 bg-[#0c0e14]' : 'border-orange-900/20 bg-[#110d0a]'} flex-col h-screen transition-colors duration-700`}>
                <div className="p-6">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className={`text-2xl font-black italic ${isPB ? 'text-yellow-500' : 'text-orange-500'}`}>MI DECK</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cartas en el mazo</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-4xl font-black ${mazo.length === 50 ? 'text-green-500' : 'text-white'}`}>{mazo.reduce((a,b)=>a+b.cantidad,0)}</span>
                            <span className="text-slate-600 font-bold">/50</span>
                        </div>
                    </div>
                    {/* ... (Lista de cartas agrupadas con los mismos colores dinámicos) */}
                </div>
            </div>
        </div>
    );
}
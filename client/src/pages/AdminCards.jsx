import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

export default function AdminCards() {
    const [step, setStep] = useState("selector"); 
    const [formato, setFormato] = useState(""); 
    const [edicionFiltro, setEdicionFiltro] = useState("");
    const [edicionesDisponibles, setEdicionesDisponibles] = useState([]);
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [showFormMobile, setShowFormMobile] = useState(false); // Control para colapsar form en móvil

    const [formData, setFormData] = useState({
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", rarity: "1"
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (edicionFiltro) fetchCartas();
    }, [edicionFiltro, formato]);

    const fetchEdiciones = async (f) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/cards/search?format=${f}&q=`);
            const data = await res.json();
            const eds = [...new Set(data.map(c => f === "imperio" ? c.edition_slug : c.edition))].filter(Boolean);
            setEdicionesDisponibles(eds);
            if (eds.length > 0 && !edicionFiltro) setEdicionFiltro(eds[0]);
        } catch (e) { console.error(e); }
    };

    const fetchCartas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ format: formato, edition: edicionFiltro });
            const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSelectFormat = (f) => {
        setFormato(f);
        fetchEdiciones(f);
        setFormData({ 
            name: "", slug: "", type: "Aliado", race: "", imgUrl: "", rarity: "1",
            format: f, edition: "", edition_slug: "" 
        });
        setStep("editor");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        const dataToSend = { ...formData };
        if (formato === "imperio") dataToSend.edition_slug = formData.edition;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert("Base de datos actualizada ⚔️");
                if (!edicionesDisponibles.includes(formData.edition)) setEdicionesDisponibles([...edicionesDisponibles, formData.edition]);
                setEdicionFiltro(formData.edition);
                resetForm();
                fetchCartas();
                setShowFormMobile(false);
            }
        } catch (e) { alert("Error al guardar"); }
    };

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ 
            name: "", slug: "", type: "Aliado", race: "", imgUrl: "", rarity: "1",
            format: formato, edition: edicionFiltro, edition_slug: formato === "imperio" ? edicionFiltro : ""
        });
    };

    // --- RENDER PASO 1: SELECTOR ---
    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase italic">Panel Maestro</h1>
                <p className="text-slate-500 mb-10 font-bold tracking-widest text-xs">GESTIÓN DE REINOS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group bg-slate-900 border-2 border-orange-500/20 p-8 md:p-12 rounded-[2.5rem] transition-all hover:border-orange-500 shadow-2xl">
                        <span className="text-5xl md:text-7xl mb-4 block">🏛️</span>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase italic">Imperio</h2>
                    </button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group bg-slate-900 border-2 border-yellow-500/20 p-8 md:p-12 rounded-[2.5rem] transition-all hover:border-yellow-500 shadow-2xl">
                        <span className="text-5xl md:text-7xl mb-4 block">📜</span>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase italic">P. Bloque</h2>
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER PASO 2: EDITOR ---
    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-6">
                
                {/* BARRA SUPERIOR RESPONSIVE */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 backdrop-blur-xl gap-4 shadow-xl">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-2 md:p-3 rounded-xl hover:bg-red-600 transition-all font-bold text-[10px] md:text-xs whitespace-nowrap">✕ SALIR</button>
                        <h1 className="text-sm md:text-lg font-black uppercase italic truncate">
                            <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto bg-slate-950 p-1.5 rounded-xl border border-white/5">
                        <span className="hidden sm:block text-[9px] font-black text-slate-500 ml-2 uppercase">Filtrar:</span>
                        <select 
                            value={edicionFiltro} 
                            onChange={(e) => setEdicionFiltro(e.target.value)}
                            className="flex-1 md:flex-none bg-slate-800 p-2 px-3 rounded-lg font-bold text-[10px] md:text-xs outline-none text-white"
                        >
                            <option value="">Seleccionar Edición...</option>
                            {edicionesDisponibles.map(ed => (
                                <option key={ed} value={ed}>{ed.replace(/_/g, ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL: GRID RESPONSIVE */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* BOTÓN FLOTANTE PARA MÓVIL (ABRIR FORMULARIO) */}
                    <button 
                        onClick={() => setShowFormMobile(!showFormMobile)}
                        className="lg:hidden fixed bottom-24 right-6 z-[110] w-14 h-14 bg-orange-600 rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-[#0B1120]"
                    >
                        {showFormMobile ? "✕" : "＋"}
                    </button>

                    {/* FORMULARIO COLAPSABLE EN MÓVIL / FIJO EN DESKTOP */}
                    <div className={`
                        lg:col-span-1 bg-slate-900/95 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md transition-all duration-300
                        ${showFormMobile ? 'fixed inset-4 z-[120] overflow-y-auto' : 'hidden lg:block h-fit sticky top-24'}
                    `}>
                        <h2 className="text-lg font-black mb-6 uppercase italic text-yellow-500">
                            {editingCard ? "📝 Editar" : "✨ Nueva Carta"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField label="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            
                            <div className="bg-slate-800/50 p-3 rounded-2xl border border-orange-500/20">
                                <label className="text-[9px] font-black text-orange-400 uppercase mb-1 block">Edición (Escribir nueva si no existe)</label>
                                <input type="text" className="w-full bg-transparent outline-none text-xs font-bold" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Slug Unique" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="ej: es33" />
                                <SelectField label="Tipo" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} options={["Aliado", "Talismán", "Oro", "Arma", "Tótem"]} />
                            </div>

                            {formato === "primer_bloque" && (
                                <SelectField label="Raza (PB)" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} options={RAZAS_PB} isPB />
                            )}

                            <InputField label="URL Imagen" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} />
                            
                            <div className="flex gap-2 pt-4">
                                <button type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase shadow-lg transition-all ${formato === 'imperio' ? 'bg-orange-600' : 'bg-yellow-600 text-black'}`}>
                                    {editingCard ? "Actualizar" : "Guardar"}
                                </button>
                                {editingCard && <button type="button" onClick={resetForm} className="bg-slate-700 px-6 rounded-2xl font-black">✕</button>}
                            </div>
                        </form>
                    </div>

                    {/* LISTADO DE CARTAS ADAPTADO A MÓVIL */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black text-slate-500 tracking-widest">SINCRONIZANDO...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 overflow-y-auto max-h-[75vh] p-2 custom-scrollbar">
                                {cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-[1.5rem] border border-white/5 group relative overflow-hidden shadow-lg">
                                        <img src={c.imgUrl || c.img} className="w-full h-auto rounded-xl" alt={c.name} />
                                        <div className="mt-2 px-1 text-center">
                                            <p className="text-[9px] font-black truncate uppercase text-white">{c.name}</p>
                                            <p className="text-[7px] font-bold text-slate-500 uppercase">{c.edition || c.edition_slug}</p>
                                        </div>
                                        {/* Acciones visibles por touch en móvil / hover en web */}
                                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, edition_slug: c.edition || c.edition_slug, imgUrl: c.imgUrl || c.img });
                                                if (window.innerWidth < 1024) setShowFormMobile(true);
                                                else window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-20 md:w-28 bg-blue-600 py-2 rounded-full text-[9px] font-black uppercase">Editar</button>
                                            <button onClick={async () => {
                                                if(window.confirm("¿Borrar?")) {
                                                    await fetch(`${BACKEND_URL}/api/cards/${c._id}`, { method: "DELETE", headers: { "auth-token": token } });
                                                    fetchCartas();
                                                }
                                            }} className="w-20 md:w-28 bg-red-600 py-2 rounded-full text-[9px] font-black uppercase">Borrar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES PARA LIMPIEZA ---
function InputField({ label, value, onChange, placeholder = "" }) {
    return (
        <div>
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1 block">{label}</label>
            <input type="text" placeholder={placeholder} className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 focus:border-orange-500 text-xs font-bold transition-all" value={value} onChange={onChange} required />
        </div>
    );
}

function SelectField({ label, value, onChange, options, isPB = false }) {
    return (
        <div>
            <label className={`text-[9px] font-black uppercase ml-2 mb-1 block ${isPB ? 'text-yellow-500' : 'text-slate-500'}`}>{label}</label>
            <select className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 text-[10px] font-bold" value={value} onChange={onChange} required>
                <option value="">{isPB ? "Seleccionar Raza" : "Tipo"}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}
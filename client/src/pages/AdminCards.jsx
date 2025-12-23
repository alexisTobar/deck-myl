import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

export default function AdminCards() {
    const [step, setStep] = useState("selector"); 
    const [formato, setFormato] = useState(""); 
    const [edicionABuscar, setEdicionABuscar] = useState(""); // Input para buscar edición manualmente
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [showFormMobile, setShowFormMobile] = useState(false);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", rarity: "1"
    };
    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    // Función principal para traer cartas por edición escrita
    const fetchCartasPorEdicion = async () => {
        if (!edicionABuscar) return alert("Escribe el nombre de una edición para buscar");
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                format: formato, 
                edition: edicionABuscar.trim().toLowerCase() 
            });
            const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error(e); 
            alert("Error al conectar con la base de datos");
        } finally { 
            setLoading(false); 
        }
    };

    const handleSelectFormat = (f) => {
        setFormato(f);
        setStep("editor");
        setCartas([]);
        setEdicionABuscar("");
        setFormData({ ...initialFormState, format: f });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        // Sincronización obligatoria para Imperio y PB
        const dataToSend = { ...formData };
        dataToSend.edition = formData.edition.trim().toLowerCase();
        if (formato === "imperio") {
            dataToSend.edition_slug = dataToSend.edition;
            delete dataToSend.race;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert("Base de datos actualizada ⚔️");
                // Si acabas de agregar una carta de una edición nueva, búscala automáticamente para verla
                setEdicionABuscar(dataToSend.edition);
                fetchCartasPorEdicion();
                resetForm();
                setShowFormMobile(false);
            }
        } catch (e) { alert("Error al guardar"); }
    };

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ ...initialFormState, format: formato, edition: edicionABuscar });
    };

    // --- VISTA SELECTOR ---
    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-10 uppercase italic tracking-tighter">Panel de Control Armería</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group bg-slate-900 border-2 border-orange-500/20 p-10 rounded-[2.5rem] hover:border-orange-500 transition-all shadow-2xl">
                        <span className="text-6xl mb-4 block">🏛️</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">Imperio</h2>
                    </button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group bg-slate-900 border-2 border-yellow-500/20 p-10 rounded-[2.5rem] hover:border-yellow-500 transition-all shadow-2xl">
                        <span className="text-6xl mb-4 block">📜</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">P. Bloque</h2>
                    </button>
                </div>
            </div>
        );
    }

    // --- VISTA EDITOR ---
    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-6">
                
                {/* BARRA SUPERIOR: BUSCADOR DE EDICIONES */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-[2rem] border border-white/5 backdrop-blur-xl gap-4 shadow-xl">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-2 px-4 rounded-xl hover:bg-red-600 transition-all font-black text-[10px]">✕ SALIR</button>
                        <h1 className="text-lg font-black uppercase italic truncate">
                            <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto bg-slate-950 p-2 rounded-2xl border border-white/5">
                        <input 
                            type="text" 
                            placeholder="Escribe edición a cargar..." 
                            className="bg-transparent outline-none px-4 text-xs font-bold flex-1 md:w-64"
                            value={edicionABuscar}
                            onChange={(e) => setEdicionABuscar(e.target.value)}
                        />
                        <button 
                            onClick={fetchCartasPorEdicion}
                            className="bg-blue-600 p-2 px-6 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-500"
                        >
                            Ver Cartas
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* BOTÓN FLOTANTE MÓVIL */}
                    <button onClick={() => setShowFormMobile(!showFormMobile)} className="lg:hidden fixed bottom-24 right-6 z-[110] w-14 h-14 bg-orange-600 rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-[#0B1120]">{showFormMobile ? "✕" : "＋"}</button>

                    {/* FORMULARIO (SOPORTA NUEVAS EDICIONES) */}
                    <div className={`
                        lg:col-span-1 bg-slate-900/95 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md transition-all
                        ${showFormMobile ? 'fixed inset-4 z-[120] overflow-y-auto' : 'hidden lg:block h-fit sticky top-24'}
                    `}>
                        <h2 className="text-xl font-black mb-8 uppercase italic text-yellow-500">
                            {editingCard ? "📝 Editando" : "✨ Nueva Invocación"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField label="Nombre de Carta" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            
                            <div className="bg-slate-800 p-4 rounded-2xl border border-blue-500/20">
                                <label className="text-[9px] font-black text-blue-400 uppercase mb-1 block">Edición / Colección</label>
                                <input 
                                    type="text" 
                                    placeholder="ej: colmillos_avalon"
                                    className="w-full bg-transparent outline-none text-xs font-black text-white" 
                                    value={formData.edition} 
                                    onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} 
                                    required 
                                />
                                <p className="text-[7px] text-slate-500 mt-2 uppercase font-bold italic">* Escribe una nueva para crearla</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Slug Unique" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="es33" />
                                <SelectField label="Tipo" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} options={["Aliado", "Talismán", "Oro", "Arma", "Tótem"]} />
                            </div>

                            {formato === "primer_bloque" && (
                                <SelectField label="Raza" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} options={RAZAS_PB} isPB />
                            )}

                            <InputField label="URL Imagen (WebP)" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} />
                            
                            <div className="flex gap-2 pt-6">
                                <button type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase shadow-lg transition-all active:scale-95 ${formato === 'imperio' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}>
                                    {editingCard ? "Actualizar" : "Guardar Carta"}
                                </button>
                                {editingCard && <button type="button" onClick={resetForm} className="bg-slate-700 px-6 rounded-2xl font-black">✕</button>}
                            </div>
                        </form>
                    </div>

                    {/* LISTADO DE CARTAS */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Buscando en los registros...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[80vh] p-2 custom-scrollbar">
                                {cartas.length === 0 ? (
                                    <div className="col-span-full text-center py-20 text-slate-700 font-black uppercase tracking-widest bg-slate-900/10 rounded-3xl border border-dashed border-white/5 px-10">
                                        Escribe el nombre de la edición arriba y pulsa "Ver Cartas" para cargar los datos.
                                    </div>
                                ) : cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-[1.5rem] border border-white/5 group relative overflow-hidden shadow-xl transition-all hover:border-orange-500/50">
                                        <img src={c.imgUrl || c.img} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105 duration-500" alt={c.name} />
                                        <div className="mt-3 px-2 text-center pb-1">
                                            <p className="text-[10px] font-black truncate uppercase text-white tracking-tighter">{c.name}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, edition_slug: c.edition || c.edition_slug, imgUrl: c.imgUrl || c.img });
                                                if (window.innerWidth < 1024) setShowFormMobile(true);
                                                else window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-24 bg-blue-600 py-2 rounded-full text-[9px] font-black uppercase shadow-lg">Editar</button>
                                            <button onClick={async () => {
                                                if(window.confirm("¿Borrar permanentemente?")) {
                                                    await fetch(`${BACKEND_URL}/api/cards/${c._id}`, { method: "DELETE", headers: { "auth-token": token } });
                                                    fetchCartasPorEdicion();
                                                }
                                            }} className="w-24 bg-red-600 py-2 rounded-full text-[9px] font-black uppercase shadow-lg">Borrar</button>
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

function InputField({ label, value, onChange, placeholder = "" }) {
    return (
        <div>
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1 block">{label}</label>
            <input type="text" placeholder={placeholder} className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 focus:border-orange-500 text-xs font-bold transition-all" value={value} onChange={onChange} required />
        </div>
    );
}

function SelectField({ label, value, onChange, options, isPB = false }) {
    return (
        <div>
            <label className={`text-[9px] font-black uppercase ml-2 mb-1 block ${isPB ? 'text-yellow-500' : 'text-slate-500'}`}>{label}</label>
            <select className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 text-[10px] font-black" value={value} onChange={onChange} required>
                <option value="">Seleccionar...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}
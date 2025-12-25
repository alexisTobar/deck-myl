import { useState, useEffect } from "react";
import BACKEND_URL from "../config";
import { Plus, Minus, Layout, Save, X, Search, ChevronLeft, Star, Layers } from "lucide-react";

const EDICIONES_IMPERIO = { "25_Aniversario_Imp": "25 aniversario", "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "shogun_4": "Shogun 4","colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

// ✅ Las 4 Ediciones Principales de PB
const MAIN_EDITIONS_PB = ["espada_sagrada", "helenica", "hijos_de_daana", "dominios_de_ra"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function AdminCards() {
    const [step, setStep] = useState("selector"); 
    const [formato, setFormato] = useState(""); 
    const [edicionFiltro, setEdicionFiltro] = useState(""); 
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [showFormMobile, setShowFormMobile] = useState(false);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", rarity: "1",
        main_edition: "" // ✅ Campo para la Edición Principal (PB)
    };
    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (edicionFiltro) fetchCartas();
    }, [edicionFiltro]);

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
        const defaultEd = f === "imperio" ? "kvsm_titanes" : "espada_sagrada_aniversario";
        setEdicionSeleccionada(defaultEd);
        setFormData({ ...initialFormState, format: f, edition: defaultEd });
        setStep("editor");
    };

    const setEdicionSeleccionada = (ed) => setEdicionFiltro(ed);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        const dataToSend = { ...formData, edition_slug: formData.edition, img: formData.imgUrl };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert("Carta actualizada en la base de datos ⚔️");
                resetForm();
                fetchCartas();
                setShowFormMobile(false);
            }
        } catch (e) { alert("Error al guardar"); }
    };

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ ...initialFormState, format: formato, edition: edicionFiltro });
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-black text-white mb-10 uppercase italic">Panel Admin</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group bg-slate-900 border-2 border-orange-500/20 p-12 rounded-[3rem] hover:border-orange-500 transition-all shadow-2xl active:scale-95"><span className="text-7xl mb-4 block">🏛️</span><h2 className="text-2xl font-black text-white uppercase italic">Imperio</h2></button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group bg-slate-900 border-2 border-yellow-500/20 p-12 rounded-[3rem] hover:border-yellow-500 transition-all shadow-2xl active:scale-95"><span className="text-7xl mb-4 block">📜</span><h2 className="text-2xl font-black text-white uppercase italic">P. Bloque</h2></button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32 font-sans">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-[2rem] border border-white/5 backdrop-blur-xl gap-4 shadow-xl">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs flex items-center gap-2"><ChevronLeft size={16}/> SALIR</button>
                        <h1 className="text-lg font-black uppercase italic"><span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span></h1>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto bg-slate-950 p-2 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black text-slate-500 ml-2 uppercase tracking-widest">Filtrar Edición:</span>
                        <select className="bg-slate-800 outline-none px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer flex-1 md:w-64" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                            {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <button onClick={() => setShowFormMobile(!showFormMobile)} className="lg:hidden fixed bottom-24 right-6 z-[110] w-14 h-14 bg-orange-600 rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-[#0B1120] active:scale-90">{showFormMobile ? <X /> : <Plus />}</button>

                    <div className={`lg:col-span-1 bg-slate-900/95 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md transition-all ${showFormMobile ? 'fixed inset-4 z-[120] overflow-y-auto pb-20' : 'hidden lg:block h-fit sticky top-24'}`}>
                        <h2 className="text-xl font-black mb-8 uppercase italic text-yellow-500 flex items-center gap-2"> {editingCard ? <Layout size={20}/> : <Plus size={20}/>} {editingCard ? "Editar Carta" : "Nueva Carta"}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1 block">Nombre</label>
                                <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 focus:border-orange-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>

                            {/* ✅ INPUT EDICIÓN PRINCIPAL (SOLO PB) */}
                            {formato === "primer_bloque" && (
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-yellow-500/20">
                                    <label className="text-[10px] font-black text-yellow-500 uppercase mb-2 flex items-center gap-2 italic"><Star size={14} fill="currentColor"/> Edición Principal</label>
                                    <select 
                                        className="w-full bg-slate-800 p-2 rounded-xl outline-none text-xs font-bold border border-white/10"
                                        value={formData.main_edition}
                                        onChange={e => setFormData({...formData, main_edition: e.target.value})}
                                    >
                                        <option value="">Ninguna (Otros)</option>
                                        {MAIN_EDITIONS_PB.map(ed => (
                                            <option key={ed} value={ed}>{ed.replace(/_/g, ' ').toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 mb-1 block">Edición Base</label>
                                <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-black" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} required>
                                    {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 block">Slug</label>
                                    <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-2 block">Tipo</label>
                                    <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-black" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="Aliado">Aliado</option><option value="Talismán">Talismán</option><option value="Oro">Oro</option><option value="Arma">Arma</option><option value="Tótem">Tótem</option>
                                    </select>
                                </div>
                            </div>

                            {formato === "primer_bloque" && (
                                <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-yellow-500/20 outline-none text-xs font-black" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} required>
                                    <option value="">Selecciona Raza</option>
                                    {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            )}

                            <input type="text" placeholder="Imagen URL" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            
                            <div className="flex gap-2 pt-6">
                                <button type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 ${formato === 'imperio' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}><Save size={18}/> Guardar Carta</button>
                                {editingCard && <button type="button" onClick={resetForm} className="bg-slate-700 px-6 rounded-2xl"><X size={20}/></button>}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div><span className="text-xs font-black text-slate-500 tracking-widest uppercase">Cargando...</span></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-[80vh] p-2 custom-scrollbar">
                                {cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-[2rem] border border-white/5 group relative overflow-hidden shadow-xl hover:border-orange-500/50 transition-all">
                                        {c.main_edition && <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black p-1 rounded-lg shadow-xl"><Star size={12} fill="currentColor"/></div>}
                                        <img src={getImg(c)} className="w-full h-auto rounded-[1.5rem] transition-transform group-hover:scale-105 duration-500" alt={c.name} />
                                        <div className="mt-3 px-2 text-center pb-1"><p className="text-[11px] font-black truncate uppercase text-white tracking-tighter">{c.name}</p></div>
                                        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, edition_slug: c.edition || c.edition_slug, imgUrl: getImg(c), main_edition: c.main_edition || "" });
                                                if (window.innerWidth < 1024) setShowFormMobile(true);
                                                else window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-24 bg-blue-600 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg active:scale-95">Editar</button>
                                            <button onClick={async () => { if(window.confirm("¿Borrar?")) { await fetch(`${BACKEND_URL}/api/cards/${c._id}`, { method: "DELETE", headers: { "auth-token": token } }); fetchCartas(); } }} className="w-24 bg-red-600 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg active:scale-95">Borrar</button>
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
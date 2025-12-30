import { useState, useEffect } from "react";
import BACKEND_URL from "../config";
import { Plus, Layout, Save, X, ChevronLeft, Star, ShieldAlert } from "lucide-react";

// ✅ IMPERIO: Se mantiene intacto
const EDICIONES_IMPERIO = { 
    "25_Aniversario_Imp": "25 aniversario", 
    "kvsm_titanes": "KVSM Titanes", 
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

// ✅ PRIMER BLOQUE: Solo las 4 ediciones principales
const EDICIONES_PB = { 
    "espada_sagrada": "ESPADA SAGRADA",
    "helenica": "HELÉNICA",
    "hijos_de_daana": "HIJOS DE DAANA",
    "dominios_de_ra": "DOMINIOS DE RA"
};

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function AdminCards() {
    const [step, setStep] = useState("selector"); 
    const [formato, setFormato] = useState(""); 
    const [edicionFiltro, setEdicionFiltro] = useState(""); 
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", 
        cost: 0, strength: 0, ability: "", rarity: "1",
        restriction: "unrestricted" // ✅ Nuevo campo: unrestricted, banned, limited1, limited2
    };

    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ 
            ...initialFormState, 
            format: formato, 
            edition: edicionFiltro, 
            edition_slug: edicionFiltro 
        });
    };

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
        } catch (e) { 
            console.error("Error al buscar cartas:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSelectFormat = (f) => {
        setFormato(f);
        const defaultEd = f === "imperio" ? "25_Aniversario_Imp" : "espada_sagrada";
        setEdicionFiltro(defaultEd);
        setFormData({ ...initialFormState, format: f, edition: defaultEd, edition_slug: defaultEd });
        setStep("editor");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        const dataToSend = { 
            ...formData, 
            edition_slug: formData.edition, 
            img: formData.imgUrl,
            imageUrl: formData.imgUrl
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert("Operación exitosa en la base de datos ✅");
                fetchCartas();
                resetForm();
            } else {
                alert("Error en el servidor al guardar.");
            }
        } catch (e) { 
            alert("Error de conexión al servidor."); 
        }
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-black text-white mb-10 uppercase italic">Admin Workshop</h1>
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group bg-slate-900 border-2 border-orange-500/20 p-12 rounded-[3rem] text-white font-black uppercase hover:border-orange-500 transition-all shadow-2xl active:scale-95">🏛️ Imperio</button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group bg-slate-900 border-2 border-yellow-500/20 p-12 rounded-[3rem] text-white font-black uppercase hover:border-yellow-500 transition-all shadow-2xl active:scale-95">📜 P. Bloque</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32">
            <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center bg-slate-900 p-5 rounded-[2rem] border border-white/5 shadow-xl gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-red-600 transition-colors"><ChevronLeft size={16}/> VOLVER</button>
                        <h1 className="text-lg font-black uppercase italic tracking-tighter">
                            Edición: <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                        </h1>
                    </div>
                    <select className="bg-slate-800 outline-none px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/10 cursor-pointer flex-1 md:w-64" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit sticky top-24">
                        <h2 className="text-xl font-black mb-8 uppercase text-yellow-500 italic flex items-center gap-2">
                            {editingCard ? <Layout size={20}/> : <Plus size={20}/>} 
                            {editingCard ? "Modificar Carta" : "Nueva Carta"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre</label>
                                <input type="text" placeholder="Ej: Rey Arturo" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 font-bold focus:border-orange-500 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>

                            {/* ✅ NUEVO CAMPO: RESTRICCIÓN DAR */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-red-500 uppercase ml-2 flex items-center gap-1"><ShieldAlert size={12}/> Restricción DAR</label>
                                <select className="w-full p-3 bg-slate-950 rounded-xl border border-red-500/30 outline-none text-xs font-black text-white cursor-pointer" value={formData.restriction} onChange={e => setFormData({...formData, restriction: e.target.value})}>
                                    <option value="unrestricted">Sin Restricción (3 copias)</option>
                                    <option value="limited2">Limitada (2 copias)</option>
                                    <option value="limited1">Única (1 copia)</option>
                                    <option value="banned">Prohibida (Baneada)</option>
                                </select>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Edición</label>
                                <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} required>
                                    {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Slug</label>
                                    <input type="text" placeholder="Ej: es443" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-bold" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Tipo</label>
                                    <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="Aliado">Aliado</option><option value="Talismán">Talismán</option><option value="Oro">Oro</option><option value="Arma">Arma</option><option value="Tótem">Tótem</option>
                                    </select>
                                </div>
                            </div>

                            {formato === "primer_bloque" && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Coste</label>
                                            <input type="number" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.cost} onChange={e => setFormData({...formData, cost: parseInt(e.target.value) || 0})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Fuerza</label>
                                            <input type="number" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.strength} onChange={e => setFormData({...formData, strength: parseInt(e.target.value) || 0})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Raza</label>
                                        <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})}>
                                            <option value="">Raza...</option>
                                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Habilidad</label>
                                <textarea placeholder="Texto de la carta..." className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs h-24" value={formData.ability} onChange={e => setFormData({...formData, ability: e.target.value})} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">URL Imagen</label>
                                <input type="text" placeholder="https://..." className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-bold" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            </div>
                            
                            <div className="pt-4 space-y-2">
                                <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all ${formato === 'imperio' ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-yellow-600 text-black hover:bg-yellow-500'}`}>
                                    <Save size={18}/> {editingCard ? "Actualizar" : "Guardar"}
                                </button>
                                {editingCard && (
                                    <button type="button" onClick={resetForm} className="w-full py-2 text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors flex items-center justify-center gap-1">
                                        <X size={14}/> Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center py-40 gap-4">
                                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-black text-slate-500 uppercase italic">Cargando...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-[85vh] p-2 custom-scrollbar">
                                {cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden shadow-2xl hover:border-yellow-500/50 transition-all">
                                        <img src={getImg(c)} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105" alt={c.name} />
                                        <div className="mt-2 text-center pb-2">
                                            <p className="text-[11px] font-black truncate uppercase text-white">{c.name}</p>
                                            {/* ✅ Badge visual de restricción */}
                                            {c.restriction && c.restriction !== "unrestricted" && (
                                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                                                    c.restriction === 'banned' ? 'bg-red-600 text-white' : 
                                                    c.restriction === 'limited1' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                                                }`}>
                                                    {c.restriction === 'banned' ? 'Baneada' : c.restriction === 'limited1' ? 'Unica' : 'Limitada'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, imgUrl: getImg(c), restriction: c.restriction || "unrestricted" });
                                                window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="bg-blue-600 p-3 rounded-full"><Layout size={16}/></button>
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
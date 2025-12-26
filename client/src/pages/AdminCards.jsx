import { useState, useEffect } from "react";
import BACKEND_URL from "../config";
import { Plus, Layout, Save, X, ChevronLeft, Star } from "lucide-react";

// ✅ IMPERIO: Se mantiene intacto (No se toca)
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

// ✅ PRIMER BLOQUE: Solo las 4 ediciones principales solicitadas
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
        cost: 0, strength: 0, ability: "", rarity: "1"
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
        // Default para imperio es kvsm_titanes, para pb es espada_sagrada
        const defaultEd = f === "imperio" ? "kvsm_titanes" : "espada_sagrada";
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
                alert("Carta procesada en la base de datos ✅");
                fetchCartas();
                setEditingCard(null);
                setFormData({ ...initialFormState, format: formato, edition: edicionFiltro, edition_slug: edicionFiltro });
            }
        } catch (e) { alert("Error al guardar"); }
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
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl font-bold text-xs"><ChevronLeft size={16}/> VOLVER</button>
                        <h1 className="text-lg font-black uppercase italic"><span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span></h1>
                    </div>
                    <select className="bg-slate-800 outline-none px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/10 cursor-pointer flex-1 md:w-64" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit sticky top-24">
                        <h2 className="text-xl font-black mb-8 uppercase text-yellow-500 italic">{editingCard ? "📝 Editar" : "✨ Nueva"} Carta</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Nombre de la carta" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            
                            <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} required>
                                {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                            </select>

                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Slug (es33)" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-bold" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Aliado">Aliado</option><option value="Talismán">Talismán</option><option value="Oro">Oro</option><option value="Arma">Arma</option><option value="Tótem">Tótem</option>
                                </select>
                            </div>

                            {formato === "primer_bloque" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Coste" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                                    <input type="number" placeholder="Fuerza" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.strength} onChange={e => setFormData({...formData, strength: e.target.value})} />
                                </div>
                            )}

                            {formato === "primer_bloque" && (
                                <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})}>
                                    <option value="">Seleccionar Raza</option>
                                    {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            )}

                            <textarea placeholder="Habilidad" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs h-24" value={formData.ability} onChange={e => setFormData({...formData, ability: e.target.value})} />

                            <input type="text" placeholder="Imagen URL" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            
                            <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 ${formato === 'imperio' ? 'bg-orange-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                <Save size={18}/> Guardar Carta
                            </button>
                            {editingCard && <button type="button" onClick={resetForm} className="w-full py-2 text-xs font-bold text-slate-500 uppercase">Cancelar</button>}
                        </form>
                    </div>

                    {/* LISTADO */}
                    <div className="lg:col-span-3">
                        {loading ? <div className="text-center py-20 font-black animate-pulse">INVOCANDO CARTAS...</div> : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[80vh] p-2 custom-scrollbar">
                                {cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden hover:border-yellow-500 transition-all">
                                        <img src={getImg(c)} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105 duration-500" alt={c.name} />
                                        <div className="mt-2 text-center pb-1"><p className="text-[10px] font-black truncate uppercase text-white">{c.name}</p></div>
                                        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, imgUrl: getImg(c) });
                                                window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-24 bg-blue-600 py-2 rounded-full text-[9px] font-black uppercase">Editar</button>
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
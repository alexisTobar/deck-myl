import { useState, useEffect } from "react";
import BACKEND_URL from "../config";
import { Plus, Layout, Save, X, ChevronLeft, Star } from "lucide-react";

const EDICIONES_IMPERIO = { "25_Aniversario_Imp": "25 aniversario", "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "shogun_4": "Shogun 4","colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

// ✅ Las 4 Ediciones Principales de PB para asignar
const MAIN_EDITIONS_PB = [
    { id: "espada_sagrada", label: "Espada Sagrada" },
    { id: "helenica", label: "Helénica" },
    { id: "hijos_de_daana", label: "Hijos de Daana" },
    { id: "dominios_de_ra", label: "Dominios de Ra" }
];

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
        main_edition: "" 
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
        const defaultEd = f === "imperio" ? "25_Aniversario_Imp" : "espada_sagrada_aniversario";
        setEdicionFiltro(defaultEd);
        setFormData({ ...initialFormState, format: f, edition: defaultEd, edition_slug: defaultEd });
        setStep("editor");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        // Enviamos el objeto con el campo main_edition incluido
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
                alert("Carta actualizada correctamente ✅");
                resetForm();
                fetchCartas();
                setShowFormMobile(false);
            }
        } catch (e) { alert("Error al guardar"); }
    };

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ ...initialFormState, format: formato, edition: edicionFiltro, edition_slug: edicionFiltro });
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-black text-white mb-10 uppercase italic">Maestro Armería</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="bg-slate-900 border-2 border-orange-500/20 p-12 rounded-[3rem] hover:border-orange-500 transition-all shadow-2xl active:scale-95 text-white">🏛️ Imperio</button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="bg-slate-900 border-2 border-yellow-500/20 p-12 rounded-[3rem] hover:border-yellow-500 transition-all shadow-2xl active:scale-95 text-white">📜 P. Bloque</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32 font-sans">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-xl gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs flex items-center gap-2"><ChevronLeft size={16}/> VOLVER</button>
                        <h1 className="text-lg font-black uppercase italic text-yellow-500">{formato.replace("_", " ")}</h1>
                    </div>
                    <select className="bg-slate-800 outline-none px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/10" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-slate-900/95 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit sticky top-24">
                        <h2 className="text-xl font-black mb-8 uppercase italic text-yellow-500 flex items-center gap-2">
                             {editingCard ? "📝 Editar" : "✨ Nueva"} Carta
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input type="text" placeholder="Nombre" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 focus:border-orange-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />

                            {/* ✅ ÚNICO APARTADO NUEVO: SECTOR DE EDICIÓN PRINCIPAL (SOLO PB) */}
                            {formato === "primer_bloque" && (
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-yellow-500/20">
                                    <label className="text-[10px] font-black text-yellow-500 uppercase mb-2 flex items-center gap-2 italic"><Star size={14} fill="currentColor"/> Edición Principal</label>
                                    <select 
                                        className="w-full bg-slate-800 p-2.5 rounded-xl outline-none text-xs font-bold border border-white/10 text-white"
                                        value={formData.main_edition}
                                        onChange={e => setFormData({...formData, main_edition: e.target.value})}
                                    >
                                        <option value="">-- Sin Categoría --</option>
                                        {MAIN_EDITIONS_PB.map(ed => (
                                            <option key={ed.id} value={ed.id}>{ed.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-black" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value, edition_slug: e.target.value})} required>
                                {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                            </select>

                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Slug" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-bold" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-black" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Aliado">Aliado</option><option value="Talismán">Talismán</option><option value="Oro">Oro</option><option value="Arma">Arma</option><option value="Tótem">Tótem</option>
                                </select>
                            </div>

                            {formato === "primer_bloque" && (
                                <select className="w-full p-3.5 bg-slate-800 rounded-2xl border border-yellow-500/20 outline-none text-xs font-black" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} required>
                                    <option value="">Selecciona Raza</option>
                                    {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            )}

                            <input type="text" placeholder="URL Imagen" className="w-full p-3.5 bg-slate-800 rounded-2xl border border-white/5 outline-none text-xs font-bold" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            
                            <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 ${formato === 'imperio' ? 'bg-orange-600' : 'bg-yellow-600 text-black'}`}>
                                <Save size={18}/> {editingCard ? "Actualizar" : "Guardar"}
                            </button>
                        </form>
                    </div>

                    {/* LISTADO */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[80vh] p-2 custom-scrollbar">
                            {cartas.map(c => (
                                <div key={c._id} className="bg-slate-900 p-2 rounded-[1.5rem] border border-white/5 group relative overflow-hidden">
                                    {/* Etiqueta Visual si ya tiene main_edition */}
                                    {c.main_edition && (
                                        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black px-2 py-0.5 rounded font-black text-[7px] uppercase shadow-lg flex items-center gap-1">
                                            <Star size={8} fill="currentColor" /> {c.main_edition.replace('_', ' ')}
                                        </div>
                                    )}
                                    <img src={getImg(c)} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105 duration-500" alt={c.name} />
                                    <div className="mt-2 text-center text-white font-black uppercase text-[10px] truncate">{c.name}</div>
                                    <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all">
                                        <button onClick={() => {
                                            setEditingCard(c);
                                            setFormData({ ...c, edition: c.edition || c.edition_slug, imgUrl: getImg(c), main_edition: c.main_edition || "" });
                                            window.scrollTo({top: 0, behavior: 'smooth'});
                                        }} className="w-24 bg-blue-600 py-2 rounded-full text-[9px] font-black uppercase">Editar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import BACKEND_URL from "../config";
import { Plus, Layout, Save, X, ChevronLeft, Star } from "lucide-react";

const EDICIONES_IMPERIO = { "25_Aniversario_Imp": "25 aniversario", "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "shogun_4": "Shogun 4","colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

// ✅ Las 4 ediciones que quieres que queden grabadas en el campo "edition"
const MAIN_EDITIONS_PB = [
    { id: "espada_sagrada", label: "Espada Sagrada" },
    { id: "helenica", label: "Helénica" },
    { id: "hijos_de_daana", label: "Hijos de Daana" },
    { id: "dominios_de_ra", label: "Dominios de Ra" }
];

export default function AdminCards() {
    const [step, setStep] = useState("selector"); 
    const [formato, setFormato] = useState(""); 
    const [edicionFiltro, setEdicionFiltro] = useState(""); 
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const [formData, setFormData] = useState({
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", rarity: "1"
    });

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
        setFormData({ ...formData, format: f, edition: defaultEd, edition_slug: defaultEd });
        setStep("editor");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        // Enviamos "edition" y "edition_slug" con el valor que elegiste (ej: espada_sagrada)
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
                alert("¡Carta actualizada a Edición Principal! ⚔️");
                fetchCartas();
                setEditingCard(null);
            }
        } catch (e) { alert("Error al guardar"); }
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-black text-white mb-10 uppercase italic">Maestro PB</h1>
                <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="bg-slate-900 border-2 border-orange-500/20 p-12 rounded-[3rem] text-white font-black uppercase">Imperio</button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="bg-slate-900 border-2 border-yellow-500/20 p-12 rounded-[3rem] text-white font-black uppercase">P. Bloque</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32">
            <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center bg-slate-900 p-5 rounded-[2rem] border border-white/5">
                    <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl font-bold text-xs"><ChevronLeft size={16}/> VOLVER</button>
                    <select className="bg-slate-800 px-4 py-2 rounded-xl text-xs text-white" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit">
                        <h2 className="text-xl font-black mb-8 uppercase text-yellow-500 italic">Asignar Edición</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input type="text" className="w-full p-3 bg-slate-800 rounded-xl outline-none font-bold" value={formData.name} readOnly />
                            
                            {/* ✅ BOTONES PARA SOBRESCRIBIR LA EDICIÓN RÁPIDAMENTE */}
                            <div className="grid grid-cols-1 gap-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Selecciona Edición Principal:</label>
                                {MAIN_EDITIONS_PB.map(ed => (
                                    <button 
                                        key={ed.id}
                                        type="button"
                                        onClick={() => setFormData({...formData, edition: ed.id, edition_slug: ed.id})}
                                        className={`py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.edition === ed.id ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' : 'border-slate-700 text-slate-500'}`}
                                    >
                                        {ed.label}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Valor que se guardará:</label>
                                <input type="text" className="w-full p-3 bg-slate-950 rounded-xl text-xs font-black text-blue-400" value={formData.edition} readOnly />
                            </div>

                            <button type="submit" className="w-full py-4 rounded-2xl bg-yellow-600 text-black font-black uppercase shadow-lg flex items-center justify-center gap-2">
                                <Save size={18}/> Actualizar en DB
                            </button>
                        </form>
                    </div>

                    {/* LISTADO */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {cartas.map(c => (
                                <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden">
                                    <img src={c.imgUrl || c.img} className="w-full h-auto rounded-xl" alt={c.name} />
                                    <div className="mt-2 text-center text-[10px] font-black uppercase">{c.name}</div>
                                    <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <button onClick={() => {
                                            setEditingCard(c);
                                            setFormData({ ...c, edition: c.edition || c.edition_slug });
                                        }} className="bg-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase">Editar</button>
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
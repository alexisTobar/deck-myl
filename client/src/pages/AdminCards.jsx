import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

// Traemos las constantes de tus constructores para que los filtros sean idénticos
const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };

const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };

export default function AdminCards() {
    const [step, setStep] = useState("selector"); // selector, editor
    const [formato, setFormato] = useState(""); // imperio, primer_bloque
    const [edicionFiltro, setEdicionFiltro] = useState("");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "Aliado", race: "", imgUrl: "", format: "", rarity: "1"
    };
    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    // Efecto para cargar cartas cuando cambie la edición en el filtro
    useEffect(() => {
        if (edicionFiltro) fetchCartas();
    }, [edicionFiltro]);

    const fetchCartas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ format: formato });
            if (formato === "primer_bloque") params.append("edition", edicionFiltro);
            else params.append("edition", edicionFiltro); // Tu backend usa 'edition' en la query para ambos según tus constructores

            const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSelectFormat = (f) => {
        setFormato(f);
        const firstEd = f === "imperio" ? "kvsm_titanes" : "colmillos_avalon";
        setEdicionFiltro(firstEd);
        setFormData({ ...initialFormState, format: f, edition: firstEd, edition_slug: firstEd });
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
                alert("Éxito en la base de datos");
                setEditingCard(null);
                setFormData({ ...initialFormState, format: formato, edition: edicionFiltro });
                fetchCartas();
            }
        } catch (e) { alert("Error"); }
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-2 uppercase italic">Panel Maestro</h1>
                <p className="text-slate-500 mb-12 font-bold tracking-widest">¿QUÉ DESEAS EDITAR HOY?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group relative overflow-hidden bg-slate-900 border-2 border-orange-500/20 p-10 rounded-[2.5rem] transition-all hover:border-orange-500 shadow-2xl">
                        <span className="text-6xl mb-4 block">🏛️</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">Era Imperio</h2>
                        <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group relative overflow-hidden bg-slate-900 border-2 border-yellow-500/20 p-10 rounded-[2.5rem] transition-all hover:border-yellow-500 shadow-2xl">
                        <span className="text-6xl mb-4 block">📜</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">Primer Bloque</h2>
                        <div className="absolute inset-0 bg-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                
                {/* CABECERA */}
                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-2 rounded-xl hover:bg-slate-700">← Volver</button>
                        <h1 className="text-xl font-black uppercase italic">
                            Editando: <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                        </h1>
                    </div>
                    <select 
                        value={edicionFiltro} 
                        onChange={(e) => setEdicionFiltro(e.target.value)}
                        className="bg-slate-800 p-3 rounded-xl border border-white/10 font-bold text-xs outline-none focus:ring-2 ring-orange-500"
                    >
                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (
                            <option key={slug} value={slug}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-1 bg-slate-900 p-6 rounded-[2rem] border border-white/5 h-fit sticky top-24 shadow-2xl">
                        <h2 className="text-lg font-black mb-6 uppercase italic text-slate-400">
                            {editingCard ? "Actualizar Datos" : "Nueva Carta"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Nombre" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 focus:border-orange-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Slug (es33)" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 text-xs font-bold" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                <select className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 text-xs font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Aliado">Aliado</option>
                                    <option value="Talismán">Talismán</option>
                                    <option value="Oro">Oro</option>
                                    <option value="Arma">Arma</option>
                                    <option value="Tótem">Tótem</option>
                                </select>
                            </div>
                            {formato === "primer_bloque" && (
                                <input type="text" placeholder="Raza (PB)" className="w-full p-3 bg-slate-800 rounded-xl border border-yellow-500/20" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} required />
                            )}
                            <input type="text" placeholder="URL Imagen" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            
                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="flex-1 bg-orange-600 py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-orange-500 transition-all active:scale-95">Guardar</button>
                                {editingCard && (
                                    <button type="button" onClick={() => {setEditingCard(null); setFormData({...initialFormState, format: formato, edition: edicionFiltro});}} className="bg-slate-700 px-6 rounded-2xl">✕</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* LISTADO */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[75vh] p-2 custom-scrollbar">
                                {cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden shadow-lg transition-all hover:border-orange-500/50">
                                        <img src={c.imgUrl || c.img} className="w-full h-auto rounded-xl" alt={c.name} />
                                        <div className="mt-2 px-1">
                                            <p className="text-[10px] font-black truncate uppercase text-white">{c.name}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, imgUrl: c.imgUrl || c.img });
                                                window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-24 bg-blue-600 py-2 rounded-full text-[10px] font-black uppercase tracking-wider">Editar</button>
                                            <button onClick={() => handleDelete(c._id)} className="w-24 bg-red-600 py-2 rounded-full text-[10px] font-black uppercase tracking-wider">Borrar</button>
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
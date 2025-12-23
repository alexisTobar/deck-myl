import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

const EDICIONES_IMPERIO = { "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };

const EDICIONES_PB = { "colmillos_avalon": "Colmillos de Avalon", "extensiones_pb_2023": "Extensiones PB 2023", "espada_sagrada_aniversario": "Espada Sagrada (Aniv)", "Relatos": "Relatos", "hijos-de-daana-aniversario": "Hijos de Daana (Aniv)", "25 aniversario": "25 Aniversario", "Festividades": "Festividades", "aniversario-de-ra": "Aniversario de Ra", "colmillos_inframundo": "Colmillos del Inframundo", "encrucijada": "Encrucijada", "festividades": "Festividades (Extra)", "helenica_aniversario": "Helénica (Aniv)", "inferno": "Inferno", "jo lanzamiento ra": "Jo Lanzamiento Ra", "kit-de-batalla-de-ra": "Kit de Batalla de Ra", "kit-raciales-2023": "Kit Raciales 2023", "kit-raciales-2024": "Kit Raciales 2024", "leyendas_pb_2.0": "Leyendas PB 2.0", "lootbox-2023": "Lootbox 2023", "lootbox-pb-2024": "Lootbox PB 2024", "promo_daana": "Promo Daana", "promo_helenica": "Promo Helénica", "relatos-de-espada-sagrada-aniversario": "Relatos Espada Sagrada", "relatos-de-helenica": "Relatos Helénica", "toolkit-pb-2025": "Toolkit PB 2025", "toolkit_pb_fuerza_y_destino": "Toolkit Fuerza y Destino", "toolkit_pb_magia_y_divinidad": "Toolkit Magia y Divinidad", "toolkit_pb_nobleza_y_poder": "Toolkit Nobleza y Poder" };

const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

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
        const firstEd = f === "imperio" ? "kvsm_titanes" : "colmillos_avalon";
        setEdicionFiltro(firstEd);
        setFormData({ 
            name: "", slug: "", type: "Aliado", race: "", imgUrl: "", rarity: "1",
            format: f, 
            edition: firstEd, 
            edition_slug: f === "imperio" ? firstEd : "" 
        });
        setStep("editor");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        
        // Limpieza de datos según el formato antes de enviar
        const dataToSend = { ...formData };
        if (formato === "imperio") {
            dataToSend.edition_slug = formData.edition;
            delete dataToSend.race; // No enviamos raza en Imperio
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert("Base de datos actualizada con éxito ⚔️");
                resetForm();
                fetchCartas();
            }
        } catch (e) { alert("Error al conectar con el servidor"); }
    };

    const resetForm = () => {
        setEditingCard(null);
        setFormData({ 
            name: "", slug: "", type: "Aliado", race: "", imgUrl: "", rarity: "1",
            format: formato, 
            edition: edicionFiltro,
            edition_slug: formato === "imperio" ? edicionFiltro : ""
        });
    };

    if (step === "selector") {
        return (
            <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Panel de Gestión</h1>
                <p className="text-slate-500 mb-12 font-bold tracking-widest text-xs">SELECCIONA EL REINO A MODIFICAR</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button onClick={() => handleSelectFormat("imperio")} className="group bg-slate-900 border-2 border-orange-500/20 p-12 rounded-[3rem] transition-all hover:border-orange-500 shadow-2xl hover:bg-orange-500/5">
                        <span className="text-7xl mb-4 block">🏛️</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">Era Imperio</h2>
                        <p className="text-slate-500 text-xs mt-2 font-bold">EDICIONES NUEVAS / SIN RAZAS</p>
                    </button>
                    <button onClick={() => handleSelectFormat("primer_bloque")} className="group bg-slate-900 border-2 border-yellow-500/20 p-12 rounded-[3rem] transition-all hover:border-yellow-500 shadow-2xl hover:bg-yellow-500/5">
                        <span className="text-7xl mb-4 block">📜</span>
                        <h2 className="text-2xl font-black text-white uppercase italic">Primer Bloque</h2>
                        <p className="text-slate-500 text-xs mt-2 font-bold">RE-EDICIONES / CON SISTEMA DE RAZAS</p>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                
                {/* BARRA DE NAVEGACIÓN INTERNA */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-[2rem] border border-white/5 backdrop-blur-xl gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep("selector")} className="bg-slate-800 p-3 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs">✕ SALIR</button>
                        <div>
                            <h1 className="text-lg font-black uppercase italic leading-none">
                                GESTIÓN: <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Panel de control administrativo</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 ml-2">FILTRAR EDICIÓN:</span>
                        <select 
                            value={edicionFiltro} 
                            onChange={(e) => setEdicionFiltro(e.target.value)}
                            className="bg-slate-800 p-2 px-4 rounded-xl font-bold text-xs outline-none text-white cursor-pointer"
                        >
                            {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (
                                <option key={slug} value={slug}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* FORMULARIO ESPECIALIZADO */}
                    <div className="lg:col-span-1 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 h-fit sticky top-24 shadow-2xl backdrop-blur-md">
                        <h2 className="text-xl font-black mb-8 uppercase italic text-yellow-500 flex items-center gap-2">
                            {editingCard ? "📝 Editar Carta" : "✨ Nueva Carta"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Nombre</label>
                                <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 focus:border-orange-500 transition-all font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Slug / ID</label>
                                    <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 text-xs font-bold" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Tipo</label>
                                    <select className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 text-xs font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="Aliado">Aliado</option>
                                        <option value="Talismán">Talismán</option>
                                        <option value="Oro">Oro</option>
                                        <option value="Arma">Arma</option>
                                        <option value="Tótem">Tótem</option>
                                    </select>
                                </div>
                            </div>

                            {/* CAMPOS DINÁMICOS SEGÚN FORMATO */}
                            {formato === "primer_bloque" ? (
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Raza (Primer Bloque)</label>
                                    <select className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-yellow-500/20 text-xs font-bold" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} required>
                                        <option value="">Selecciona Raza</option>
                                        {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">Rareza (Imperio)</label>
                                    <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-orange-500/20" value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} />
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-1 block">URL Imagen</label>
                                <input type="text" className="w-full p-3.5 bg-slate-800 rounded-2xl outline-none border border-white/5 text-xs" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                            </div>
                            
                            <div className="flex gap-2 pt-6">
                                <button type="submit" className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase shadow-lg transition-all active:scale-95 ${formato === 'imperio' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}>
                                    {editingCard ? "Actualizar" : "Guardar Carta"}
                                </button>
                                {editingCard && (
                                    <button type="button" onClick={resetForm} className="bg-slate-700 px-6 rounded-[1.5rem] hover:bg-slate-600 transition-all font-black">✕</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* LISTADO DE CARTAS EXISTENTES */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-black text-slate-500 tracking-[0.2em]">CARGANDO REGISTROS...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-[80vh] p-2 custom-scrollbar pr-4">
                                {cartas.length === 0 ? (
                                    <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase tracking-widest bg-slate-900/20 rounded-3xl border border-dashed border-white/10">No hay cartas en esta edición</div>
                                ) : cartas.map(c => (
                                    <div key={c._id} className="bg-slate-900 p-2 rounded-[2rem] border border-white/5 group relative overflow-hidden shadow-xl transition-all hover:border-orange-500/50">
                                        <img src={c.imgUrl || c.img} className="w-full h-auto rounded-[1.5rem] transition-transform group-hover:scale-105 duration-500" alt={c.name} />
                                        <div className="mt-3 px-2 pb-1">
                                            <p className="text-[11px] font-black truncate uppercase text-white tracking-tight">{c.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase">{c.type} {c.race ? `• ${c.race}` : ''}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                                            <button onClick={() => {
                                                setEditingCard(c);
                                                setFormData({ ...c, edition: c.edition || c.edition_slug, imgUrl: c.imgUrl || c.img });
                                                window.scrollTo({top: 0, behavior: 'smooth'});
                                            }} className="w-28 bg-blue-600 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-blue-500 active:scale-95">Editar</button>
                                            <button onClick={async () => {
                                                if(window.confirm("¿Borrar carta?")) {
                                                    await fetch(`${BACKEND_URL}/api/cards/${c._id}`, { method: "DELETE", headers: { "auth-token": token } });
                                                    fetchCartas();
                                                }
                                            }} className="w-28 bg-red-600 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-red-500 active:scale-95">Borrar</button>
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
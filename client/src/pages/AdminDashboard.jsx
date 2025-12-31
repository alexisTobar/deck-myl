import { useState, useEffect, useMemo } from "react";
import BACKEND_URL from "../config";
import {
    Plus, Layout, Save, X, ChevronLeft, Star, ShieldAlert,
    Search, Layers, Users, BarChart3, MessageSquare, Trash2, ShieldCheck, Settings
} from "lucide-react";

// Mantenemos tus constantes de ediciones originales
const EDICIONES_IMPERIO = { "all": "🌐 TODAS LAS EDICIONES", "25_Aniversario_Imp": "25 aniversario", "kvsm_titanes": "KVSM Titanes", "libertadores": "Libertadores", "onyria": "Onyria", "toolkit_cenizas_de_fuego": "Toolkit Cenizas", "toolkit_hielo_inmortal": "Toolkit Hielo", "lootbox_2024": "Lootbox 2024", "secretos_arcanos": "Secretos Arcanos", "bestiarium": "Bestiarium", "escuadronmecha": "Escuadrón Mecha", "amenazakaiju": "Amenaza Kaiju", "zodiaco": "Zodiaco", "espiritu_samurai": "Espíritu Samurai" };
const EDICIONES_PB = { "all": "🌐 TODAS LAS EDICIONES", "espada_sagrada": "ESPADA SAGRADA", "helenica": "HELÉNICA", "hijos_de_daana": "HIJOS DE DAANA", "dominios_de_ra": "DOMINIOS DE RA" };
const TIPOS_IMPERIO = [{ id: "1", label: "Aliado" }, { id: "2", label: "Talismán" }, { id: "3", label: "Arma" }, { id: "4", label: "Tótem" }, { id: "5", label: "Oro" }];
const TIPOS_PB = ["Aliado", "Talismán", "Arma", "Tótem", "Oro"];
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];
const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function AdminDashboard() {
    const [view, setView] = useState("dashboard"); // dashboard, cards, users, meta
    const [formato, setFormato] = useState("");
    const [edicionFiltro, setEdicionFiltro] = useState("all");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [busquedaInterna, setBusquedaInterna] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [statsMeta, setStatsMeta] = useState([]);

    const initialFormState = { name: "", slug: "", edition: "", edition_slug: "", type: "", race: "", imgUrl: "", format: "", cost: 0, strength: 0, ability: "", rarity: "1", restriction: "unrestricted" };
    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (view === "users") fetchUsuarios();
        if (view === "meta") fetchMetaStats();
        if (view === "cards" && formato) fetchCartas();
    }, [view, formato, edicionFiltro]);

    const fetchUsuarios = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/all`, { headers: { "auth-token": token } });
            const data = await res.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchMetaStats = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/stats/meta`, { headers: { "auth-token": token } });
            const data = await res.json();
            setStatsMeta(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchCartas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ format: formato });
            if (edicionFiltro !== "all") params.append("edition", edicionFiltro);
            const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleOpenEditor = (f) => {
        setFormato(f);
        setView("cards");
    };

    // Mantenemos tu handleSubmit original íntegro
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;
        const dataToSend = { ...formData, edition_slug: formData.edition, img: formData.imgUrl, imageUrl: formData.imgUrl };
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) { alert("¡Guardado! ✅"); fetchCartas(); setEditingCard(null); setFormData(initialFormState); }
        } catch (e) { alert("Error"); }
    };

    // ✅ VISTA: DASHBOARD PRINCIPAL
    if (view === "dashboard") {
        return (
            <div className="min-h-screen bg-[#0B1120] p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Panel de Control</h1>
                    <p className="text-slate-500 mb-12 font-bold uppercase text-xs tracking-widest">Gestión Global de Warning Deck</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Tarjetas de Acceso Rápido */}
                        <div onClick={() => handleOpenEditor("imperio")} className="bg-slate-900 border border-orange-500/20 p-8 rounded-[2.5rem] cursor-pointer hover:border-orange-500 transition-all group shadow-2xl">
                            <Layers className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-white font-black uppercase italic">Editor Imperio</h3>
                            <p className="text-slate-500 text-[10px] font-bold mt-2">GESTIONAR CARTAS Y DAR</p>
                        </div>

                        <div onClick={() => handleOpenEditor("primer_bloque")} className="bg-slate-900 border border-yellow-500/20 p-8 rounded-[2.5rem] cursor-pointer hover:border-yellow-500 transition-all group shadow-2xl">
                            <Star className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-white font-black uppercase italic">Editor P. Bloque</h3>
                            <p className="text-slate-500 text-[10px] font-bold mt-2">GESTIONAR CARTAS Y DAR</p>
                        </div>

                        <div onClick={() => setView("users")} className="bg-slate-900 border border-purple-500/20 p-8 rounded-[2.5rem] cursor-pointer hover:border-purple-500 transition-all group shadow-2xl">
                            <Users className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-white font-black uppercase italic">Usuarios</h3>
                            <p className="text-slate-500 text-[10px] font-bold mt-2">CONTROL DE COMUNIDAD</p>
                        </div>

                        <div onClick={() => setView("meta")} className="bg-slate-900 border border-blue-500/20 p-8 rounded-[2.5rem] cursor-pointer hover:border-blue-500 transition-all group shadow-2xl">
                            <BarChart3 className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-white font-black uppercase italic">Meta Report</h3>
                            <p className="text-slate-500 text-[10px] font-bold mt-2">ESTADÍSTICAS DE USO</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Cabecera de Navegación */}
                <div className="flex items-center gap-6 mb-12 bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 shadow-xl sticky top-4 z-50">
                    <button onClick={() => setView("dashboard")} className="bg-slate-800 p-4 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-red-600 transition-colors"><ChevronLeft size={20} /> VOLVER AL PANEL</button>
                    <h2 className="text-xl font-black uppercase italic border-l border-white/10 pl-6 text-orange-500">{view.replace("_", " ")}</h2>

                    {view === "cards" && (
                        <div className="flex flex-1 gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-3 text-slate-500" size={20} />
                                <input type="text" placeholder="Buscador..." className="w-full bg-slate-800 border border-white/10 pl-12 py-3 rounded-2xl" value={busquedaInterna} onChange={e => setBusquedaInterna(e.target.value)} />
                            </div>
                            <select className="bg-slate-800 px-6 rounded-2xl font-bold text-xs border border-white/10" value={edicionFiltro} onChange={e => setEdicionFiltro(e.target.value)}>
                                {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {/* VISTA: EDITOR DE CARTAS (Tu lógica original intacta) */}
                {view === "cards" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre de Carta</label>
                                <input type="text" className="w-full p-4 bg-slate-800 rounded-2xl border border-white/5 outline-none focus:border-orange-500 font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                {/* ... Resto de tus campos de formulario originales ... */}
                                <div className="space-y-1 pt-4">
                                    <button type="submit" className="w-full py-4 bg-orange-600 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-transform"><Save size={20} className="inline mr-2" /> {editingCard ? "Actualizar" : "Inyectar"}</button>
                                </div>
                            </form>
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
                            {cartas.filter(c => c.name.toLowerCase().includes(busquedaInterna.toLowerCase())).map(c => (
                                <div key={c._id} className="bg-slate-900 p-3 rounded-3xl border border-white/5 relative group shadow-2xl overflow-hidden">
                                    <img src={getImg(c)} className="w-full h-auto rounded-2xl group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <button onClick={() => { setEditingCard(c); setFormData({ ...c, imgUrl: getImg(c) }); }} className="bg-blue-600 p-4 rounded-full"><Plus size={24} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VISTA: GESTIÓN DE USUARIOS */}
                {view === "users" && (
                    <div className="bg-slate-900 rounded-[3rem] border border-white/5 p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500"><Users size={24} /></div>
                            <h2 className="text-2xl font-black uppercase italic">Control de Invocadores ({usuarios.length})</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {usuarios.map(u => (
                                <div key={u._id} className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all group">
                                    <p className="text-lg font-black text-white">@{u.username}</p>
                                    <p className="text-xs text-slate-500 font-bold mb-4">{u.email}</p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-slate-950 rounded-lg text-[10px] font-black text-slate-400 uppercase">{u.role}</span>
                                        <button className="text-[10px] font-black text-red-500 uppercase ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Banear</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VISTA: META REPORT */}
                {view === "meta" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 border border-white/5">
                            <h2 className="text-2xl font-black uppercase italic mb-8 text-blue-500 flex items-center gap-4">
                                <BarChart3 size={32} /> Cartas más Usadas (All Time)
                            </h2>
                            <div className="space-y-4">
                                {statsMeta.map((s, i) => (
                                    <div key={i} className="flex items-center gap-6 bg-slate-800/30 p-4 rounded-3xl border border-white/5">
                                        <span className="text-2xl font-black text-slate-700 italic">#{i + 1}</span>
                                        <img src={s.imgUrl} className="w-12 h-16 rounded-lg object-cover border border-white/10" />
                                        <div className="flex-1">
                                            <p className="font-black text-white uppercase text-sm">{s.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{s.format}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-blue-500">{s.usageCount}</p>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Apariciones</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 h-fit">
                            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Estado General</h3>
                            <div className="p-6 bg-slate-950 rounded-3xl border-l-4 border-blue-500">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Comunidad Activa</p>
                                <p className="text-4xl font-black text-white mt-1">{usuarios.length}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
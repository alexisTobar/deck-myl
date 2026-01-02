import { useState, useEffect, useMemo } from "react";
import BACKEND_URL from "../config";
import {
    Plus, Layout, Save, X, ChevronLeft, Star, ShieldAlert,
    Search, Layers, Users, BarChart3, MessageSquare, Trash2, ShieldCheck, Activity
} from "lucide-react";

// ✅ TUS CONSTANTES ORIGINALES (MANTENIDAS ÍNTEGRAS)
const EDICIONES_IMPERIO = {
    "all": "🌐 TODAS LAS EDICIONES",
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

const EDICIONES_PB = {
    "all": "🌐 TODAS LAS EDICIONES",
    "espada_sagrada": "ESPADA SAGRADA",
    "helenica": "HELÉNICA",
    "hijos_de_daana": "HIJOS DE DAANA",
    "dominios_de_ra": "DOMINIOS DE RA"
};

const TIPOS_IMPERIO = [
    { id: "1", label: "Aliado" },
    { id: "2", label: "Talismán" },
    { id: "3", label: "Arma" },
    { id: "4", label: "Tótem" },
    { id: "5", label: "Oro" }
];

const TIPOS_PB = ["Aliado", "Talismán", "Arma", "Tótem", "Oro"];
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán", "Sombra", "Sacerdote"];

const getImg = (c) => c?.imgUrl || c?.imageUrl || c?.img || "https://via.placeholder.com/250x350?text=No+Image";

export default function AdminDashboard() {
    const [step, setStep] = useState("dashboard");
    const [formato, setFormato] = useState("");
    const [edicionFiltro, setEdicionFiltro] = useState("all");
    const [cartas, setCartas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [busquedaInterna, setBusquedaInterna] = useState("");

    const [activeTab, setActiveTab] = useState("cards");
    const [usuarios, setUsuarios] = useState([]);
    const [statsMeta, setStatsMeta] = useState([]);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "", race: "", imgUrl: "", format: "",
        cost: 0, strength: 0, ability: "", rarity: "1",
        restriction: "unrestricted"
    };

    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    const resetForm = () => {
        setEditingCard(null);
        setFormData({
            ...initialFormState,
            format: formato,
            edition: edicionFiltro === "all" ? "" : edicionFiltro,
            edition_slug: edicionFiltro === "all" ? "" : edicionFiltro,
            type: formato === "imperio" ? "1" : "Aliado",
            race: ""
        });
    };

    useEffect(() => {
        if (formato && step === "editor") {
            fetchCartas();
        }
        if (activeTab === "users" && step === "editor") fetchUsuarios();
        if (activeTab === "meta" && step === "editor") fetchMetaStats();
    }, [edicionFiltro, formato, activeTab, step]);

    const cartasFiltradas = useMemo(() => {
        return cartas.filter(c =>
            c.name?.toLowerCase().includes(busquedaInterna.toLowerCase()) ||
            c.slug?.toLowerCase().includes(busquedaInterna.toLowerCase())
        );
    }, [cartas, busquedaInterna]);

    const fetchCartas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ format: formato });
            if (edicionFiltro !== "all") params.append("edition", edicionFiltro);
            const res = await fetch(`${BACKEND_URL}/api/cards/search?${params.toString()}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { console.error("Error al buscar cartas:", e); }
        finally { setLoading(false); }
    };

    const fetchUsuarios = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/all`, {
                headers: { "auth-token": token }
            });
            const data = await res.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchMetaStats = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/decks/stats/meta?format=${formato}`, {
                headers: { "auth-token": token }
            });
            const data = await res.json();
            setStatsMeta(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    // ✅ NUEVA FUNCIÓN: ELIMINAR USUARIO
    const handleDeleteUser = async (id) => {
        if (!window.confirm("¿Confirmas la eliminación definitiva de este usuario?")) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/user/${id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) {
                alert("Usuario eliminado ✅");
                fetchUsuarios();
            }
        } catch (e) { console.error(e); }
    };

    // ✅ NUEVA FUNCIÓN: CAMBIAR ROL
    const handleRoleChange = async (id, newRole) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/role/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                alert("Rol actualizado ✅");
                fetchUsuarios();
            }
        } catch (e) { console.error(e); }
    };

    const handleSelectFormat = (f) => {
        setFormato(f);
        setEdicionFiltro("all");
        setActiveTab("cards");
        setFormData({ ...initialFormState, format: f, type: f === "imperio" ? "1" : "Aliado" });
        setStep("editor");
    };

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
            if (res.ok) {
                alert("Operación exitosa ✅");
                fetchCartas();
                resetForm();
            } else { alert("Error al guardar."); }
        } catch (e) { alert("Error de conexión."); }
    };

    if (step === "dashboard") {
        return (
            <div className="min-h-screen bg-[#0B1120] p-8 md:p-16 text-white">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-16">
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Warning <span className="text-orange-500">Admin</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2"><Activity size={14} /> Dashboard Central de Operaciones</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div onClick={() => handleSelectFormat("imperio")} className="bg-slate-900 border-2 border-orange-500/10 p-10 rounded-[3rem] cursor-pointer hover:border-orange-500 transition-all group shadow-2xl relative overflow-hidden">
                            <Layers className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black uppercase italic">Imperio</h3>
                            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-widest uppercase">Editor de Cartas</p>
                        </div>
                        <div onClick={() => handleSelectFormat("primer_bloque")} className="bg-slate-900 border-2 border-yellow-500/10 p-10 rounded-[3rem] cursor-pointer hover:border-yellow-500 transition-all group shadow-2xl relative overflow-hidden">
                            <Star className="text-yellow-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black uppercase italic">P. Bloque</h3>
                            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-widest uppercase">Editor de Cartas</p>
                        </div>
                        <div onClick={() => { setFormato("imperio"); setActiveTab("users"); setStep("editor"); }} className="bg-slate-900 border-2 border-purple-500/10 p-10 rounded-[3rem] cursor-pointer hover:border-purple-500 transition-all group shadow-2xl relative overflow-hidden">
                            <Users className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black uppercase italic">Usuarios</h3>
                            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-widest uppercase">Comunidad</p>
                        </div>
                        <div onClick={() => { setFormato("imperio"); setActiveTab("meta"); setStep("editor"); }} className="bg-slate-900 border-2 border-blue-500/10 p-10 rounded-[3rem] cursor-pointer hover:border-blue-500 transition-all group shadow-2xl relative overflow-hidden">
                            <BarChart3 className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black uppercase italic">Meta Report</h3>
                            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-widest uppercase">Estadísticas</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white pb-32">
            <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">

                {/* CABECERA Y NAVEGACIÓN */}
                <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 shadow-xl sticky top-4 z-40">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep("dashboard")} className="bg-slate-800 p-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-red-600 transition-colors"><ChevronLeft size={16} /> PANEL CENTRAL</button>
                            <h1 className="text-lg font-black uppercase italic tracking-tighter">
                                {formato === "imperio" ? "🏛️" : "📜"} <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{formato.replace("_", " ")}</span>
                            </h1>
                        </div>
                        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 gap-2">
                            <button onClick={() => setActiveTab("cards")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${activeTab === 'cards' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Layers size={14} /> Cartas
                            </button>
                            <button onClick={() => setActiveTab("users")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Users size={14} /> Usuarios
                            </button>
                            <button onClick={() => setActiveTab("meta")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${activeTab === 'meta' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                <BarChart3 size={14} /> Meta Report
                            </button>
                        </div>
                    </div>

                    {activeTab === "cards" && (
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="relative flex-[2]">
                                <Search className="absolute left-4 top-3 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscador Global: Nombre o Slug..."
                                    className="w-full bg-slate-800 border border-white/10 pl-12 pr-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                    value={busquedaInterna}
                                    onChange={(e) => setBusquedaInterna(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-2xl border border-white/10">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Edición:</span>
                                <select className="bg-transparent outline-none text-xs font-bold text-white cursor-pointer w-full" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                                    {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug} className="bg-slate-900">{label}</option>))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === "cards" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit sticky top-48">
                            <h2 className="text-xl font-black mb-8 uppercase text-yellow-500 italic flex items-center gap-2">
                                {editingCard ? <Layout size={20} /> : <Plus size={20} />}
                                {editingCard ? "Modificar" : "Nueva Carta"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre</label>
                                    <input type="text" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 font-bold focus:border-orange-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-red-500 uppercase ml-2 flex items-center gap-1"><ShieldAlert size={12} /> Restricción</label>
                                    <select className="w-full p-3 bg-slate-950 rounded-xl border border-red-500/30 outline-none text-xs font-black text-white" value={formData.restriction} onChange={e => setFormData({ ...formData, restriction: e.target.value })}>
                                        <option value="unrestricted">Sin Restricción (3)</option>
                                        <option value="limited2">Limitada (2)</option>
                                        <option value="limited1">Única (1)</option>
                                        <option value="banned">Prohibida (0)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Edición</label>
                                    <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs font-black" value={formData.edition} onChange={e => setFormData({ ...formData, edition: e.target.value, edition_slug: e.target.value })} required>
                                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).filter(([k]) => k !== 'all').map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Slug</label>
                                        <input type="text" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-[10px] font-bold" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Tipo</label>
                                        <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-[10px] font-black" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            {formato === "imperio" ? TIPOS_IMPERIO.map(t => <option key={t.id} value={t.id}>{t.label}</option>) : TIPOS_PB.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* ✅ REPARACIÓN: SECTOR RAZAS PB */}
                                {formato === "primer_bloque" && formData.type === "Aliado" && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Raza</label>
                                        <select className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-[10px] font-black" value={formData.race} onChange={e => setFormData({ ...formData, race: e.target.value })}>
                                            <option value="">Sin Raza</option>
                                            {RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Coste" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })} />
                                    <input type="number" placeholder="Fuerza" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs" value={formData.strength} onChange={e => setFormData({ ...formData, strength: parseInt(e.target.value) || 0 })} />
                                </div>
                                <textarea placeholder="Habilidad..." className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-xs h-24" value={formData.ability} onChange={e => setFormData({ ...formData, ability: e.target.value })} />
                                <input type="text" placeholder="URL Imagen" className="w-full p-3 bg-slate-800 rounded-xl border border-white/5 outline-none text-[10px] font-bold" value={formData.imgUrl} onChange={e => setFormData({ ...formData, imgUrl: e.target.value })} required />
                                <div className="pt-4 space-y-2">
                                    <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all ${formato === 'imperio' ? 'bg-orange-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                        <Save size={18} /> {editingCard ? "Actualizar" : "Inyectar"}
                                    </button>
                                    {editingCard && <button type="button" onClick={resetForm} className="w-full py-2 text-[10px] font-black text-slate-500 uppercase flex items-center justify-center gap-1"><X size={14} /> Cancelar</button>}
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="flex flex-col items-center py-40 gap-4">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="font-black text-slate-500 uppercase italic">Cargando...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-[120vh] p-2 custom-scrollbar">
                                    {cartasFiltradas.map(c => (
                                        <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden shadow-2xl hover:border-blue-500/50 transition-all">
                                            <img src={getImg(c)} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105" alt={c.name} />
                                            <div className="mt-2 text-center pb-2 px-1">
                                                <p className="text-[10px] font-black truncate uppercase text-white tracking-tighter">{c.name}</p>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase">{c.edition_slug || c.edition}</p>
                                            </div>
                                            <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                                                <button onClick={() => {
                                                    setEditingCard(c);
                                                    setFormData({ ...c, imgUrl: getImg(c), restriction: c.restriction || "unrestricted", edition: c.edition || c.edition_slug });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }} className="bg-blue-600 p-3 rounded-full text-white shadow-xl hover:scale-110 transition-transform">
                                                    <Layout size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                        <h2 className="text-2xl font-black uppercase italic mb-8 text-purple-500 flex items-center gap-3">
                            <Users size={28} /> Control de Invocadores
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {usuarios.map(u => (
                                <div key={u._id} className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-lg font-black text-white">@{u.username}</p>
                                            <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                                        </div>
                                        <select 
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase outline-none ${u.role === 'admin' ? 'bg-red-600' : 'bg-slate-700'}`}
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        >
                                            <option value="user">USER</option>
                                            <option value="admin">ADMIN</option>
                                            <option value="banned">BANNED</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteUser(u._id)}
                                        className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        <Trash2 size={14} /> Eliminar Usuario
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "meta" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                            <h2 className="text-2xl font-black uppercase italic mb-8 text-orange-500 flex items-center gap-3">
                                <BarChart3 size={28} /> Cartas más Populares ({formato})
                            </h2>
                            <div className="space-y-4">
                                {statsMeta.map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                                        <span className="w-8 font-black text-slate-600 text-xl">#{idx + 1}</span>
                                        <div className="w-12 h-16 bg-slate-700 rounded-lg overflow-hidden border border-white/10">
                                            <img src={stat.imgUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-white text-sm uppercase">{stat.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{stat.format}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-orange-500">{stat.usageCount}</p>
                                            <p className="text-[8px] text-slate-500 font-black uppercase">Veces Usada</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl h-fit">
                            <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                                <ShieldCheck size={16} /> Salud Global
                            </h3>
                            <div className="p-4 bg-slate-800/50 rounded-2xl border-l-4 border-blue-600">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Total Usuarios</p>
                                <p className="text-3xl font-black text-white">{usuarios.length}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
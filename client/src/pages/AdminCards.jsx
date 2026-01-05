import { useState, useEffect, useMemo } from "react";
import BACKEND_URL from "../config";
import Swal from "sweetalert2";
import {
    Plus, Layout, Save, X, ChevronLeft, Star, ShieldAlert,
    Search, Layers, Users, BarChart3, MessageSquare, Trash2, ShieldCheck, 
    Activity, ShoppingBag, Moon, Sun, ExternalLink, Phone, Instagram
} from "lucide-react";

// ✅ CONSTANTES MANTENIDAS
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

// ✅ RAZAS DE IMPERIO ACTUALIZADAS
const RAZAS_IMPERIO_LIST = [
    "Caballero", "Eterno", "Héroe", "Faerie", "Dragón", "Bestia", "Guerrero", "Sacerdote", "Sombra"
];

const TIPOS_PB = ["Aliado", "Talismán", "Arma", "Tótem", "Oro"];
const RAZAS_PB = ["Caballero", "Héroe", "Defensor", "Eterno", "Dragón", "Oro", "Aliado", "Talismán", "Arma", "Tótem", "Sombra", "Sacerdote", "Olímpico", "Desafiante", "Faraón", "Faerie", "Titán"];

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
    const [marketItems, setMarketItems] = useState([]);

    const initialFormState = {
        name: "", slug: "", edition: "", edition_slug: "",
        type: "", race: "", imgUrl: "", format: "",
        cost: 0, strength: 0, ability: "", rarity: "1",
        restriction: "unrestricted"
    };

    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    const swalStyle = {
        background: 'var(--tw-bg-opacity)',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#ef4444',
    };

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
        if (activeTab === "market" && step === "editor") fetchMarketItems();
    }, [edicionFiltro, formato, activeTab, step]);

    // ✅ MEJORA: ORDENAMIENTO DESCENDENTE (LAS NUEVAS PRIMERO)
    const cartasFiltradas = useMemo(() => {
        const filtradas = cartas.filter(c =>
            c.name?.toLowerCase().includes(busquedaInterna.toLowerCase()) ||
            c.slug?.toLowerCase().includes(busquedaInterna.toLowerCase())
        );
        // Ordenamos por ID de MongoDB (el cual contiene la fecha de creación) de forma descendente
        return filtradas.sort((a, b) => b._id.localeCompare(a._id));
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

    const fetchMarketItems = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/marketplace/all`);
            const data = await res.json();
            setMarketItems(data);
        } catch (e) { console.error(e); }
    };

    const handleDeleteMarketItem = async (id) => {
        Swal.fire({
            title: '¿Borrar publicación?',
            text: "Se eliminará permanentemente del mercado 🛒",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Borrar',
            cancelButtonText: 'Cancelar',
            ...swalStyle
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${BACKEND_URL}/api/marketplace/${id}`, {
                        method: "DELETE",
                        headers: { 
                            "auth-token": token,
                            "Content-Type": "application/json"
                        }
                    });
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Publicación eliminada', ...swalStyle });
                        fetchMarketItems();
                    } else {
                        const errData = await res.json();
                        Swal.fire({ icon: 'error', title: 'Error', text: errData.msg || 'No se pudo borrar', ...swalStyle });
                    }
                } catch (e) { 
                    console.error(e);
                    Swal.fire({ icon: 'error', title: 'Error de red', ...swalStyle });
                }
            }
        });
    };

    const handleDeleteUser = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Eliminarás al invocador definitivamente! 💀",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            ...swalStyle
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${BACKEND_URL}/api/auth/user/${id}`, {
                        method: "DELETE",
                        headers: { "auth-token": token }
                    });
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Usuario purgado', ...swalStyle });
                        fetchUsuarios();
                    }
                } catch (e) {
                    Swal.fire({ icon: 'error', title: 'Error de conexión', ...swalStyle });
                }
            }
        });
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/role/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Rango: ${newRole.toUpperCase()}`,
                    showConfirmButton: false,
                    timer: 3000,
                });
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
                Swal.fire({
                    icon: 'success',
                    title: editingCard ? 'Carta Actualizada' : 'Carta Inyectada',
                    text: 'Los cambios se guardaron en la base de datos ✅',
                });
                fetchCartas();
                resetForm();
            } else {
                Swal.fire({ icon: 'error', title: 'Error al guardar' });
            }
        } catch (e) {
            Swal.fire({ icon: 'error', title: 'Error de red' });
        }
    };

    if (step === "dashboard") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] p-8 md:p-16 text-slate-900 dark:text-white transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-16">
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Warning <span className="text-orange-500">Admin</span></h1>
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2"><Activity size={14} /> Estación Central de Monitoreo</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                        <MenuCard icon={<Layers size={48}/>} color="text-orange-500" borderColor="border-orange-500/10" hoverColor="hover:border-orange-500" title="Imperio" sub="Base de Datos" onClick={() => handleSelectFormat("imperio")} />
                        <MenuCard icon={<Star size={48}/>} color="text-yellow-500" borderColor="border-yellow-500/10" hoverColor="hover:border-yellow-500" title="P. Bloque" sub="Base de Datos" onClick={() => handleSelectFormat("primer_bloque")} />
                        <MenuCard icon={<Users size={48}/>} color="text-purple-500" borderColor="border-purple-500/10" hoverColor="hover:border-purple-500" title="Usuarios" sub="Invocadores" onClick={() => { setFormato("imperio"); setActiveTab("users"); setStep("editor"); }} />
                        <MenuCard icon={<ShoppingBag size={48}/>} color="text-pink-500" borderColor="border-pink-500/10" hoverColor="hover:border-pink-500" title="Market" sub="Moderación" onClick={() => { setFormato("imperio"); setActiveTab("market"); setStep("editor"); }} />
                        <MenuCard icon={<BarChart3 size={48}/>} color="text-blue-500" borderColor="border-blue-500/10" hoverColor="hover:border-blue-500" title="Meta Stats" sub="Analytics" onClick={() => { setFormato("imperio"); setActiveTab("meta"); setStep("editor"); }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white pb-32 transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">

                <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl sticky top-4 z-40">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep("dashboard")} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"><ChevronLeft size={16} /> VOLVER</button>
                            <h1 className="text-lg font-black uppercase italic tracking-tighter">
                                {formato === "imperio" ? "🏛️" : "📜"} <span className={formato === "imperio" ? "text-orange-500" : "text-yellow-500"}>{activeTab.toUpperCase()}</span>
                            </h1>
                        </div>

                        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 gap-2 overflow-x-auto max-w-full no-scrollbar">
                            <TabBtn active={activeTab === 'cards'} label="Cartas" icon={<Layers size={14} />} color="bg-blue-600" onClick={() => setActiveTab("cards")} />
                            <TabBtn active={activeTab === 'users'} label="Usuarios" icon={<Users size={14} />} color="bg-purple-600" onClick={() => setActiveTab("users")} />
                            <TabBtn active={activeTab === 'market'} label="Market" icon={<ShoppingBag size={14} />} color="bg-pink-600" onClick={() => setActiveTab("market")} />
                            <TabBtn active={activeTab === 'meta'} label="Analytics" icon={<BarChart3 size={14} />} color="bg-orange-600" onClick={() => setActiveTab("meta")} />
                        </div>
                    </div>

                    {activeTab === "cards" && (
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="relative flex-[2]">
                                <Search className="absolute left-4 top-3 text-slate-500" size={20} />
                                <input type="text" placeholder="Buscador: Nombre o Slug..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 pl-12 pr-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white" value={busquedaInterna} onChange={(e) => setBusquedaInterna(e.target.value)} />
                            </div>
                            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Edición:</span>
                                <select className="bg-transparent outline-none text-xs font-bold text-slate-700 dark:text-white cursor-pointer w-full" value={edicionFiltro} onChange={(e) => setEdicionFiltro(e.target.value)}>
                                    {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).map(([slug, label]) => (<option key={slug} value={slug} className="dark:bg-slate-900">{label}</option>))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === "cards" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl h-fit sticky top-48">
                            <h2 className="text-xl font-black mb-8 uppercase text-yellow-500 italic flex items-center gap-2">
                                {editingCard ? <Layout size={20} /> : <Plus size={20} />}
                                {editingCard ? "Modificar" : "Nueva Carta"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre</label>
                                    <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none border border-slate-200 dark:border-white/5 font-bold focus:border-orange-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-red-500 uppercase ml-2 flex items-center gap-1"><ShieldAlert size={12} /> Restricción</label>
                                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-red-500/30 outline-none text-xs font-black text-slate-700 dark:text-white cursor-pointer" value={formData.restriction} onChange={e => setFormData({ ...formData, restriction: e.target.value })}>
                                        <option value="unrestricted">Sin Restricción (3)</option>
                                        <option value="limited2">Limitada (2)</option>
                                        <option value="limited1">Única (1)</option>
                                        <option value="banned">Prohibida (0)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Edición</label>
                                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-xs font-black dark:text-white" value={formData.edition} onChange={e => setFormData({ ...formData, edition: e.target.value, edition_slug: e.target.value })} required>
                                        {Object.entries(formato === "imperio" ? EDICIONES_IMPERIO : EDICIONES_PB).filter(([k]) => k !== 'all').map(([slug, label]) => (<option key={slug} value={slug}>{label}</option>))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Slug</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-[10px] font-bold dark:text-white" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Tipo</label>
                                        <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-[10px] font-black dark:text-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            {formato === "imperio" ? TIPOS_IMPERIO.map(t => <option key={t.id} value={t.id}>{t.label}</option>) : TIPOS_PB.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {( (formato === "imperio" && String(formData.type) === "1") || (formato === "primer_bloque" && formData.type === "Aliado") ) && (
                                    <div className="space-y-1 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-blue-500 dark:text-orange-500 uppercase ml-2">Raza de la Carta</label>
                                        <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-[10px] font-black dark:text-white" value={formData.race || ""} onChange={e => setFormData({ ...formData, race: e.target.value })}>
                                            <option value="">Sin Raza / Otros</option>
                                            {formato === "imperio" ? RAZAS_IMPERIO_LIST.map(r => <option key={r} value={r}>{r}</option>) : RAZAS_PB.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Coste" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-xs dark:text-white" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })} />
                                    <input type="number" placeholder="Fuerza" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-xs dark:text-white" value={formData.strength} onChange={e => setFormData({ ...formData, strength: parseInt(e.target.value) || 0 })} />
                                </div>
                                <textarea placeholder="Habilidad..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-xs h-24 dark:text-white" value={formData.ability} onChange={e => setFormData({ ...formData, ability: e.target.value })} />
                                <input type="text" placeholder="URL Imagen" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 outline-none text-[10px] font-bold dark:text-white" value={formData.imgUrl} onChange={e => setFormData({ ...formData, imgUrl: e.target.value })} required />
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
                                    <span className="font-black text-slate-500 uppercase italic text-xs">Conectando con la Forja...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto max-h-[120vh] p-2 custom-scrollbar">
                                    {cartasFiltradas.map(c => (
                                        <div key={c._id} className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-white/5 group relative overflow-hidden shadow-2xl hover:border-blue-500/50 transition-all">
                                            <img src={getImg(c)} className="w-full h-auto rounded-xl transition-transform group-hover:scale-105" alt={c.name} />
                                            <div className="mt-2 text-center pb-2 px-1">
                                                <p className="text-[10px] font-black truncate uppercase text-slate-900 dark:text-white tracking-tighter">{c.name}</p>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase">{c.edition_slug || c.edition}</p>
                                                {c.race && <p className="text-[7px] text-blue-500 font-black uppercase tracking-widest">{c.race}</p>}
                                            </div>
                                            <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm">
                                                <button onClick={() => {
                                                    setEditingCard(c);
                                                    setFormData({ ...c, imgUrl: getImg(c), restriction: c.restriction || "unrestricted", edition: c.edition || c.edition_slug, race: c.race || "" });
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
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
                        <h2 className="text-2xl font-black uppercase italic mb-8 text-purple-500 flex items-center gap-3">
                            <Users size={28} /> Control de Invocadores
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {usuarios.length > 0 ? usuarios.map(u => (
                                <div key={u._id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">@{u.username}</p>
                                            <p className="text-xs text-slate-500 font-bold">{u.email}</p>
                                        </div>
                                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-none cursor-pointer outline-none ${u.role === 'admin' ? 'bg-red-600 text-white' : ''}`}>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="banned">Banned</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleDeleteUser(u._id)} className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                                        <Trash2 size={14} /> Eliminar Usuario
                                    </button>
                                </div>
                            )) : <p className="text-slate-500 italic uppercase text-[10px]">Cargando usuarios...</p>}
                        </div>
                    </div>
                )}

                {activeTab === "market" && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
                        <h2 className="text-2xl font-black uppercase italic mb-8 text-pink-500 flex items-center gap-3">
                            <ShoppingBag size={28} /> Moderación Marketplace
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {marketItems.length > 0 ? marketItems.map(item => (
                                <div key={item._id} className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col group">
                                    <div className="h-48 relative">
                                        <img src={item.images?.[0]} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute top-2 left-2 px-3 py-1 bg-blue-600 rounded-lg text-[8px] font-black text-white uppercase">{item.format}</div>
                                    </div>
                                    <div className="p-5 flex flex-col gap-3">
                                        <p className="font-black text-sm uppercase truncate text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-blue-500 font-black text-lg">${item.price?.toLocaleString()}</p>
                                        <button onClick={() => handleDeleteMarketItem(item._id)} className="mt-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all">
                                            <Trash2 size={14} /> Eliminar Aviso
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-slate-500 italic uppercase text-[10px]">El mercado está tranquilo...</p>}
                        </div>
                    </div>
                )}

                {activeTab === "meta" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-2xl">
                            <h2 className="text-2xl font-black uppercase italic mb-8 text-orange-500 flex items-center gap-3">
                                <BarChart3 size={28} /> Cartas más Populares ({formato})
                            </h2>
                            <div className="space-y-4">
                                {statsMeta.length > 0 ? statsMeta.map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-orange-500/30 transition-all">
                                        <span className="w-8 font-black text-slate-400 text-xl">#{idx + 1}</span>
                                        <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border dark:border-white/10">
                                            <img src={stat.imgUrl} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-slate-900 dark:text-white text-sm uppercase">{stat.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{stat.format}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-orange-500">{stat.usageCount}</p>
                                            <p className="text-[8px] text-slate-500 font-black uppercase">Veces Usada</p>
                                        </div>
                                    </div>
                                )) : <p className="text-slate-500 uppercase italic text-[10px]">Sin datos de meta disponibles.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ✅ SUBCOMPONENTES AUXILIARES
function MenuCard({ icon, color, borderColor, hoverColor, title, sub, onClick }) {
    return (
        <div onClick={onClick} className={`bg-white dark:bg-slate-900 border-2 ${borderColor} p-10 rounded-[3rem] cursor-pointer ${hoverColor} transition-all group shadow-2xl relative overflow-hidden active:scale-95`}>
            <div className={`${color} mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
            <h3 className="text-2xl font-black uppercase italic dark:text-white">{title}</h3>
            <p className="text-slate-500 text-[10px] font-black mt-2 tracking-widest uppercase">{sub}</p>
        </div>
    );
}

function TabBtn({ active, label, icon, color, onClick }) {
    return (
        <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${active ? `${color} text-white shadow-lg` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {icon} {label}
        </button>
    );
}
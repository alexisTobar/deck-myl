import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

export default function AdminCards() {
    const [cartas, setCartas] = useState([]);
    const [formato, setFormato] = useState("primer_bloque");
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    // Estado inicial del formulario adaptado a tus datos
    const initialFormState = {
        name: "",
        edition: "",        // Para PB y como base
        edition_slug: "",   // Específico para Imperio
        type: "Aliado",     // Tipo para filtros (Aliado, Talismán, Oro, etc)
        race: "",           // Solo para PB
        imgUrl: "",
        format: "primer_bloque",
        slug: "",           // Ej: "es33" o "transformacion_secreta"
        rarity: "1",        // Valor por defecto
    };

    const [formData, setFormData] = useState(initialFormState);
    const token = localStorage.getItem("token");

    // Cargar cartas cuando cambie el formato
    useEffect(() => {
        fetchCartas();
    }, [formato]);

    const fetchCartas = async () => {
        setLoading(true);
        try {
            // Usamos tu ruta de búsqueda avanzada pero sin filtros para traer todas las de ese formato
            // Agregamos un q= vacío o simplemente format para que el backend responda
            const res = await fetch(`${BACKEND_URL}/api/cards/search?format=${formato}&q=`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error("Error cargando cartas:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard 
            ? `${BACKEND_URL}/api/cards/${editingCard._id}` 
            : `${BACKEND_URL}/api/cards`;

        // Limpieza de datos según formato antes de enviar
        const dataToSend = { ...formData };
        if (formato === "imperio") {
            dataToSend.edition_slug = formData.edition; // Sincronizamos edición con slug para imperio
            delete dataToSend.race; // Imperio no usa raza
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "auth-token": token 
                },
                body: JSON.stringify(dataToSend)
            });
            if (res.ok) {
                alert(editingCard ? "Carta Actualizada ⚔️" : "Carta Invocada ⚔️");
                cancelEdit();
                fetchCartas();
            }
        } catch (e) { alert("Error en la forja de la carta"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar esta carta del registro ancestral?")) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
                method: "DELETE",
                headers: { "auth-token": token }
            });
            if (res.ok) fetchCartas();
        } catch (e) { console.error(e); }
    };

    const cancelEdit = () => {
        setEditingCard(null);
        setFormData({ ...initialFormState, format: formato });
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-4 md:p-10 pb-32">
            <h1 className="text-3xl font-black text-orange-500 uppercase italic mb-8 tracking-tighter">
                Gestión de Armería
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- FORMULARIO DINÁMICO --- */}
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 h-fit sticky top-24 shadow-2xl backdrop-blur-md">
                    <h2 className="text-xl font-bold mb-6 text-yellow-500 uppercase italic">
                        {editingCard ? "Modificar Carta" : "Nueva Invocación"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre de la carta</label>
                            <input type="text" placeholder="Ej: Nimue" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 focus:border-orange-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Slug / ID</label>
                                <input type="text" placeholder="Ej: es33" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Tipo</label>
                                <select className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Aliado">Aliado</option>
                                    <option value="Talismán">Talismán</option>
                                    <option value="Oro">Oro</option>
                                    <option value="Arma">Arma</option>
                                    <option value="Tótem">Tótem</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Edición (Slug)</label>
                            <input type="text" placeholder="Ej: espada_sagrada_aniversario" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value})} required />
                        </div>

                        {/* Campo condicional: RAZA solo para Primer Bloque */}
                        {formato === "primer_bloque" && (
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Raza (Solo PB)</label>
                                <input type="text" placeholder="Ej: Faerie" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-yellow-500/20 focus:border-yellow-500" value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} required />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">URL Imagen (WebP)</label>
                            <input type="text" placeholder="https://..." className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button type="submit" className="flex-1 bg-orange-600 py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-orange-500 transition-all active:scale-95">
                                {editingCard ? "Actualizar" : "Guardar Carta"}
                            </button>
                            {editingCard && (
                                <button type="button" onClick={cancelEdit} className="bg-slate-700 px-6 rounded-2xl hover:bg-slate-600 transition-all">✕</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- LISTADO DE CARTAS --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5 shadow-xl">
                        <button onClick={() => {setFormato("primer_bloque"); setFormData({...formData, format: "primer_bloque"});}} 
                                className={`flex-1 py-4 rounded-xl font-black uppercase text-xs transition-all ${formato === 'primer_bloque' ? 'bg-yellow-600 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            📜 Primer Bloque
                        </button>
                        <button onClick={() => {setFormato("imperio"); setFormData({...formData, format: "imperio"});}} 
                                className={`flex-1 py-4 rounded-xl font-black uppercase text-xs transition-all ${formato === 'imperio' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            🏛️ Imperio
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 animate-pulse">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Consultando la base de datos...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[75vh] p-2 custom-scrollbar pr-4">
                            {cartas.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-slate-600 italic">No se encontraron cartas en este formato.</div>
                            ) : cartas.map(c => (
                                <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden shadow-lg transition-all hover:border-orange-500/50">
                                    <img src={c.imgUrl || c.img} className="w-full h-auto rounded-xl shadow-md transition-transform group-hover:scale-105" alt={c.name} />
                                    <div className="mt-2 px-1">
                                        <p className="text-[10px] font-black truncate uppercase text-white">{c.name}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase">{c.edition || c.edition_slug}</p>
                                    </div>
                                    
                                    {/* Overlay de Acciones */}
                                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                        <button onClick={() => {
                                            setEditingCard(c);
                                            setFormData({
                                                ...c,
                                                edition: c.edition || c.edition_slug // Unificamos para el formulario
                                            });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }} className="w-24 bg-blue-600 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-blue-500">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(c._id)} className="w-24 bg-red-600 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-red-500">
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
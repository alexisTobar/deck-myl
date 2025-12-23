import { useState, useEffect } from "react";
import BACKEND_URL from "../config";

export default function AdminCards() {
    const [cartas, setCartas] = useState([]);
    const [formato, setFormato] = useState("primer_bloque");
    const [loading, setLoading] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const [formData, setFormData] = useState({
        name: "", edition: "", type: "Aliado", race: "", imgUrl: "", format: "primer_bloque", slug: ""
    });

    const token = localStorage.getItem("token");

    useEffect(() => { fetchCartas(); }, [formato]);

    const fetchCartas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/cards/search?format=${formato}`);
            const data = await res.json();
            setCartas(Array.isArray(data) ? data : data.results || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingCard ? "PUT" : "POST";
        const url = editingCard ? `${BACKEND_URL}/api/cards/${editingCard._id}` : `${BACKEND_URL}/api/cards`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setEditingCard(null);
                setFormData({ name: "", edition: "", type: "Aliado", race: "", imgUrl: "", format: formato, slug: "" });
                fetchCartas();
                alert("Operación exitosa");
            }
        } catch (e) { alert("Error"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar carta?")) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, { method: "DELETE", headers: { "auth-token": token } });
            if (res.ok) fetchCartas();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 pb-32">
            <h1 className="text-3xl font-black text-orange-500 uppercase italic mb-8 tracking-tighter">Gestión de Armería</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORMULARIO */}
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 h-fit sticky top-24 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 text-yellow-500 uppercase italic">
                        {editingCard ? "Modificar" : "Nueva Carta"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Nombre" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5 focus:border-orange-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Edición" className="w-full p-3 bg-slate-800 rounded-xl outline-none border border-white/5" value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value})} required />
                            <select className="w-full p-3 bg-slate-800 rounded-xl outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                                <option value="primer_bloque">PB</option>
                                <option value="imperio">Imperio</option>
                            </select>
                        </div>
                        <input type="text" placeholder="URL Imagen" className="w-full p-3 bg-slate-800 rounded-xl outline-none" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} required />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-orange-600 py-3 rounded-2xl font-black uppercase shadow-lg hover:bg-orange-500 transition-all">Guardar</button>
                            {editingCard && <button onClick={() => setEditingCard(null)} className="bg-slate-700 px-4 rounded-2xl">✕</button>}
                        </div>
                    </form>
                </div>

                {/* LISTADO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
                        <button onClick={() => setFormato("primer_bloque")} className={`flex-1 py-3 rounded-xl font-black uppercase text-xs transition-all ${formato === 'primer_bloque' ? 'bg-yellow-600 text-black shadow-lg' : 'text-slate-500'}`}>PB</button>
                        <button onClick={() => setFormato("imperio")} className={`flex-1 py-3 rounded-xl font-black uppercase text-xs transition-all ${formato === 'imperio' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500'}`}>Imperio</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[70vh] p-2 custom-scrollbar">
                        {cartas.map(c => (
                            <div key={c._id} className="bg-slate-900 p-2 rounded-2xl border border-white/5 group relative overflow-hidden">
                                <img src={c.imgUrl} className="w-full h-auto rounded-xl" alt={c.name} />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all">
                                    <button onClick={() => {setEditingCard(c); setFormData(c); window.scrollTo(0,0);}} className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Editar</button>
                                    <button onClick={() => handleDelete(c._id)} className="bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Borrar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
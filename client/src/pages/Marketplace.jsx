import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BACKEND_URL from "../config";
import { 
    ShoppingBag, Plus, X, Camera, MessageCircle, 
    Instagram, Search, Filter, ArrowRight, ShieldCheck, 
    Image as ImageIcon, Wallet, Phone, AlertCircle, Sword // ✅ Agregado Sword aquí
} from "lucide-react"; // ✅ Asegúrate que diga lucide-react y no lucide-center
import { toast } from "sonner";

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "", price: "", format: "imperio", 
        description: "", whatsapp: "", instagram: ""
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/marketplace/all`);
            const data = await res.json();
            setItems(data);
        } catch (e) { 
            console.error(e);
            toast.error("Error al conectar con el mercado"); 
        } finally { setLoading(false); }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            toast.error("Solo puedes subir un máximo de 3 fotos");
            return;
        }
        setSelectedFiles(files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return toast.error("¡Sube al menos una foto real del mazo!");
        if (!token) return toast.error("Debes iniciar sesión para publicar");

        setUploading(true);
        const data = new FormData();
        data.append("title", formData.title);
        data.append("price", formData.price);
        data.append("format", formData.format);
        data.append("description", formData.description);
        data.append("whatsapp", formData.whatsapp);
        data.append("instagram", formData.instagram);
        
        selectedFiles.forEach(file => data.append("images", file));

        try {
            const res = await fetch(`${BACKEND_URL}/api/marketplace/publish`, {
                method: "POST",
                headers: { "auth-token": token }, // ✅ El token es vital aquí
                body: data 
            });

            if (res.ok) {
                toast.success("¡Estrategia publicada con éxito! ⚔️");
                setShowModal(false);
                fetchItems();
                setFormData({ title: "", price: "", format: "imperio", description: "", whatsapp: "", instagram: "" });
                setSelectedFiles([]);
                setPreviews([]);
            } else {
                const errData = await res.json();
                toast.error(errData.error || "Error al publicar");
            }
        } catch (e) { 
            toast.error("Chuta, falló la conexión con el servidor");
        } finally { setUploading(false); }
    };

    const filteredItems = items.filter(i => filter === "all" || i.format === filter);

    return (
        <div className="min-h-screen bg-[#060912] text-white pb-32 font-sans selection:bg-blue-500/30">
            <div className="w-full bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 py-16 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-4 relative z-10">
                        Market<span className="text-blue-500">Place</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                        <ShieldCheck size={14} className="text-blue-500" /> Comercio Seguro de Invocadores
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                    <div className="flex bg-slate-900/80 p-1.5 rounded-[2rem] border border-white/5 w-full md:w-auto shadow-xl">
                        {["all", "imperio", "primer_bloque"].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                                {f === "all" ? "🌐 Todos" : f === "imperio" ? "🏛️ Imperio" : "📜 PB"}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={() => token ? setShowModal(true) : toast.error("Inicia sesión para vender")} className="group w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white rounded-[2rem] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                        <Plus size={24} strokeWidth={3} /> Publicar Mazo
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[1,2,3,4,5,6].map(n => <div key={n} className="h-[450px] bg-slate-900/50 animate-pulse rounded-[3rem] border border-white/5"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredItems.map(item => <MarketCard key={item._id} item={item} />)}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => !uploading && setShowModal(false)} className="absolute inset-0 bg-[#02040a]/95 backdrop-blur-md" />
                        <motion.div initial={{scale:0.9, opacity:0, y: 50}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.9, opacity:0, y: 50}} className="relative w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-10">
                                <div><h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Publicar <span className="text-blue-500">Mazo</span></h2></div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-4">Nombre de la Base</label>
                                    <div className="relative">
                                        <Sword className="absolute left-5 top-4.5 text-slate-600" size={20} />
                                        <input type="text" required className="w-full bg-black/40 border border-white/5 p-5 pl-14 rounded-3xl outline-none focus:border-blue-600 font-bold text-white" placeholder="Ej: Base Defensor Chileno 2026" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Precio (CLP)</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-5 top-4.5 text-slate-600" size={20} />
                                        <input type="number" required className="w-full bg-black/40 border border-white/5 p-5 pl-14 rounded-3xl outline-none" placeholder="45000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Formato</label>
                                    <div className="relative">
                                        <Filter className="absolute left-5 top-4.5 text-slate-600" size={20} />
                                        <select className="w-full bg-black/40 border border-white/5 p-5 pl-14 rounded-3xl outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                                            <option value="imperio">Imperio</option>
                                            <option value="primer_bloque">Primer Bloque</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-green-500 tracking-widest ml-4">WhatsApp (Sin +)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-4.5 text-slate-600" size={20} />
                                        <input type="text" required className="w-full bg-black/40 border border-white/5 p-5 pl-14 rounded-3xl outline-none" placeholder="56912345678" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-pink-500 tracking-widest ml-4">Instagram User</label>
                                    <div className="relative">
                                        <Instagram className="absolute left-5 top-4.5 text-slate-600" size={20} />
                                        <input type="text" required className="w-full bg-black/40 border border-white/5 p-5 pl-14 rounded-3xl outline-none" placeholder="@tu_usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Fotos Reales (Máximo 3)</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        <label className="aspect-square border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group">
                                            <Camera className="text-slate-600 group-hover:text-blue-500" size={32} />
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        {previews.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 relative">
                                                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2 pt-6">
                                    <button disabled={uploading} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase italic tracking-widest shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4 transition-all">
                                        {uploading ? "Inyectando..." : "Inyectar al Mercado"} <ArrowRight size={24} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MarketCard({ item }) {
    const message = `¡Hola! Vi tu mazo "${item.title}" en ForjaDeck Marketplace por $${item.price.toLocaleString()}. ¿Aún lo tienes disponible?`;
    const waLink = `https://wa.me/${item.whatsapp}?text=${encodeURIComponent(message)}`;
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
            <div className="h-72 relative overflow-hidden">
                <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                <div className="absolute top-6 left-6 px-5 py-2 bg-blue-600/90 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/10">{item.format === 'imperio' ? '🏛️ Imperio' : '📜 PB'}</div>
                {item.verifiedSeller && <div className="absolute top-6 right-6 bg-green-500 p-2 rounded-2xl shadow-lg border border-white/20"><ShieldCheck size={20} className="text-white" /></div>}
            </div>
            <div className="p-10">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 truncate text-white">{item.title}</h3>
                <p className="text-[10px] font-black uppercase text-blue-500 mb-4">@{item.seller?.username}</p>
                <div className="flex items-baseline gap-2 mb-8"><span className="text-4xl font-black text-white">${item.price.toLocaleString()}</span></div>
                <div className="grid grid-cols-2 gap-4">
                    <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95"><MessageCircle size={18} fill="currentColor" /> WhatsApp</a>
                    <a href={`https://instagram.com/${item.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95"><Instagram size={18} /> Instagram</a>
                </div>
            </div>
        </motion.div>
    );
}
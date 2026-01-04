import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BACKEND_URL from "../config";
import { 
    ShoppingBag, Plus, X, Camera, MessageCircle, 
    Instagram, Search, Filter, ArrowRight, ShieldCheck, 
    Image as ImageIcon, Wallet, Phone, AlertCircle, Sword,
    MapPin, Truck, Info, Heart, Calendar, User
} from "lucide-react"; 
import { toast } from "sonner";

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    
    // ✅ ESTADOS PARA DETALLES Y ZOOM
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [formData, setFormData] = useState({
        title: "", price: "", format: "imperio", 
        description: "", whatsapp: "", instagram: "",
        location: "", deliveryPoint: "", condition: "Usado"
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // ✅ OBTENER TOKEN PARA VALIDACIÓN DE SESIÓN
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

    // ✅ FUNCIÓN PARA VALIDAR LOGIN ANTES DE MOSTRAR FORMULARIO
    const handleOpenPublishModal = () => {
        if (!token) {
            return toast.error("¡Acceso Denegado!", {
                description: "Debes iniciar sesión para publicar en el mercado.",
                icon: <AlertCircle className="text-red-500" />
            });
        }
        setShowModal(true);
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
        if (!token) return toast.error("Debes iniciar sesión para publicar");
        if (selectedFiles.length === 0) return toast.error("¡Sube al menos una foto real del mazo!");

        setUploading(true);
        const data = new FormData();
        data.append("title", formData.title);
        data.append("price", formData.price);
        data.append("format", formData.format);
        data.append("description", formData.description);
        data.append("whatsapp", formData.whatsapp);
        data.append("instagram", formData.instagram);
        data.append("location", formData.location);
        data.append("deliveryPoint", formData.deliveryPoint);
        data.append("condition", formData.condition);
        
        selectedFiles.forEach(file => data.append("images", file));

        try {
            const res = await fetch(`${BACKEND_URL}/api/marketplace/publish`, {
                method: "POST",
                headers: { "auth-token": token },
                body: data 
            });

            if (res.ok) {
                toast.success("¡Estrategia publicada con éxito! ⚔️");
                setShowModal(false);
                fetchItems();
                setFormData({ title: "", price: "", format: "imperio", description: "", whatsapp: "", instagram: "", location: "", deliveryPoint: "", condition: "Usado" });
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#060912] text-slate-900 dark:text-white pb-32 font-sans transition-colors duration-500 selection:bg-blue-500/30">
            
            {/* --- HEADER --- */}
            <div className="w-full bg-white dark:bg-slate-900/40 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 py-16 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-4 relative z-10 text-slate-900 dark:text-white">
                        Market<span className="text-blue-500">Place</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                        <ShieldCheck size={14} className="text-blue-500" /> Comercio Seguro de Invocadores
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
                {/* --- FILTROS Y BOTÓN --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                    <div className="flex bg-white dark:bg-slate-900/80 p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/5 w-full md:w-auto shadow-xl">
                        {["all", "imperio", "primer_bloque"].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-4 md:px-8 py-3 rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600 dark:hover:text-white'}`}>
                                {f === "all" ? "🌐 Todos" : f === "imperio" ? "🏛️ Imperio" : "📜 PB"}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={handleOpenPublishModal} className="group w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white rounded-[2rem] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                        <Plus size={24} strokeWidth={3} /> Publicar Mazo
                    </button>
                </div>

                {/* --- LISTADO (2 Columnas en móvil) --- */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
                        {[1,2,3,4,5,6].map(n => <div key={n} className="h-[350px] md:h-[450px] bg-slate-200 dark:bg-slate-900/50 animate-pulse rounded-[3rem] border border-slate-300 dark:border-white/5"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                        {filteredItems.map(item => <MarketCard key={item._id} item={item} onOpen={setSelectedItem} />)}
                    </div>
                )}
            </div>

            {/* --- MODAL PUBLICAR --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => !uploading && setShowModal(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-[#02040a]/95 backdrop-blur-md" />
                        <motion.div initial={{scale:0.9, opacity:0, y: 50}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.9, opacity:0, y: 50}} className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[3.5rem] p-8 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-10">
                                <div><h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Publicar <span className="text-blue-500">Mazo</span></h2></div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-900 dark:text-white">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-4">Nombre de la Base</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold" placeholder="Ej: Base Defensor Chileno" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Precio (CLP)</label>
                                    <input type="number" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold" placeholder="45000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Estado del Mazo</label>
                                    <select className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold appearance-none" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                                        <option value="Nuevo">Impecable / NM</option>
                                        <option value="Usado">Usado / Jugado</option>
                                        <option value="Colección">Colección / Sellado</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-4">Comuna / Ciudad</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold" placeholder="Ej: Maipú" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest ml-4">Lugar de Entrega</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold" placeholder="Ej: Metro Moneda" value={formData.deliveryPoint} onChange={e => setFormData({...formData, deliveryPoint: e.target.value})} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Descripción del Mazo</label>
                                    <textarea className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-blue-600 font-bold h-32" placeholder="Describe qué incluye el mazo..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-green-600 tracking-widest ml-4">WhatsApp (Sin +)</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-green-600 font-bold" placeholder="56912345678" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-pink-600 tracking-widest ml-4">Instagram User</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 rounded-3xl outline-none focus:border-pink-600 font-bold" placeholder="@tu_usuario" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Fotos Reales (Máximo 3)</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        <label className="aspect-square border-2 border-dashed border-slate-300 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all group">
                                            <Camera className="text-slate-400 group-hover:text-blue-500" size={32} />
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        {previews.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10">
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

            {/* ✅ MODAL DETALLES DEL PRODUCTO */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
                        <motion.div initial={{y: 100, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 100, opacity: 0}} className="relative w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row max-h-[90vh]">
                            {/* GALERIA */}
                            <div className="flex-1 bg-black p-4 flex items-center justify-center relative min-h-[300px]">
                                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 md:top-6 md:left-6 z-10 p-3 md:p-4 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all"><X size={24} /></button>
                                <img src={selectedItem.images[0]} className="max-w-full max-h-full object-contain rounded-2xl cursor-zoom-in" onClick={() => setSelectedImage(selectedItem.images[0])} />
                            </div>
                            {/* INFO */}
                            <div className="w-full md:w-[450px] p-6 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="flex gap-2 mb-4 md:mb-6">
                                    <span className="px-3 md:px-4 py-1.5 bg-blue-600 rounded-full text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest">{selectedItem.format.replace('_',' ')}</span>
                                    <span className="px-3 md:px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">{selectedItem.condition}</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2 leading-none">{selectedItem.title}</h2>
                                <p className="text-xl md:text-3xl font-black text-blue-500 mb-6 md:mb-8">${new Intl.NumberFormat('es-CL').format(selectedItem.price)}</p>
                                
                                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-4"><MapPin className="text-blue-500" size={24}/> <div><p className="text-[10px] font-black uppercase text-slate-400">Comuna</p><p className="font-bold text-sm md:text-base">{selectedItem.location}</p></div></div>
                                    <div className="flex items-center gap-4"><Truck className="text-blue-500" size={24}/> <div><p className="text-[10px] font-black uppercase text-slate-400">Entrega / Envío</p><p className="font-bold text-sm md:text-base">{selectedItem.deliveryPoint}</p></div></div>
                                    <div className="flex items-start gap-4"><Info className="text-blue-500" size={24}/> <div><p className="text-[10px] font-black uppercase text-slate-400">Descripción</p><p className="font-medium text-xs md:text-sm leading-relaxed">{selectedItem.description || "Sin descripción."}</p></div></div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><User size={14}/> Vendedor: @{selectedItem.seller?.username}</p>
                                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                                        <a href={`https://wa.me/${selectedItem.whatsapp}`} target="_blank" className="w-full py-4 md:py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl md:rounded-3xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl text-xs md:text-sm"><MessageCircle size={20}/> WhatsApp</a>
                                        <a href={`https://instagram.com/${selectedItem.instagram?.replace('@','')}`} target="_blank" className="w-full py-4 md:py-5 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white rounded-2xl md:rounded-3xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all text-xs md:text-sm"><Instagram size={20}/> Instagram</a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ZOOM LIGHTBOX */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/95" />
                        <motion.img initial={{scale:0.8}} animate={{scale:1}} src={selectedImage} className="relative max-w-full max-h-full rounded-xl z-[510] shadow-2xl" />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MarketCard({ item, onOpen }) {
    const formattedPrice = new Intl.NumberFormat('es-CL').format(item.price);
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            onClick={() => onOpen(item)}
            className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-2xl flex flex-col h-full cursor-pointer hover:translate-y-[-8px]"
        >
            <div className="h-44 md:h-72 relative overflow-hidden">
                <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0"><Search className="text-white" size={24} /></div>
                </div>
                {/* ✅ ETIQUETA DE FORMATO RESTAURADA */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-[7px] md:text-[9px] font-black uppercase text-white shadow-xl z-10">
                    {item.format === 'imperio' ? '🏛️ Imperio' : '📜 PB'}
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[6px] md:text-[8px] font-black uppercase text-white border border-white/10 z-10">
                    {item.condition || "Usado"}
                </div>
            </div>
            
            <div className="p-4 md:p-8 flex flex-col flex-grow">
                <div className="mb-3 md:mb-4">
                    <h3 className="text-xs md:text-2xl font-black uppercase italic tracking-tighter truncate text-slate-900 dark:text-white leading-tight">{item.title}</h3>
                    <p className="text-blue-500 font-black text-sm md:text-3xl mt-1">${formattedPrice}</p>
                </div>

                {/* ✅ COMUNA Y ENTREGA AHORA VISIBLES EN TARJETA */}
                <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 border-l-2 border-blue-500/20 pl-3 md:pl-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span className="text-[8px] md:text-[11px] font-bold uppercase truncate">{item.location || "Por definir"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Truck size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[8px] md:text-[11px] font-bold uppercase truncate">{item.deliveryPoint || "Ver detalles"}</span>
                    </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[8px] md:text-[10px] font-black text-blue-500 shrink-0">@</div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 truncate max-w-[60px] md:max-w-[100px]">@{item.seller?.username}</span>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                        <div className="p-1.5 md:p-2 bg-green-500/10 text-green-500 rounded-lg"><MessageCircle size={14}/></div>
                        <div className="p-1.5 md:p-2 bg-pink-500/10 text-pink-500 rounded-lg"><Instagram size={14}/></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
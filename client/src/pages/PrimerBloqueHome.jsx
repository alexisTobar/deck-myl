import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Animaciones
import { X, Star, Hammer, Users, Scale, Trophy, Sword, PlayCircle } from "lucide-react";

export default function PrimerBloqueHome() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060912] text-white font-sans overflow-x-hidden selection:bg-yellow-500">
            
            {/* 🐉 DRAGÓN DE PB CON ANIMACIÓN DE RESPIRACIÓN */}
            <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
            >
                <img src="https://cdn.jsdelivr.net/gh/alexisTobar/cartas-pb-webp/es43.webp" className="w-full h-full object-cover opacity-20" alt="" />
            </motion.div>

            {/* HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-yellow-500/10">
                <div className="relative z-10 text-center px-4 max-w-6xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex justify-center gap-2 mb-6"
                    >
                        <Star size={24} fill="#eab308" className="text-yellow-500 animate-pulse" />
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-7xl md:text-[11rem] font-black text-white mb-6 uppercase tracking-tighter italic leading-none drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                    >
                        PRIMER BLOQUE
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-3xl text-slate-400 mb-12 max-w-3xl mx-auto italic font-light leading-relaxed"
                    >
                        "Donde la leyenda comenzó." Revive el formato que forjó a los mejores gladiadores.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <button onClick={() => setShowModal(true)} className="group relative px-14 py-6 bg-yellow-600 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(202,138,4,0.2)] overflow-hidden">
                            <span className="relative z-10 font-black uppercase italic text-2xl flex items-center gap-3 text-black">
                                <Sword size={26} /> Entrar a la Forja
                            </span>
                        </button>
                        <Link to="/community" className="px-14 py-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl font-black transition-all hover:bg-yellow-500/10 flex items-center justify-center gap-3 uppercase italic text-2xl text-slate-200">
                            <Users size={26} /> Explorar Arena
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* 📡 CRONISTAS PB CON SCROLL STAGGER */}
            <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
                <motion.h2 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl font-black uppercase italic tracking-tighter mb-16"
                >
                    Cronistas del <span className="text-yellow-500">Primer Bloque</span>
                </motion.h2>

                <motion.div 
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <PBCard name="Coliseo Mitero" link="https://www.youtube.com/@coliseomitero" />
                    <PBCard name="Elevadoh" link="https://www.youtube.com/@elevadoh" />
                    <PBCard name="Dragon Dorado" link="https://www.youtube.com/@DragonDoradoMyL" />
                    <PBCard name="WarningDeck" link="#" isOfficial />
                </motion.div>
            </section>

            {/* 📚 RECURSOS */}
            <section className="bg-slate-950/50 py-32 border-y border-yellow-500/10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ResourceCard title="Banlist PB" icon={<Trophy />} link="https://blog.myl.cl/banlist-racial-edicion-primer-bloque" />
                    <ResourceCard title="DAR Clásico" icon={<Scale />} link="https://drive.google.com/drive/folders/10vEUxzriV4C8BE5H7A9F8uTnuTelF3Lc" />
                    <ResourceCard title="Historias" icon={<Users />} link="https://blog.myl.cl/" />
                </div>
            </section>

            {/* MODAL ANIMADO CON ANIMEPRESENCE */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
                    >
                        {/* Contenido del modal igual pero con motion.div para el contenedor central */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PBCard({ name, link, isOfficial }) {
    return (
        <motion.a 
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            href={link} target="_blank"
            className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-yellow-500 transition-colors flex flex-col items-center text-center group"
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isOfficial ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>
                <PlayCircle size={28} />
            </div>
            <h4 className="text-xl font-black uppercase italic">{name}</h4>
        </motion.a>
    );
}

function ResourceCard({ title, icon, link }) {
    return (
        <motion.a 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
            href={link} target="_blank"
            className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-yellow-500 transition-all text-center group"
        >
            <div className="text-yellow-500 mb-6 flex justify-center group-hover:rotate-12 transition-transform">{icon}</div>
            <h4 className="text-2xl font-black uppercase italic">{title}</h4>
        </motion.a>
    );
}
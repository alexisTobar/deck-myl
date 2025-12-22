import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    // Solo necesitamos saber si está logueado para mostrar el botón correcto en el Hero (Portada)
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">

            {/* --- SECCIÓN 1: HERO (Portada) --- */}
            <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                {/* Fondo con imagen oscurecida */}
                <div className="absolute inset-0 bg-[url('https://api.myl.cl/static/cards/162/001.png')] bg-cover bg-center opacity-30 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-lg mb-6">
                        El Reino te Espera
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light">
                        Domina la estrategia, conoce la historia y construye el mazo definitivo en el mejor portal de Mitos y Leyendas.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Lógica de botones: Si no está logueado -> Registrarse. Si está -> Ir a Comunidad */}
                        {!isLoggedIn ? (
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105 text-lg"
                            >
                                ⚔️ ¡Únete a la Batalla!
                            </Link>
                        ) : (
                            <Link
                                to="/community"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105 text-lg"
                            >
                                🌍 Ver Comunidad
                            </Link>
                        )}

                        <Link
                            to="/builder"
                            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105 text-lg border border-slate-500"
                        >
                            🛠️ Crear Mazo
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: REGLAS Y DESCARGAS --- */}
            <div className="py-20 bg-slate-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-orange-500">📜 Documentos Sagrados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition group text-center">
                            <div className="text-5xl mb-4">⚖️</div>
                            <h3 className="text-xl font-bold mb-2">DAR Actualizado</h3>
                            <p className="text-slate-400 text-sm mb-6">Documento de Arbitraje y Reglas oficial para torneos.</p>
                            <a href="https://drive.google.com/file/d/1T73XocxDyUqiVQ_LD4I7dlfdUE1Tg9W_/view" className="text-orange-400 font-bold hover:underline">Descargar PDF →</a>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition group text-center">
                            <div className="text-5xl mb-4">❓</div>
                            <h3 className="text-xl font-bold mb-2">Preguntas Frecuentes</h3>
                            <p className="text-slate-400 text-sm mb-6">Respuestas oficiales a las dudas más complejas del juego.</p>
                            <a href="https://drive.google.com/drive/folders/1i1y725whp728kCk92_Y01_ngB1ZS4EYM?usp=drive_link" className="text-orange-400 font-bold hover:underline">Leer FAQ →</a>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-orange-500 transition group text-center">
                            <div className="text-5xl mb-4">📖</div>
                            <h3 className="text-xl font-bold mb-2">Lista de Cartas Baneadas</h3>
                            <p className="text-slate-400 text-sm mb-6">Conoce qué cartas están restringidas en el formato Imperio.</p>
                            <a href="https://blog.myl.cl/banlists-actualizadas/" className="text-orange-400 font-bold hover:underline">Banlist Imperio →</a>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 3: CREADORES DE CONTENIDO --- */}
            <div className="py-20 bg-slate-900 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-center mb-4 text-white">🎥 Creadores de la Comunidad</h2>
                    <p className="text-center text-slate-400 mb-12">Apoya a quienes mantienen viva la leyenda.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CreatorCard
                            name="Sombra y Oscuridad"
                            platform="YouTube"
                            image="https://yt3.googleusercontent.com/Ju206vax7ca6jntDBJC1Ve4E5QmmWjWmLETU1d_i5VClS7K0GYPWSrnpEb3zzp28CfFrxk6DHA=s120-c-k-c0x00ffffff-no-rj"
                            link="https://www.youtube.com/@Sombras_y_Oscuridad"
                        />
                        <CreatorCard
                            name="La Taberna de MyL"
                            platform="Twitch"
                            image="https://placehold.co/150"
                            link="https://twitch.tv"
                        />
                        <CreatorCard
                            name="Estrategia TCG"
                            platform="Instagram"
                            image="https://placehold.co/150"
                            link="https://instagram.com"
                        />
                        <CreatorCard
                            name="Gladiador Legendario"
                            platform="YouTube"
                            image="https://placehold.co/150"
                            link="https://youtube.com"
                        />
                    </div>
                </div>
            </div>

            <footer className="bg-slate-950 py-8 text-center text-slate-500 text-sm border-t border-slate-800">
                <p>© 2025 Deck-MyL. Hecho por fans para fans.</p>
            </footer>
        </div>
    );
}

// Componente pequeño para las tarjetas de creadores
function CreatorCard({ name, platform, image, link }) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-700 transition hover:shadow-lg border border-transparent hover:border-slate-600 group">
            <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-orange-500" />
            <div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition">{name}</h4>
                <span className="text-xs text-slate-400 uppercase tracking-wide">{platform}</span>
            </div>
        </a>
    );
}

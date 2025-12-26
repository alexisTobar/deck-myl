import { useNavigate } from "react-router-dom";

export default function HomePortal() {
    const navigate = useNavigate();

    return (
        /* Se añade pb-32 en móvil para que el Dock no tape el contenido e items-start en móvil para mejor scroll */
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-start md:justify-center relative overflow-x-hidden font-sans pt-12 pb-36 md:pb-12">
            
            {/* Fondo decorativo */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600 rounded-full blur-[120px]"></div>
            </div>

            {/* Título Principal - Ajustado tamaño para móvil */}
            <div className="relative z-10 text-center mb-10 md:mb-16 animate-fade-in px-4">
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 uppercase">
                    Warning<span className="text-orange-500">Deck</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-2xl font-light tracking-widest uppercase">
                    Selecciona tu Era de Batalla
                </p>
            </div>

            {/* Contenedor de Opciones - Stack vertical en móvil, horizontal en escritorio */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-6xl px-6 relative z-10">
                
                {/* OPCIÓN PRIMER BLOQUE */}
                <div 
                    onClick={() => navigate("/primer-bloque")}
                    className="flex-1 group cursor-pointer relative overflow-hidden rounded-3xl border-2 border-slate-800 hover:border-yellow-500 transition-all duration-500 bg-slate-900/50 backdrop-blur-sm shadow-2xl"
                >
                    <div className="h-44 md:h-64 overflow-hidden relative">
                        <img 
                            src="https://los40.cl/resizer/v2/RGW3O7B6EBMJTOG3663Q63HYUM.jpg?auth=c2cc267add0246b4d52e7e6ba39dac28c0c11ebe4c806e386358c4a65968d094&quality=70&width=1200&height=544&smart=true" 
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" 
                            alt="Primer Bloque"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
                    </div>
                    <div className="p-6 md:p-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-yellow-500 transition-colors uppercase">📜 Primer Bloque</h2>
                        <p className="text-slate-400 text-xs md:text-sm mb-6">El origen de la leyenda. Formato clásico con Caballeros, Dragones y Sombras.</p>
                        <span className="inline-block bg-yellow-600 text-white px-8 py-3 rounded-full font-bold group-hover:bg-yellow-500 transition-all shadow-lg text-sm uppercase">
                            INGRESAR
                        </span>
                    </div>
                </div>

                {/* OPCIÓN IMPERIO */}
                <div 
                    onClick={() => navigate("/imperio")}
                    className="flex-1 group cursor-pointer relative overflow-hidden rounded-3xl border-2 border-slate-800 hover:border-orange-500 transition-all duration-500 bg-slate-900/50 backdrop-blur-sm shadow-2xl"
                >
                    <div className="h-44 md:h-64 overflow-hidden relative">
                        <img 
                            src="https://cdn.shopify.com/s/files/1/0103/3601/0303/files/bannerpreventakvm_177c3b4b-7d62-4fd8-8f0a-fa243f85e590.jpg?v=1761336400" 
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" 
                            alt="Imperio"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
                    </div>
                    <div className="p-6 md:p-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors uppercase">🏛️ Imperio</h2>
                        <p className="text-slate-400 text-xs md:text-sm mb-6">Metajuego actual, nuevas mecánicas y el circuito competitivo oficial.</p>
                        <span className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-bold group-hover:bg-orange-500 transition-all shadow-lg text-sm uppercase">
                            INGRESAR
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function Logo({ className = "w-8 h-8", showText = true }) {
    return (
        // El contenedor hereda el tamaño (w-8 h-8, etc) que le pasamos desde fuera
        <div className={`flex items-center gap-2 ${className}`}>
            
            {/* Aquí cargamos tu imagen PNG desde la carpeta public */}
            <img 
                src="/logo.png" 
                alt="Deck-MyL Logo" 
                className="h-full w-auto object-contain drop-shadow-md" 
            />
            
            {/* Texto Opcional (si quieres que diga Deck-MyL al lado) */}
            {showText && (
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 tracking-tight whitespace-nowrap">
                    Deck-MyL
                </span>
            )}
        </div>
    );
}
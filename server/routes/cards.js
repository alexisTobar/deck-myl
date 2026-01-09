const router = require('express').Router();
const Card = require('../models/Card');

// RUTA DE BÚSQUEDA AVANZADA
// Soporta: ?q=texto & edition=slug & type=Aliado & format=primer_bloque & race=Dragón
router.get('/search', async (req, res) => {
    try {
        const { q, edition, type, format, race, showInHome } = req.query;

        let query = {};

        // --- 0. FILTRO DE FORMATO ---
        // Por defecto imperio si no se especifica
        query.format = format || 'imperio';

        // --- 1. FILTRO POR RAZA ---
        // Vital para Primer Bloque e Imperio. Case-insensitive
        if (race) {
            query.race = { $regex: new RegExp(`^${race}$`, "i") };
        }

        // --- 2. Filtro por Texto (Nombre) ---
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        // --- 3. Filtro por Edición ---
        if (edition && edition !== 'all') {
            if (query.format === 'primer_bloque') {
                query.edition = edition; 
            } else {
                query.edition_slug = edition; 
            }
        }

        // --- 4. Filtro por Tipo (Híbrido: Reparado para MongoDB) ---
        if (type) {
            const isNumber = !isNaN(type);
            if (isNumber) {
                // ✅ REPARACIÓN: Buscamos tanto el String "1" como el Número 1
                // Esto soluciona que Imperio no muestre nada al filtrar
                query.$or = [
                    { type: type.toString() },
                    { type: parseInt(type) }
                ];
            } else {
                query.type = type;
            }
        }

        // ✅ FILTRO PARA EL DASHBOARD ADMIN (Ver qué cartas están en Home)
        if (showInHome !== undefined) {
            query.showInHome = showInHome === 'true';
        }

        // --- 5. VALIDACIÓN DE FILTROS ---
        if (!q && !edition && !type && !race && showInHome === undefined) {
            return res.json([]);
        }

        // Límite dinámico para no saturar la conexión
        const limit = (edition || type || race) ? 1000 : 100;

        // Ejecución de la consulta
        const cards = await Card.find(query).limit(limit).lean();

        res.json(cards);

    } catch (error) {
        console.error("Error en search cards:", error);
        res.status(500).json({ error: 'Error buscando cartas en la base de datos' });
    }
});

// ✅ NUEVA RUTA: OBTENER ESPECÍFICAMENTE LAS CARTAS MARCADAS PARA EL CARRUSEL DEL HOME
router.get('/home-carousel', async (req, res) => {
    try {
        // Buscamos solo las cartas que el Admin marcó con showInHome: true
        // Las ordenamos por actualización para que las últimas marcadas salgan primero
        const carouselCards = await Card.find({ showInHome: true })
            .sort({ updatedAt: -1 })
            .lean();
            
        res.json(carouselCards);
    } catch (error) {
        console.error("Error en home-carousel route:", error);
        res.status(500).json({ error: "Error al obtener cartas del carrusel" });
    }
});

// ✅ NUEVA RUTA: OBTENER LAS ÚLTIMAS CARTAS AGREGADAS (Para el carrusel del Home)
router.get('/latest', async (req, res) => {
    try {
        const { format } = req.query;
        const filter = format ? { format } : {};
        
        // Buscamos las últimas 10 cartas creadas por el admin
        const latestCards = await Card.find(filter)
            .sort({ _id: -1 }) 
            .limit(10)
            .lean();
            
        res.json(latestCards);
    } catch (error) {
        console.error("Error en latest cards:", error);
        res.status(500).json({ error: "Error al obtener cartas recientes" });
    }
});

// ✅ RUTAS ADMINISTRATIVAS MANTENIDAS (POST, PUT, DELETE)
router.post('/', async (req, res) => {
    try {
        const newCard = new Card(req.body);
        const savedCard = await newCard.save();
        res.status(201).json(savedCard);
    } catch (err) {
        res.status(500).json({ error: "Error al crear carta" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        // req.body ahora incluirá automáticamente showInHome si viene del admin mejorado
        const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCard);
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Card.findByIdAndDelete(req.params.id);
        res.json({ msg: "Carta eliminada" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

module.exports = router;
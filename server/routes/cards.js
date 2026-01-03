const router = require('express').Router();
const Card = require('../models/Card');
const axios = require('axios'); // ✅ Asegúrate de tenerlo instalado: npm install axios

// ✅ NUEVA RUTA: SINCRONIZAR RAZAS SOLO PARA IMPERIO
// Esta ruta busca tus cartas de imperio y les pone la raza desde la API de MyL
router.get('/sync-imperio-races', async (req, res) => {
    try {
        // Buscamos solo Aliados (type 1) de Imperio en TU base de datos
        const imperioCards = await Card.find({ format: 'imperio', type: 1 });
        
        let actualizadas = 0;
        let saltadas = 0;

        console.log(`Iniciando sincronización de ${imperioCards.length} cartas...`);

        for (const card of imperioCards) {
            try {
                // Consultamos a MyL por el nombre de la carta
                const response = await axios.get(`https://api.myl.cl/cards/search/${encodeURIComponent(card.name)}`);
                
                if (response.data && response.data.results) {
                    // Buscamos la coincidencia exacta
                    const mylCard = response.data.results.find(c => 
                        c.name.toLowerCase().trim() === card.name.toLowerCase().trim()
                    );

                    if (mylCard && mylCard.race) {
                        await Card.findByIdAndUpdate(card._id, { race: mylCard.race });
                        actualizadas++;
                    } else {
                        saltadas++;
                    }
                }
            } catch (err) {
                console.error(`Error con: ${card.name}`);
            }
        }

        res.json({ 
            msg: "Sincronización de Imperio completa", 
            procesadas: imperioCards.length, 
            actualizadas, 
            sin_cambios: saltadas 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTA DE BÚSQUEDA AVANZADA (MANTENIDA Y OPTIMIZADA)
router.get('/search', async (req, res) => {
    try {
        const { q, edition, type, format, race } = req.query;
        let query = {};

        // Por defecto imperio si no se especifica
        query.format = format || 'imperio';

        // Filtro por Raza
        if (race) {
            query.race = { $regex: new RegExp(`^${race}$`, "i") };
        }

        // Filtro por Texto (Nombre)
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        // Filtro por Edición
        if (edition && edition !== 'all') {
            if (query.format === 'primer_bloque') {
                query.edition = edition; 
            } else {
                query.edition_slug = edition; 
            }
        }

        // Filtro por Tipo
        if (type) {
            const isNumber = !isNaN(type);
            if (isNumber) {
                query.type = parseInt(type);
            } else {
                query.type = type;
            }
        }

        if (!q && !edition && !type && !race) {
            return res.json([]);
        }

        const limit = (edition || type || race) ? 1000 : 100;
        const cards = await Card.find(query).limit(limit).lean();

        res.json(cards);

    } catch (error) {
        console.error("Error en search cards:", error);
        res.status(500).json({ error: 'Error buscando cartas en la base de datos' });
    }
});

// RUTAS ADMINISTRATIVAS
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
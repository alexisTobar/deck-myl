const router = require('express').Router();
const Card = require('../models/Card');

// RUTA DE BÚSQUEDA AVANZADA
// Soporta: ?q=texto & edition=slug & type=1 (número)
router.get('/search', async (req, res) => {
    try {
        const { q, edition, type } = req.query;

        let query = {};

        // 1. Filtro por Texto (Nombre)
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        // 2. Filtro por Edición
        if (edition) {
            query.edition_slug = edition;
        }

        // 3. CORREGIDO: Filtro por Tipo (Numérico)
        if (type) {
            // Convertimos el string "1" que viene de la URL a número real 1
            query.type = parseInt(type);
        }

        // Si no hay filtros, devolvemos vacío para no saturar
        if (!q && !edition && !type) {
            return res.json([]);
        }

        // Límite dinámico
        const limit = (edition || type) ? 1000 : 100;

        const cards = await Card.find(query).limit(limit);

        res.json(cards);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error buscando cartas' });
    }
});

module.exports = router;
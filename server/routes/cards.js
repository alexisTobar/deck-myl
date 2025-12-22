const router = require('express').Router();
const Card = require('../models/Card');

// RUTA DE BÚSQUEDA AVANZADA
// Soporta: ?q=texto & edition=slug & type=1 (o "Aliado") & format=primer_bloque
router.get('/search', async (req, res) => {
    try {
        const { q, edition, type, format } = req.query;

        let query = {};

        // --- 0. FILTRO DE FORMATO (NUEVO) ---
        // Si no especifican formato, buscamos solo en Imperio (para compatibilidad)
        // Si especifican 'primer_bloque', buscamos ahí.
        query.format = format || 'imperio';

        // --- 1. Filtro por Texto (Nombre) ---
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        // --- 2. Filtro por Edición ---
        // En PB la edición se guarda en 'edition', en Imperio en 'edition_slug'
        // El script de migración guardó la edición en 'edition', así que hacemos esto:
        if (edition) {
            if (query.format === 'primer_bloque') {
                query.edition = edition; // Busca en el campo 'edition'
            } else {
                query.edition_slug = edition; // Busca en el campo antiguo
            }
        }

        // --- 3. Filtro por Tipo (Híbrido: Número o Texto) ---
        if (type) {
            const isNumber = !isNaN(type);
            
            if (isNumber) {
                // Es Imperio (usa IDs numéricos: 1, 2, 3...)
                query.type = parseInt(type);
            } else {
                // Es Primer Bloque (usa Strings: "Aliado", "Oro", etc.)
                query.type = type;
            }
        }

        // Si no hay filtros (salvo el formato por defecto), devolvemos vacío
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
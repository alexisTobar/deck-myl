const router = require('express').Router();
const Card = require('../models/Card');

// RUTA DE BÚSQUEDA AVANZADA
// Soporta: ?q=texto & edition=slug & type=Aliado & format=primer_bloque & race=Dragón
router.get('/search', async (req, res) => {
    try {
        const { q, edition, type, format, race } = req.query;

        let query = {};

        // --- 0. FILTRO DE FORMATO ---
        // Por defecto imperio si no se especifica
        query.format = format || 'imperio';

        // --- 1. FILTRO POR RAZA (NUEVO) ---
        // Vital para Primer Bloque. Se busca de forma exacta (case-insensitive)
        if (race) {
            query.race = { $regex: new RegExp(`^${race}$`, "i") };
        }

        // --- 2. Filtro por Texto (Nombre) ---
        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        // --- 3. Filtro por Edición ---
        if (edition) {
            if (query.format === 'primer_bloque') {
                query.edition = edition; 
            } else {
                query.edition_slug = edition; 
            }
        }

        // --- 4. Filtro por Tipo (Híbrido: Número o Texto) ---
        if (type) {
            const isNumber = !isNaN(type);
            if (isNumber) {
                query.type = parseInt(type);
            } else {
                query.type = type;
            }
        }

        // --- 5. VALIDACIÓN DE FILTROS ---
        // ✅ MEJORA: Ahora permitimos que la búsqueda funcione si existe AL MENOS un criterio,
        // incluyendo la nueva variable 'race'.
        if (!q && !edition && !type && !race) {
            return res.json([]);
        }

        // Límite dinámico para no saturar la conexión
        // Si hay filtros específicos (edición, tipo o raza) aumentamos el límite
        const limit = (edition || type || race) ? 1000 : 100;

        // Ejecución de la consulta
        const cards = await Card.find(query).limit(limit).lean();

        res.json(cards);

    } catch (error) {
        console.error("Error en search cards:", error);
        res.status(500).json({ error: 'Error buscando cartas en la base de datos' });
    }
});

module.exports = router;
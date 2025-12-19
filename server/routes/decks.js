const router = require('express').Router();
const Deck = require('../models/Deck'); 
const verifyToken = require('../middleware/verifyToken');

// ==========================================
//  RUTAS DE COMUNIDAD (PÚBLICAS O SOCIALES)
// ==========================================

// 1. OBTENER MAZOS DE LA COMUNIDAD (GET)
// Nota: Esta ruta va ANTES de /:id para evitar conflictos
router.get('/community/all', async (req, res) => {
    try {
        // ¿Queremos solo los Top 3? (viene en la url: ?top=true)
        const isTop = req.query.top === 'true';

        // Buscamos solo los que sean públicos (isPublic: true)
        // .populate('user', 'name') sirve para traer el nombre del creador en vez de solo su ID
        let query = Deck.find({ isPublic: true }).populate('user', 'name');

        if (isTop) {
            // Traemos todos los públicos y los ordenamos por cantidad de likes (Mayor a menor)
            const allPublic = await query;
            const top3 = allPublic
                .sort((a, b) => b.likes.length - a.likes.length)
                .slice(0, 3);
            
            return res.json(top3);
        } else {
            // Si no es top, traemos los más recientes primero
            query = query.sort({ createdAt: -1 });
            const decks = await query;
            res.json(decks);
        }
    } catch (error) {
        console.error("Error cargando comunidad:", error);
        res.status(500).json({ error: "Error al cargar mazos de la comunidad" });
    }
});

// ==========================================
//  RUTAS DE GESTIÓN (PRIVADAS - REQUIEREN TOKEN)
// ==========================================

// 2. OBTENER MIS MAZOS (GET)
router.get('/my-decks', verifyToken, async (req, res) => {
    try {
        const decks = await Deck.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(decks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo tus mazos" });
    }
});

// 3. GUARDAR UN MAZO NUEVO (POST)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, cards } = req.body;

        if (!name || !cards || cards.length === 0) {
            return res.status(400).json({ error: "El mazo debe tener nombre y cartas" });
        }

        // Formateamos las cartas para asegurar que guardamos la imagen y datos clave
        const formattedCards = cards.map(c => ({
            cardId: c._id || c.cardId,
            quantity: c.cantidad || c.quantity || 1, // Aseguramos que sea al menos 1
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl || c.imageUrl || c.img // Guardamos la URL segura
        }));

        const newDeck = new Deck({
            user: req.user.id,
            name: name,
            cards: formattedCards,
            isPublic: false, // Por defecto nacen privados
            likes: []
        });

        const savedDeck = await newDeck.save();
        res.status(201).json(savedDeck);

    } catch (error) {
        console.error("Error al guardar mazo:", error);
        res.status(500).json({ error: "No se pudo guardar el mazo" });
    }
});

// 4. ACTUALIZAR PRIVACIDAD (PÚBLICO / PRIVADO) (PUT)
router.put('/privacy/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        
        if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

        // Verificamos que seas el dueño
        if (deck.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'No tienes permiso para editar este mazo' });
        }

        // Invertimos el valor (Si es true pasa a false, si es false pasa a true)
        deck.isPublic = !deck.isPublic;
        
        await deck.save();
        res.json(deck);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cambiar privacidad' });
    }
});

// 5. DAR O QUITAR LIKE (PUT)
router.put('/like/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

        // Lógica de Toggle (Si ya está, lo quita. Si no está, lo pone)
        if (deck.likes.includes(req.user.id)) {
            // Quitar like (filtrar el array para sacar mi ID)
            deck.likes = deck.likes.filter(id => id.toString() !== req.user.id);
        } else {
            // Dar like
            deck.likes.push(req.user.id);
        }

        await deck.save();
        res.json(deck.likes); // Devolvemos solo el array de likes actualizado
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al dar like' });
    }
});

// 6. ACTUALIZAR CONTENIDO DEL MAZO (PUT)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, cards } = req.body;

        const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id });
        if (!deck) return res.status(404).json({ error: "Mazo no encontrado o no autorizado" });

        const formattedCards = cards.map(c => ({
            cardId: c.cardId || c._id,
            quantity: c.quantity || c.cantidad,
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl || c.imageUrl || c.img
        }));

        deck.name = name;
        deck.cards = formattedCards;

        await deck.save();
        res.json(deck);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el mazo" });
    }
});

// 7. ELIMINAR UN MAZO (DELETE)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id });

        if (!deck) {
            return res.status(404).json({ error: "Mazo no encontrado o no te pertenece" });
        }

        await Deck.findByIdAndDelete(req.params.id);
        res.json({ message: "Mazo eliminado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el mazo" });
    }
});

module.exports = router;
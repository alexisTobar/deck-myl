const router = require('express').Router();
const Deck = require('../models/Deck');
const User = require('../models/User'); // Importante para obtener el nick del autor del comentario
const verifyToken = require('../middleware/verifyToken');

// ==========================================
//  RUTAS DE COMUNIDAD (PÚBLICAS O SOCIALES)
// ==========================================

// 1. OBTENER MAZOS DE LA COMUNIDAD (GET)
router.get('/community/all', async (req, res) => {
    try {
        const isTop = req.query.top === 'true';

        // ✅ MEJORA: .populate('user', 'username') para traer el nick
        let query = Deck.find({ isPublic: true }).populate('user', 'username');

        if (isTop) {
            const allPublic = await query;
            const top3 = allPublic
                .sort((a, b) => (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0))
                .slice(0, 3);

            return res.json(top3);
        } else {
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
        const { name, cards, format, isPublic } = req.body;

        if (!name || !cards || cards.length === 0) {
            return res.status(400).json({ error: "El mazo debe tener nombre y cartas" });
        }

        const formattedCards = cards.map(c => ({
            cardId: c._id || c.cardId,
            quantity: c.cantidad || c.quantity || 1,
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl || c.imageUrl || c.img
        }));

        const newDeck = new Deck({
            user: req.user.id,
            name: name,
            cards: formattedCards,
            format: format || 'imperio',
            isPublic: isPublic || false,
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

        if (deck.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        deck.isPublic = !deck.isPublic;
        await deck.save();
        res.json(deck);
    } catch (err) {
        res.status(500).json({ error: 'Error al cambiar privacidad' });
    }
});

// 5. DAR O QUITAR LIKE (PUT)
router.put('/like/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

        if (deck.likes.includes(req.user.id)) {
            deck.likes = deck.likes.filter(id => id.toString() !== req.user.id);
        } else {
            deck.likes.push(req.user.id);
        }

        await deck.save();
        res.json(deck.likes);
    } catch (err) {
        res.status(500).json({ error: 'Error al dar like' });
    }
});

// 6. ACTUALIZAR CONTENIDO DEL MAZO (PUT)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, cards, format, isPublic } = req.body;

        const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id });
        if (!deck) return res.status(404).json({ error: "No encontrado" });

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
        if (format) deck.format = format;
        if (isPublic !== undefined) deck.isPublic = isPublic;

        await deck.save();
        res.json(deck);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// 7. ELIMINAR UN MAZO (DELETE)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id });
        if (!deck) return res.status(404).json({ error: "No autorizado" });

        await Deck.findByIdAndDelete(req.params.id);
        res.json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

// ==========================================
// ✅ NUEVAS RUTAS: COMENTARIOS Y ESTADÍSTICAS
// ==========================================

// 8. AGREGAR UN COMENTARIO
router.post('/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const deck = await Deck.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!deck) return res.status(404).json({ error: "Mazo no encontrado" });

        const newComment = {
            userId: user._id,
            username: user.username,
            text: text,
            createdAt: new Date()
        };

        deck.comments.push(newComment);
        await deck.save();

        // Retornamos el mazo actualizado con el nick del dueño para el modal
        const updatedDeck = await Deck.findById(req.params.id).populate('user', 'username');
        res.json(updatedDeck);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al agregar comentario" });
    }
});

// 9. ELIMINAR UN COMENTARIO (SOLO ADMIN)
router.delete('/:id/comment/:commentId', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) return res.status(404).json({ error: "Mazo no encontrado" });

        deck.comments = deck.comments.filter(c => c._id.toString() !== req.params.commentId);
        await deck.save();

        const updatedDeck = await Deck.findById(req.params.id).populate('user', 'username');
        res.json(updatedDeck);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar comentario" });
    }
});

// 10. META REPORT: CARTAS MÁS POPULARES
router.get('/stats/meta', async (req, res) => {
    try {
        // Obtenemos todos los mazos guardados en la base de datos
        const allDecks = await Deck.find();
        const cardUsage = {};

        allDecks.forEach(deck => {
            deck.cards.forEach(card => {
                const key = card.slug || card.name;
                if (cardUsage[key]) {
                    cardUsage[key].usageCount += (card.quantity || 1);
                } else {
                    cardUsage[key] = {
                        name: card.name,
                        imgUrl: card.imgUrl || card.img,
                        format: deck.format,
                        usageCount: card.quantity || 1
                    };
                }
            });
        });

        // Convertimos el objeto en array y ordenamos por las más usadas
        const sortedMeta = Object.values(cardUsage)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 15); // Top 15 cartas

        res.json(sortedMeta);
    } catch (error) {
        console.error("Error en Meta Report:", error);
        res.status(500).json({ error: "Error al calcular estadísticas" });
    }
});

module.exports = router;
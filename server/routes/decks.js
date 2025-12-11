const router = require('express').Router();
const Deck = require('../models/Deck'); // <--- Esto importa el archivo de arriba
const verifyToken = require('../middleware/verifyToken');

// 1. GUARDAR UN MAZO NUEVO (POST)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, cards } = req.body;

        if (!name || !cards || cards.length === 0) {
            return res.status(400).json({ error: "El mazo debe tener nombre y cartas" });
        }

        // Formateamos las cartas
        const formattedCards = cards.map(c => ({
            cardId: c._id || c.cardId,
            quantity: c.cantidad || c.quantity,
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl
        }));

        // AQUI FALLABA ANTES: Ahora Deck es un modelo de Mongoose, funcionará bien.
        const newDeck = new Deck({
            user: req.user.id,
            name: name,
            cards: formattedCards
        });

        const savedDeck = await newDeck.save();
        res.status(201).json(savedDeck);

    } catch (error) {
        console.error("Error al guardar mazo:", error);
        res.status(500).json({ error: "No se pudo guardar el mazo" });
    }
});

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

// 3. ACTUALIZAR UN MAZO (PUT)
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
            imgUrl: c.imgUrl
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

// 4. ELIMINAR UN MAZO (DELETE)
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
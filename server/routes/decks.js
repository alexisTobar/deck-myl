const router = require('express').Router();
const Deck = require('../models/Deck');
const User = require('../models/User'); 
const verifyToken = require('../middleware/verifyToken');

// ==========================================
//  RUTAS DE COMUNIDAD (PÚBLICAS O SOCIALES)
// ==========================================

// 1. OBTENER MAZOS DE LA COMUNIDAD (GET)
router.get('/community/all', async (req, res) => {
    try {
        const isTop = req.query.top === 'true';
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
        const { name, cards, format, isPublic, race } = req.body; 

        if (!name || !cards || cards.length === 0) {
            return res.status(400).json({ error: "El mazo debe tener nombre y cartas" });
        }

        const formattedCards = cards.map(c => ({
            cardId: c._id || c.cardId,
            quantity: c.cantidad || c.quantity || 1,
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl || c.imageUrl || c.img,
            race: c.race 
        }));

        const newDeck = new Deck({
            user: req.user.id,
            name: name,
            cards: formattedCards,
            format: format || 'imperio',
            race: race || 'Híbrido',
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

// 4. ACTUALIZAR PRIVACIDAD (PUT)
router.put('/privacy/:id', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });
        if (deck.user.toString() !== req.user.id) return res.status(401).json({ error: 'No autorizado' });
        deck.isPublic = !deck.isPublic;
        await deck.save();
        res.json(deck);
    } catch (err) { res.status(500).json({ error: 'Error al cambiar privacidad' }); }
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
    } catch (err) { res.status(500).json({ error: 'Error al dar like' }); }
});

// 6. ACTUALIZAR CONTENIDO DEL MAZO (PUT)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, cards, format, isPublic, race } = req.body;
        const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id });
        if (!deck) return res.status(404).json({ error: "No encontrado" });

        const formattedCards = cards.map(c => ({
            cardId: c.cardId || c._id,
            quantity: c.quantity || c.cantidad,
            name: c.name,
            slug: c.slug,
            type: c.type,
            imgUrl: c.imgUrl || c.imageUrl || c.img,
            race: c.race
        }));

        deck.name = name;
        deck.cards = formattedCards;
        if (format) deck.format = format;
        if (race) deck.race = race; 
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
    } catch (error) { res.status(500).json({ error: "Error al eliminar" }); }
});

// ==========================================
//  RUTAS DE COMENTARIOS
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
        const updatedDeck = await Deck.findById(req.params.id).populate('user', 'username');
        res.json(updatedDeck);
    } catch (error) { res.status(500).json({ error: "Error al agregar comentario" }); }
});

// 9. ELIMINAR UN COMENTARIO
router.delete('/:id/comment/:commentId', verifyToken, async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) return res.status(404).json({ error: "Mazo no encontrado" });
        deck.comments = deck.comments.filter(c => c._id.toString() !== req.params.commentId);
        await deck.save();
        const updatedDeck = await Deck.findById(req.params.id).populate('user', 'username');
        res.json(updatedDeck);
    } catch (error) { res.status(500).json({ error: "Error al eliminar comentario" }); }
});

// ==========================================
//  ESTADÍSTICAS Y TIER LIST REAL
// ==========================================

// 10. META REPORT: CARTAS MÁS USADAS + PROMEDIO DE COPIAS
router.get('/stats/meta', async (req, res) => {
    try {
        const { format } = req.query; 
        const queryFilter = format ? { format: format } : {};
        const allDecks = await Deck.find(queryFilter);
        const cardUsage = {};

        allDecks.forEach(deck => {
            let deckRace = deck.race || "Híbrido";

            deck.cards.forEach(card => {
                const key = card.slug || card.name;
                if (!cardUsage[key]) {
                    cardUsage[key] = {
                        name: card.name,
                        imgUrl: card.imgUrl || card.img,
                        format: deck.format,
                        usageCount: 0, // En cuántos mazos diferentes aparece
                        totalCopies: 0, // Acumulado de copias de esta carta
                        races: {},
                        featuredDecks: [] 
                    };
                }
                cardUsage[key].usageCount += 1;
                cardUsage[key].totalCopies += (card.quantity || 1); // Suma las copias (1, 2 o 3)
                cardUsage[key].races[deckRace] = (cardUsage[key].races[deckRace] || 0) + 1;

                const alreadyAdded = cardUsage[key].featuredDecks.some(d => d._id.toString() === deck._id.toString());
                if (cardUsage[key].featuredDecks.length < 5 && !alreadyAdded) {
                    cardUsage[key].featuredDecks.push({
                        _id: deck._id,
                        name: deck.name,
                        isPublic: deck.isPublic
                    });
                }
            });
        });

        // Calculamos el promedio y formateamos la salida
        const sortedMeta = Object.values(cardUsage)
            .map(item => ({
                ...item,
                avgCopies: item.usageCount > 0 ? (item.totalCopies / item.usageCount).toFixed(1) : 0
            }))
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10);

        res.json(sortedMeta);
    } catch (error) {
        console.error("Error meta report:", error);
        res.status(500).json({ error: "Error al calcular meta report" });
    }
});

// 11. TIER LIST RACIAL BASADA EN DATOS REALES
router.get('/stats/tier-list', async (req, res) => {
    try {
        const { format } = req.query; 
        const query = format ? { format } : {};
        
        const allDecks = await Deck.find(query);
        const raceCounts = {};

        allDecks.forEach(deck => {
            const race = deck.race || "Híbrido";
            if (race !== "Sin Raza") {
                raceCounts[race] = (raceCounts[race] || 0) + 1;
            }
        });

        const totalDecks = allDecks.length;
        
        const sortedTierList = Object.entries(raceCounts)
            .map(([name, count]) => ({
                name,
                power: totalDecks > 0 ? `${Math.round((count / totalDecks) * 100)}%` : "0%",
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        res.json(sortedTierList);
    } catch (error) {
        console.error("Error tier list real:", error);
        res.status(500).json({ error: "Error al calcular Tier List real" });
    }
});

module.exports = router;
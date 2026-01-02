const router = require('express').Router();
const CommunityLink = require('../models/CommunityLink');

// Obtener todos los links para la Home
router.get('/', async (req, res) => {
    try {
        const links = await CommunityLink.find().sort({ createdAt: -1 });
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener links" });
    }
});

// Guardar un nuevo link (El que viene del formulario de la Home)
router.post('/', async (req, res) => {
    try {
        const { name, instagram, logo } = req.body;
        if (!name || !instagram) return res.status(400).json({ msg: "Faltan datos clave" });

        const newLink = new CommunityLink({ name, instagram, logo });
        await newLink.save();
        res.status(201).json(newLink);
    } catch (err) {
        res.status(500).json({ error: "Error al guardar el link" });
    }
});

module.exports = router;
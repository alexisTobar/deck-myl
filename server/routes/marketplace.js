const router = require('express').Router();
const Marketplace = require('../models/Marketplace');
const verifyToken = require('../middleware/verifyToken'); // Asegúrate de que este middleware exista
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ RUTA PARA PUBLICAR (Sube hasta 3 fotos a Cloudinary)
router.post('/publish', verifyToken, upload.array('images', 3), async (req, res) => {
    try {
        const { title, format, price, description, whatsapp, instagram } = req.body;
        
        // req.files contiene las fotos ya subidas a Cloudinary por Multer
        const imageUrls = req.files.map(file => file.path);

        const newSale = new Marketplace({
            seller: req.user.id, // Viene del token verificado
            title,
            format,
            price,
            description,
            images: imageUrls,
            whatsapp,
            instagram
        });

        await newSale.save();
        res.json({ msg: "Mazo inyectado al mercado con éxito!", mazo: newSale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al publicar el mazo" });
    }
});

// ✅ RUTA PARA VER TODO EL MERCADO
router.get('/all', async (req, res) => {
    try {
        const items = await Marketplace.find({ active: true })
            .populate('seller', 'username') // Trae el nombre del vendedor
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar el mercado" });
    }
});

module.exports = router;
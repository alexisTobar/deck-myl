const router = require('express').Router();
const Marketplace = require('../models/Marketplace');
const verifyToken = require('../middleware/verifyToken'); // Asegúrate de que este middleware exista
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ RUTA PARA PUBLICAR REPARADA (Sube hasta 3 fotos a Cloudinary + Nuevos Campos)
router.post('/publish', verifyToken, upload.array('images', 3), async (req, res) => {
    try {
        // ✅ MEJORA: Extraemos los nuevos campos del cuerpo de la petición
        const { 
            title, 
            format, 
            price, 
            description, 
            whatsapp, 
            instagram,
            location, 
            deliveryPoint, 
            condition 
        } = req.body;
        
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
            instagram,
            // ✅ ASIGNACIÓN DE NUEVOS CAMPOS A LA BASE DE DATOS
            location: location || "", 
            deliveryPoint: deliveryPoint || "",
            condition: condition || "Usado"
        });

        await newSale.save();
        res.json({ msg: "Mazo inyectado al mercado con éxito!", mazo: newSale });
    } catch (error) {
        console.error("Error al publicar:", error);
        res.status(500).json({ error: "Error al publicar el mazo" });
    }
});

// ✅ RUTA PARA VER TODO EL MERCADO (Incluye active: true)
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

// ✅ NUEVA RUTA: BORRAR PUBLICACIÓN (Funcionando para el Dashboard)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const item = await Marketplace.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ msg: "La publicación no existe" });
        }

        // Aquí borramos físicamente el registro de la base de datos
        await Marketplace.findByIdAndDelete(req.params.id);
        
        res.json({ msg: "Publicación eliminada correctamente por la administración" });
    } catch (error) {
        console.error("Error al borrar item del market:", error);
        res.status(500).json({ error: "Error interno al intentar eliminar" });
    }
});

module.exports = router;
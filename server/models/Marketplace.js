const mongoose = require('mongoose');

const MarketplaceSchema = new mongoose.Schema({
    // --- DATOS DEL VENDEDOR ---
    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    whatsapp: { 
        type: String, 
        required: true 
    },
    instagram: { 
        type: String, 
        required: true 
    },
    verifiedSeller: { 
        type: Boolean, 
        default: false 
    },

    // --- DATOS DEL PRODUCTO ---
    title: { 
        type: String, 
        required: true 
    },
    format: { 
        type: String, 
        enum: ['imperio', 'primer_bloque'], 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    images: [{ 
        type: String 
    }], // URLs de Cloudinary

    // ✅ NUEVOS CAMPOS AGREGADOS PARA SEGURIDAD Y UBICACIÓN
    location: { 
        type: String, 
        default: "" // Aquí se guarda la Comuna
    },
    deliveryPoint: { 
        type: String, 
        default: "" // Aquí se guarda el Lugar de entrega (ej: Metro)
    },
    condition: { 
        type: String, 
        enum: ['Nuevo', 'Usado', 'Colección'], 
        default: 'Usado' 
    },

    // --- ESTADO Y TIEMPO ---
    active: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true }); // Agrega automáticamente updatedAt y createdAt manejados por Mongoose

// Índices para mejorar la velocidad de respuesta al filtrar en el Market
MarketplaceSchema.index({ format: 1, active: 1 });
MarketplaceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Marketplace', MarketplaceSchema);
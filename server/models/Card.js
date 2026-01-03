const mongoose = require('mongoose');

const GlobalCardSchema = new mongoose.Schema({
    slug: { type: String, unique: true }, 
    name: { type: String, required: true, index: true },
    type: { type: mongoose.Schema.Types.Mixed }, // ✅ Esto permite "1" o "Aliado"
    imgUrl: { type: String }, 
    edition: { type: String }, 
    restriction: { 
        type: String, 
        enum: ['unrestricted', 'limited1', 'limited2', 'banned'], 
        default: 'unrestricted',
        index: true 
    },
    main_edition: { type: String, default: "" }, 
    format: { 
        type: String, 
        enum: ['imperio', 'primer_bloque'], 
        default: 'imperio',
        index: true 
    },
    race: { type: String, index: true }, // ✅ Índice simple para filtrar rápido
    cost: { type: Number },     
    strength: { type: Number }, 
    ability: { type: String },  
    edition_slug: { type: String, index: true }, // ✅ Vital para Imperio
    rarity: String
}, { timestamps: true });

// Índice de texto para el buscador "Búsqueda Global"
GlobalCardSchema.index({ name: 'text' });

module.exports = mongoose.model('Card', GlobalCardSchema);
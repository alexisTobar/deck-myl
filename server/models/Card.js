const mongoose = require('mongoose');

const GlobalCardSchema = new mongoose.Schema({
    // --- CAMPOS COMUNES ---
    slug: { type: String, unique: true }, // ID único (Ej: 'es559' o 'espada-sagrada-1')
    name: { type: String, required: true, index: true },
    type: { type: String }, // Aliado, Talisman, etc.
    imgUrl: { type: String }, // URL final de la imagen (Cloudinary o local)
    edition: { type: String }, // Nombre humano de la edición (Ej: "Espada Sagrada")

    // --- CAMPOS NUEVOS (PRIMER BLOQUE / GENERAL) ---
    format: { 
        type: String, 
        enum: ['imperio', 'primer_bloque'], 
        default: 'imperio',
        index: true // Vital para filtrar rápido
    },
    race: { type: String },     // Raza (Ej: Caballero, Dragón)
    cost: { type: Number },     // Coste
    strength: { type: Number }, // Fuerza
    ability: { type: String },  // Habilidad (Texto)

    // --- CAMPOS ESPECÍFICOS DE IMPERIO (LEGACY) ---
    // Mantenemos esto para que no falle tu base de datos actual
    edition_slug: String, 
    ed_edid: String,      
    edid: String,       
    rarity: String

}, { timestamps: true });

// Índices para búsqueda ultra rápida
GlobalCardSchema.index({ name: 'text' });
GlobalCardSchema.index({ format: 1 }); 

module.exports = mongoose.model('Card', GlobalCardSchema);
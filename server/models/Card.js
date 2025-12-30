const mongoose = require('mongoose');

const GlobalCardSchema = new mongoose.Schema({
    // --- CAMPOS COMUNES ---
    slug: { type: String, unique: true }, 
    name: { type: String, required: true, index: true },
    type: { type: String }, 
    imgUrl: { type: String }, 
    edition: { type: String }, 

    // --- CAMPO DE RESTRICCIONES DAR ---
    // ✅ AGREGADO: Esto permitirá que el Backend guarde el baneo o limitación
    restriction: { 
        type: String, 
        enum: ['unrestricted', 'limited1', 'limited2', 'banned'], 
        default: 'unrestricted',
        index: true 
    },

    // --- CAMPO PARA AGRUPACIÓN DE EDICIONES ---
    main_edition: { type: String, default: "" }, 

    // --- CAMPOS NUEVOS (PRIMER BLOQUE / GENERAL) ---
    format: { 
        type: String, 
        enum: ['imperio', 'primer_bloque'], 
        default: 'imperio',
        index: true 
    },
    race: { type: String },     
    cost: { type: Number },     
    strength: { type: Number }, 
    ability: { type: String },  

    // --- CAMPOS ESPECÍFICOS DE IMPERIO ---
    edition_slug: String, 
    ed_edid: String,      
    edid: String,       
    rarity: String

}, { timestamps: true });

// Índices para búsqueda ultra rápida
GlobalCardSchema.index({ name: 'text' });
GlobalCardSchema.index({ format: 1 }); 
GlobalCardSchema.index({ main_edition: 1 }); 
// ✅ Nuevo índice para filtrar cartas baneadas o limitadas rápido
GlobalCardSchema.index({ restriction: 1 }); 

module.exports = mongoose.model('Card', GlobalCardSchema);
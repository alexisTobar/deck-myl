const mongoose = require('mongoose');

const GlobalCardSchema = new mongoose.Schema({
    // --- CAMPOS COMUNES ---
    slug: { type: String, unique: true }, 
    name: { type: String, required: true, index: true },
    
    // ✅ MEJORA: Cambiado a Mixed para que acepte tanto "1" (Imperio) como "Aliado" (PB)
    type: { type: mongoose.Schema.Types.Mixed }, 
    
    imgUrl: { type: String }, 
    edition: { type: String }, 

    // --- CAMPO DE RESTRICCIONES DAR ---
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
    
    // El campo race ya existe, lo mantenemos igual
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
GlobalCardSchema.index({ restriction: 1 }); 
// ✅ AGREGADO: Índice para filtrar por raza rápidamente ya que lo usaremos mucho
GlobalCardSchema.index({ race: 1 }); 

module.exports = mongoose.model('Card', GlobalCardSchema);
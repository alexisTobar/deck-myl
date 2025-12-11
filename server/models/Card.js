const mongoose = require('mongoose');

const GlobalCardSchema = new mongoose.Schema({
    slug: { type: String, unique: true }, // Identificador único
    name: { type: String, required: true, index: true }, // Indexado para buscar rápido
    edition_slug: String, // De qué edición vino (ej: "libertadores")
    ed_edid: String,      // ID Edición (para la imagen)
    edid: String,         // ID Carta (para la imagen)
    imgUrl: String,       // La URL ya construida
    rarity: String,
    type: String
});

// Este índice nos permitirá buscar por nombre ultra rápido
GlobalCardSchema.index({ name: 'text' });

module.exports = mongoose.model('Card', GlobalCardSchema);
const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    slug: String,
    name: String,
    imgUrl: String, // La imagen segura que arreglamos
    imageUrl: String,
    img: String,
    quantity: { type: Number, default: 1 },
    type: String,
    cost: Number,
    // ... otros campos que uses
});

const DeckSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cards: [CardSchema],
    
    // --- NUEVOS CAMPOS PARA LA COMUNIDAD ---
    isPublic: {
        type: Boolean,
        default: false // Por defecto son privados
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Guardamos la ID de quien dio like para que no repita
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Deck', DeckSchema);
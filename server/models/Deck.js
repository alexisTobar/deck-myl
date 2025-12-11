const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
    // VINCULACIÓN CON EL USUARIO
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // Array de cartas
    cards: [
        {
            cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
            quantity: { type: Number, required: true },
            name: String,
            slug: String,
            // IMPORTANTE: Definimos 'type' como objeto para evitar conflicto con palabra reservada
            type: { type: String },
            imgUrl: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Deck', DeckSchema);
const mongoose = require('mongoose');

// Esquema para los comentarios individualmente
const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: String, // Guardamos el nombre para no hacer populate pesado
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CardSchema = new mongoose.Schema({
    slug: String,
    name: String,
    imgUrl: String,
    imageUrl: String,
    img: String,
    quantity: { type: Number, default: 1 },
    type: String,
    cost: Number,
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
    format: {
        type: String,
        required: true,
        enum: ['imperio', 'primer_bloque'],
        default: 'imperio'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // ✅ NUEVO: Array de comentarios vinculados al mazo
    comments: [CommentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Deck', DeckSchema);
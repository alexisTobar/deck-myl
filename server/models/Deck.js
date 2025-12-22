const mongoose = require('mongoose');

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
    
    // ✅ ESTO ES LO QUE HACE QUE SE SEPAREN EN LA DB
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Deck', DeckSchema);
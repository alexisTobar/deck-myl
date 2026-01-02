const mongoose = require('mongoose');

const MarketplaceSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    format: { type: String, enum: ['imperio', 'primer_bloque'], required: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }], // Aquí se guardan los links que genera Cloudinary
    whatsapp: { type: String, required: true },
    instagram: { type: String, required: true },
    verifiedSeller: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Marketplace', MarketplaceSchema);
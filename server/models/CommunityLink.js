const mongoose = require('mongoose');

const CommunityLinkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    instagram: { type: String, required: true },
    logo: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityLink', CommunityLinkSchema);
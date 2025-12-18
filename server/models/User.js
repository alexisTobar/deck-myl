const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // ⚠️ ELIMINAMOS 'minlength: 6' AQUÍ
        // Esto permite que la contraseña sea vacía "" para usuarios de Google
    },
    googleId: { type: String },
    age: { type: Number },
    cl: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
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
        // IMPORTANTE: Quitamos 'required: true' para permitir usuarios de Google
        minlength: 6
    },
    googleId: {
        type: String // Para identificar usuarios que vienen de Google
    },
    age: {
        type: Number // Para el dato extra que pediremos
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);

module.exports = mongoose.model('User', UserSchema);
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
        // Mantener sin minlength para compatibilidad con usuarios de Google
    },
    googleId: { type: String },
    age: { type: Number },
    cl: { type: String },
    
    // ✅ NUEVOS CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
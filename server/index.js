require('dotenv').config(); // ✅ DEBE SER LA LÍNEA 1 PARA CARGAR TODO ANTES
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const decksRoute = require('./routes/decks');

const app = express();

// --- CONFIGURACIÓN DE PUERTO ---
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARES ---
// ✅ MEJORA DEFINITIVA PARA CORS: Acepta localhost y cualquier rama de Vercel
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://deck-myl.vercel.app",
    "https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origin (como Postman o apps móviles)
        if (!origin) return callback(null, true);
        
        // Si el origin está en la lista o termina en .vercel.app, permitir
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'] 
}));

app.use(express.json());

// --- SERVIR IMÁGENES ESTÁTICAS ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- RUTAS API ---
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/decks', decksRoute);

// Ruta de prueba base
app.get('/', (req, res) => {
    res.send('Servidor Deck-MyL funcionando correctamente 🚀');
});

// --- CONEXIÓN A BASE DE DATOS ---
mongoose.set('strictQuery', false);

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('🔴 ERROR: La variable MONGO_URI no está definida');
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log('🟢 Base de Datos Conectada (Atlas)'))
        .catch(err => console.log('🔴 Error al conectar BD:', err));
}

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
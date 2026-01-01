require('dotenv').config(); // ✅ LÍNEA 1: Carga variables antes que nada
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
// Render usa process.env.PORT, en local usará 4000
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARES ---
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://deck-myl.vercel.app",
    "https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app" // Tu URL actual de Vercel
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origin (como Postman o apps móviles)
        if (!origin) return callback(null, true);
        
        // ✅ MEJORA: Permite orígenes exactos o cualquier subdominio de vercel.app
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

// Ruta de prueba base (Health Check)
app.get('/', (req, res) => {
    res.send('Servidor Deck-MyL funcionando correctamente 🚀');
});

// --- CONEXIÓN A BASE DE DATOS ---
mongoose.set('strictQuery', false);

// Verificación de MONGO_URI para evitar errores undefined
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('🔴 ERROR: La variable MONGO_URI no está definida en el entorno.');
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log('🟢 Base de Datos Conectada (Atlas)'))
        .catch(err => console.log('🔴 Error al conectar BD:', err));
}

// --- INICIAR SERVIDOR ---
// En producción (Render), es importante escuchar en '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
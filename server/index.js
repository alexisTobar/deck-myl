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
app.use(cors({
    origin: [
        "http://localhost:5173",       // Frontend Local 1
        "http://localhost:5174",       // Frontend Local 2
        "http://localhost:3000",      
        "https://deck-myl.vercel.app", // Producción Vercel
        "https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app" 
    ],
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

// ✅ Verificación de seguridad para la URI
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('🔴 ERROR: La variable MONGO_URI no está definida en el archivo .env');
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log('🟢 Base de Datos Conectada (Atlas)'))
        .catch(err => console.log('🔴 Error al conectar BD:', err));
}

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
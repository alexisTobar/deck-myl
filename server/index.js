const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const decksRoute = require('./routes/decks');

const app = express();

// --- CONFIGURACIÓN DE PUERTO ---
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARES (Aquí está el cambio clave) ---
// Configuración explícita para evitar errores de Google/Vercel
// --- MIDDLEWARES ---
app.use(cors({
    origin: [
        "http://localhost:5173",             
        "https://deck-myl.vercel.app"        // Tu URL de Vercel
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // 👇 AQUÍ ESTÁ LA MAGIA: Agregamos 'auth-token' a la lista permitida
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'] 
}));

app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/decks', decksRoute);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor Deck-MyL funcionando correctamente 🚀');
});

// --- CONEXIÓN A BASE DE DATOS ---
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Base de Datos Conectada'))
    .catch(err => console.log('🔴 Error al conectar BD:', err));

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
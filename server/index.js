// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const decksRoute = require('./routes/decks');

const app = express();

// --- CONFIGURACIÓN DE PUERTO (CLAVE PARA RENDER) ---
// Render nos asigna un puerto en process.env.PORT
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARES ---
app.use(cors()); // Permitir conexiones desde Vercel
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
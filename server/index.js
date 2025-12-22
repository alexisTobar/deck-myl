const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ◄--- IMPORTANTE: Necesario para rutas de archivos
require('dotenv').config();

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
        "http://localhost:5173",      // Tu Frontend Local (Vite)
        "http://localhost:3000",      // Por si usas Create React App
        "https://deck-myl.vercel.app" // Tu Frontend en Producción
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'] 
}));

app.use(express.json());

// 👇👇👇 AQUÍ ESTÁ LA MAGIA PARA LAS IMÁGENES 👇👇👇
// Esto le dice al servidor: "Cuando pidan algo que empiece con /uploads, 
// busca el archivo en la carpeta física 'uploads' de este proyecto".
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
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Base de Datos Conectada'))
    .catch(err => console.log('🔴 Error al conectar BD:', err));

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
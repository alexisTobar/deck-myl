require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const decksRoute = require('./routes/decks');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CONFIGURACIÓN CORS PARA VERCEL
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://deck-myl.vercel.app",
    "https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error('CORS Error'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'] 
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/decks', decksRoute);

app.get('/', (req, res) => res.send('Servidor Deck-MyL listo 🚀'));

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 Base de Datos Conectada'))
    .catch(err => console.error('🔴 Error BD:', err));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});
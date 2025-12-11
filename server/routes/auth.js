const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";

// 1. REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // Verificar si el email ya existe
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).json({ error: "El email ya está registrado" });

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario creado exitosamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        // Crear Token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' } // El token dura 7 días
        );

        // Enviamos el token y datos básicos al frontend
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
});

module.exports = router;
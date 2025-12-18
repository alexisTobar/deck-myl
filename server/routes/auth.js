const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); // Importamos librería Google

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";

// ⚠️ REEMPLAZA ESTO CON TU CLIENT ID DE GOOGLE REAL (El mismo del Frontend)
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// 1. REGISTRO NORMAL (Tu código original intacto)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).json({ error: "El email ya está registrado" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
});

// 2. LOGIN NORMAL (Tu código original intacto)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email o contraseña incorrectos" });
        
        // Si el usuario es de Google, no tiene password, hay que evitar que explote bcrypt
        if (!user.password) return res.status(400).json({ error: "Este usuario debe iniciar sesión con Google" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
});

// --- NUEVAS RUTAS DE GOOGLE ---

// 3. VERIFICAR USUARIO GOOGLE
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Verificar token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "PEGA_AQUI_TU_CLIENT_ID_LARGO" // ⚠️ El mismo ID otra vez
        });
        const { email, sub: googleId } = ticket.getPayload();

        // Buscar si existe
        let user = await User.findOne({ email });

        if (user) {
            // USUARIO YA EXISTE -> Login directo
            const appToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token: appToken, isNew: false, user });
        } else {
            // USUARIO NO EXISTE -> Avisar al frontend para pedir datos extra
            res.json({ isNew: true, email, googleId });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error autenticando con Google" });
    }
});

// 4. REGISTRO FINAL CON GOOGLE (Usuario + Edad)
router.post('/google-register', async (req, res) => {
    const { email, googleId, username, age } = req.body;

    try {
        // Validar username único
        let userCheck = await User.findOne({ username });
        if (userCheck) return res.status(400).json({ msg: 'El nombre de usuario ya está ocupado' });

        // Crear usuario sin contraseña
        const newUser = new User({
            email,
            googleId,
            username,
            age,
            password: "" // Se guarda vacío
        });

        await newUser.save();

        // Login automático
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar usuario de Google" });
    }
});

module.exports = router;
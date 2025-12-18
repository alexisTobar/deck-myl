const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); 

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";

// ⚠️ ID REAL DE GOOGLE (Extraído de tus logs)
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// ==========================================
// 1. REGISTRO NORMAL (Email y Contraseña)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // VALIDACIÓN IMPORTANTE: Como quitamos el 'minlength' del Modelo para Google,
        // debemos validar manualmente aquí que la contraseña normal sea segura.
        if (password.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
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

// ==========================================
// 2. LOGIN NORMAL
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        // SEGURIDAD: Si el usuario es de Google, no tiene password guardada.
        // Bloqueamos el intento para que no falle bcrypt.
        if (!user.password) {
            return res.status(400).json({ error: "Este usuario se registró con Google. Usa el botón de Google." });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        // Crear Token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' } 
        );

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

// ==========================================
// 3. VERIFICAR USUARIO GOOGLE (Paso 1 del Login)
// ==========================================
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Verificar token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com"
        });
        const { email, sub: googleId } = ticket.getPayload();

        // Buscar si existe en nuestra BD
        let user = await User.findOne({ email });

        if (user) {
            // USUARIO YA EXISTE -> Login directo
            const appToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token: appToken, isNew: false, user });
        } else {
            // USUARIO NO EXISTE -> Avisar al frontend para pedir datos extra (Nick, Edad, CL)
            res.json({ isNew: true, email, googleId });
        }
    } catch (err) {
        console.error("Error Google Verify:", err);
        res.status(500).json({ error: "Error autenticando con Google" });
    }
});

// ==========================================
// 4. REGISTRO FINAL CON GOOGLE (Paso 2: Datos Extra)
// ==========================================
router.post('/google-register', async (req, res) => {
    // Recibimos todos los datos, incluido el CL
    const { email, googleId, username, age, cl } = req.body;

    // DEBUG: Mira esto en los logs de Render si algo falla
    console.log("📝 Registro Google intentado:", { username, email, age, cl });

    try {
        // Validar que el username no llegue vacío
        if (!username || username.trim() === "") {
            return res.status(400).json({ msg: 'El nombre de usuario es obligatorio' });
        }

        // Validar username único
        // Usamos trim() para limpiar espacios accidentales
        let userCheck = await User.findOne({ username: username.trim() });
        
        if (userCheck) {
            console.log("❌ Nick ocupado:", username);
            return res.status(400).json({ msg: `El nick '${username}' ya está ocupado. Intenta otro.` });
        }

        // Crear usuario sin contraseña (password vacío "")
        // IMPORTANTE: Esto funciona porque quitamos el 'minlength' en el Modelo User.js
        const newUser = new User({
            email,
            googleId,
            username: username.trim(),
            age,
            cl,         // <--- Guardamos el CL
            password: "" 
        });

        await newUser.save();
        console.log("✅ Usuario Google creado:", username);

        // Login automático (Generar token)
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });

    } catch (error) {
        console.error("🔥 Error en google-register:", error);
        res.status(500).json({ error: "Error al registrar usuario de Google" });
    }
});

module.exports = router;
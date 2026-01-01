const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const verifyToken = require('../middleware/verifyToken');

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";
// ✅ Asegúrate de que este ID sea EXACTAMENTE igual al de tu Frontend
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// ==========================================
// 1. REGISTRO Y LOGIN NORMAL
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });
        
        const emailExist = await User.findOne({ email: email.toLowerCase() });
        if (emailExist) return res.status(400).json({ error: "El email ya está registrado" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error en el registro" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

        if (!user.password) {
            return res.status(400).json({ error: "Usa el botón de Google para entrar." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Credenciales inválidas" });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// ==========================================
// 2. GOOGLE LOGIN (REVISADO)
// ==========================================
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com"
        });
        const { email, sub: googleId, name } = ticket.getPayload();
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            const appToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token: appToken, isNew: false, user });
        } else {
            // Si no existe, devolvemos los datos para que el frontend complete el registro
            return res.json({ isNew: true, email, googleId, name });
        }
    } catch (err) {
        console.error("🔴 Error Google Auth:", err);
        res.status(500).json({ error: "Error de autenticación con Google" });
    }
});

// ==========================================
// 3. RECUPERACIÓN DE CONTRASEÑA
// ==========================================
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ msg: "Correo no encontrado" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        const resetUrl = `https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app/reset-password/${token}`;

        await transporter.sendMail({
            to: user.email,
            from: `"ForjaDeck" <${process.env.EMAIL_USER}>`,
            subject: 'Recuperación de Contraseña',
            html: `<p>Para cambiar tu contraseña haz clic <a href="${resetUrl}">aquí</a></p>`
        });

        res.json({ msg: "Correo enviado" });
    } catch (error) {
        console.error("🔴 Error Email:", error);
        res.status(500).json({ msg: "Error al enviar el correo" });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: "Token inválido o expirado" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ msg: "Contraseña actualizada" });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar" });
    }
});

// ==========================================
// 🛡️ ADMINISTRACIÓN
// ==========================================
router.get('/all', verifyToken, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

router.put('/role/:id', verifyToken, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

module.exports = router;
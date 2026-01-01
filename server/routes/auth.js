const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ✅ Importado para generar tokens seguros
const nodemailer = require('nodemailer'); // ✅ Importado para enviar correos
const { OAuth2Client } = require('google-auth-library');
const verifyToken = require('../middleware/verifyToken');

const JWT_SECRET = "supersecreto_deckmyl_12345";

// ⚠️ ID REAL DE GOOGLE (Extraído de tus logs)
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// ==========================================
// 1. REGISTRO NORMAL
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });
        if (password.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

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
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
});

// ==========================================
// 2. LOGIN NORMAL
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ error: "Email o contraseña incorrectos" });
        if (!user.password) return res.status(400).json({ error: "Usa el botón de Google." });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Email o contraseña incorrectos" });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// ==========================================
// 3. GOOGLE VERIFY & REGISTER
// ==========================================
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com"
        });
        const { email, sub: googleId } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (user) {
            const appToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token: appToken, isNew: false, user });
        } else {
            res.json({ isNew: true, email, googleId });
        }
    } catch (err) {
        res.status(500).json({ error: "Error Google" });
    }
});

router.post('/google-register', async (req, res) => {
    const { email, googleId, username, age, cl } = req.body;
    try {
        if (!username) return res.status(400).json({ msg: 'Nick obligatorio' });
        let userCheck = await User.findOne({ username: username.trim() });
        if (userCheck) return res.status(400).json({ msg: "Nick ocupado" });

        const newUser = new User({
            email, googleId, username: username.trim(), age, cl, password: ""
        });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error registro Google" });
    }
});

// ==========================================
// 🔑 4. RECUPERACIÓN DE CONTRASEÑA (CAMBIO OBLIGATORIO)
// ==========================================

// A. Solicitar Enlace de Cambio
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) return res.status(404).json({ msg: "El correo no está registrado" });
        if (user.googleId) return res.status(400).json({ msg: "Cuenta vinculada a Google. Usa Google Login." });

        // Generar Token de 20 caracteres hexadecimales
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Expira en 1 hora
        await user.save();

        // Configuración de Email (Nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo en .env
                pass: process.env.EMAIL_PASS  // Tu App Password en .env
            }
        });

        // Enlace para el Frontend (Ajusta el dominio si estás en producción)
        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        const mailOptions = {
            to: user.email,
            from: 'ForjaDeck <noreply@forjadeck.com>',
            subject: 'Cambio Obligatorio de Contraseña',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2563eb;">Solicitud de Seguridad</h2>
                    <p>Has solicitado restablecer tu acceso a <b>ForjaDeck</b>.</p>
                    <p>Para cambiar tu clave de forma obligatoria, haz clic en el botón:</p>
                    <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Establecer Nueva Clave</a>
                    <p style="color: #ef4444; font-size: 12px; margin-top: 20px;">Este enlace caduca en 60 minutos.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: "Correo enviado con éxito" });

    } catch (error) {
        res.status(500).json({ msg: "Error al procesar la solicitud" });
    }
});

// B. Procesar el Cambio Final
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        // Buscar usuario por token y que no haya expirado ($gt: mayor que ahora)
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: "El token no es válido o ya caducó" });

        // Encriptar la nueva clave
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Limpiar campos de recuperación para seguridad
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ msg: "Contraseña actualizada exitosamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar contraseña" });
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
        res.status(500).json({ message: "Error al obtener la lista de usuarios" });
    }
});

router.put('/role/:id', verifyToken, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: role },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
});

module.exports = router;
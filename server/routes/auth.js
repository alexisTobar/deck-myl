const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const verifyToken = require('../middleware/verifyToken');

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// === TUS RUTAS ORIGINALES (NO TOCAR) ===

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email o contraseña incorrectos" });
        if (!user.password) return res.status(400).json({ error: "Usa el botón de Google." });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Email o contraseña incorrectos" });
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

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
        const newUser = new User({ email, googleId, username: username.trim(), age, cl, password: "" });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error registro Google" });
    }
});

// === AÑADIDO SOLO LO NECESARIO PARA RECUPERACIÓN ===

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "Correo no registrado" });
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const resetUrl = `https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app/reset-password/${token}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Cambio de Contraseña',
            html: `<p>Click aquí: <a href="${resetUrl}">${resetUrl}</a></p>`
        });
        res.json({ msg: "Correo enviado" });
    } catch (error) {
        res.status(500).json({ msg: "Error de correo" });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: "Token inválido" });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ msg: "OK" });
    } catch (error) {
        res.status(500).json({ msg: "Error" });
    }
});

// === RUTAS ADMIN (ORIGINALES) ===

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
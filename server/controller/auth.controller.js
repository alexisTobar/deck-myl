const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 

// 1. SOLICITAR CAMBIO
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ msg: "El correo no está registrado" });
        if (user.googleId) return res.status(400).json({ msg: "Usa Google Login para entrar" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Usa una "App Password" de Google
            }
        });

        // Enlace que irá al frontend
        // Cambia la línea del resetUrl por esta:
/* const resetUrl = `https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app/reset-password/${token}`; */
// exports.forgotPassword en tu controlador
// const resetUrl = `https://deck-aon646qwz-alexis-projects-a11696ca.vercel.app/reset-password/${token}`;
const resetUrl = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Cambio de Contraseña - ForjaDeck',
            html: `<h1>ForjaDeck</h1><p>Haz clic para cambiar tu clave:</p><a href="${resetUrl}">${resetUrl}</a>`
        });

        res.json({ msg: "Correo enviado con éxito" });
    } catch (err) { res.status(500).json({ msg: "Error de servidor" }); }
};

// 2. EJECUTAR CAMBIO OBLIGATORIO
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ msg: "Token inválido o expirado" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ msg: "Contraseña actualizada" });
    } catch (err) { res.status(500).json({ msg: "Error al actualizar" }); }
};
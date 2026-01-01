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

// ==========================================
// 🔑 RECUPERACIÓN (FORGOT PASSWORD)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ msg: "El correo no está registrado" });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        // ✅ CONFIGURACIÓN PARA EVITAR TIMEOUT EN RENDER
        // Usamos el host de gmail directamente con puerto 587 (más estable en Render)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // false para puerto 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                // No fallar si el certificado no es perfecto (necesario en nubes compartidas)
                rejectUnauthorized: false
            },
            // Aumentamos los tiempos de espera
            greetingTimeout: 15000,
            connectionTimeout: 15000
        });

        const resetUrl = `https://deck-aon646qwz-alex-projects-a11696ca.vercel.app/reset-password/${token}`;

        const mailOptions = {
            to: user.email,
            from: `"ForjaDeck" <${process.env.EMAIL_USER}>`,
            subject: 'Recuperación de Acceso - ForjaDeck',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                    <h2 style="color: #2563eb; text-align: center;">Acceso a ForjaDeck</h2>
                    <p style="color: #444;">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">ESTABLECER NUEVA CLAVE</a>
                    </div>
                    <p style="color: #888; font-size: 12px; text-align: center;">Este enlace caduca en 60 minutos.</p>
                </div>
            `
        };

        // Verificamos la conexión antes de intentar enviar
        await transporter.verify(); 

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ msg: "Correo enviado con éxito" });

    } catch (error) {
        console.error("🔴 Error detallado de Nodemailer:", error);
        return res.status(500).json({ 
            msg: "Error al enviar el correo", 
            error: error.message 
        });
    }
});

// Mantén el resto de tus rutas (login, register, reset-password, etc.) igual...
// ... (copia las demás funciones de tu código anterior aquí abajo)

module.exports = router;
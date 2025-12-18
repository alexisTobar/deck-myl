const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); 

const JWT_SECRET = "clave_secreta_mitos_leyendas_123";

// ⚠️ PEGA AQUÍ TU CLIENT ID REAL DE NUEVO (Asegúrate que no sea el texto de ejemplo)
const client = new OAuth2Client("570011480834-rs6o3vggmdovvouj8gi9gi4p0l2mnqdm.apps.googleusercontent.com");

// ... (Rutas /register y /login normales se quedan igual, sáltalas al copiar si quieres) ...
// PEGA DESDE AQUÍ HACIA ABAJO PARA ACTUALIZAR LO DE GOOGLE:

// 3. VERIFICAR USUARIO GOOGLE
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
            const appToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token: appToken, isNew: false, user });
        } else {
            res.json({ isNew: true, email, googleId });
        }
    } catch (err) {
        console.error("Error Google Verify:", err);
        res.status(500).json({ error: "Error autenticando con Google" });
    }
});

// 4. REGISTRO FINAL CON GOOGLE (Usuario + Edad + CL)
router.post('/google-register', async (req, res) => {
    // 1. Recibimos CL también
    const { email, googleId, username, age, cl } = req.body;

    // DEBUG: Mira esto en los logs de Render para ver por qué falla
    console.log("📝 Registro Google intentado:", { username, email, age, cl });

    try {
        // Validar que no lleguen vacíos
        if (!username || username.trim() === "") {
            return res.status(400).json({ msg: 'El nombre de usuario es obligatorio' });
        }

        // Validar username único (buscando exacto)
        let userCheck = await User.findOne({ username: username.trim() });
        
        if (userCheck) {
            console.log("❌ Nick ocupado:", username);
            return res.status(400).json({ msg: `El nick '${username}' ya está ocupado. Intenta con '${username}${Math.floor(Math.random()*100)}'` });
        }

        const newUser = new User({
            email,
            googleId,
            username: username.trim(),
            age,
            cl, // <--- Guardamos CL
            password: "" 
        });

        await newUser.save();
        console.log("✅ Usuario Google creado:", username);

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });

    } catch (error) {
        console.error("🔥 Error en google-register:", error);
        res.status(500).json({ error: "Error al registrar usuario de Google" });
    }
});

module.exports = router;
 const router = require('express').Router();

const User = require('../models/User');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');

const verifyToken = require('../middleware/verifyToken'); // Asegúrate de tener este middleware



const JWT_SECRET = "";



// ⚠️ ID REAL DE GOOGLE (Extraído de tus logs)

const client = new OAuth2Client("");



// ==========================================

// 1. REGISTRO NORMAL

// ==========================================

router.post('/register', async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });

        if (password.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });



        const emailExist = await User.findOne({ email });

        if (emailExist) return res.status(400).json({ error: "El email ya está registrado" });



        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);



        const newUser = new User({

            username,

            email,

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

        const user = await User.findOne({ email });

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

// 3. GOOGLE VERIFY & REGISTER (Tus rutas actuales)

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

// 🛡️ NUEVAS RUTAS: ADMINISTRACIÓN (Dashboard)

// ==========================================



// 1. Obtener todos los usuarios registrados

router.get('/all', verifyToken, async (req, res) => {

    try {

        // Traemos todos los campos excepto el password

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({ message: "Error al obtener la lista de usuarios" });

    }

});



// 2. Cambiar rol o Banear usuario

router.put('/role/:id', verifyToken, async (req, res) => {

    try {

        const { role } = req.body; // Ejemplo: "admin", "user", o "banned"

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
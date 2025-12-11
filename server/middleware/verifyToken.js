const jwt = require('jsonwebtoken');

// NOTA: Para producción, este secreto debería ir en un archivo .env
const JWT_SECRET = "clave_secreta_mitos_leyendas_123";

module.exports = function (req, res, next) {
    // Leemos el token del header 'auth-token'
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }

    try {
        // Verificamos si el token es válido
        const verified = jwt.verify(token, JWT_SECRET);

        // Guardamos los datos del usuario dentro de la petición (req)
        req.user = verified;

        // Dejamos pasar a la siguiente función
        next();
    } catch (err) {
        res.status(400).json({ error: "Token inválido o expirado" });
    }
};
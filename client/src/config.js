// client/src/config.js
// Detecta si hay una variable de entorno (Nube) o usa localhost (Local)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default BACKEND_URL;
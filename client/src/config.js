// client/src/config.js

// VITE_BACKEND_URL es la variable que configuraste en el panel de Vercel.
// Si esa variable existe, la usamos. Si no, usamos localhost.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default BACKEND_URL;

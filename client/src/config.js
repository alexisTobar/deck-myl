// client/src/config.js
const BACKEND_URL = window.location.hostname === "localhost" 
    ? "http://localhost:4000" 
    : "https://deck-myl.onrender.com";

export default BACKEND_URL;
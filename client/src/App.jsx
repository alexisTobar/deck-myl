import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePortal from "./pages/Home";           // El selector principal
import ImperioHome from "./pages/ImperioHome";   // Nueva página Imperio
import PBHome from "./pages/PrimerBloqueHome";    // Nueva página Primer Bloque
import DeckBuilder from "./pages/DeckBuilder"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDecks from "./pages/MyDecks";
import Community from "./pages/Community";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* 1. PORTAL DE ENTRADA: Selección de formato */}
        <Route path="/" element={<HomePortal />} />

        {/* --- MUNDO IMPERIO --- */}
        <Route path="/imperio" element={<ImperioHome />} />
        <Route path="/imperio/builder" element={<DeckBuilder format="imperio" />} />
        <Route path="/imperio/community" element={<Community format="imperio" />} />

        {/* --- MUNDO PRIMER BLOQUE --- */}
        <Route path="/primer-bloque" element={<PBHome />} />
        <Route path="/primer-bloque/builder" element={<DeckBuilder format="primer_bloque" />} />
        <Route path="/primer-bloque/community" element={<Community format="primer_bloque" />} />

        {/* --- RUTAS GLOBALES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-decks" element={<MyDecks />} />

        {/* Redirección por defecto al portal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
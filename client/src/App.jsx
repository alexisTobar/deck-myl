import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";           // La nueva Landing Page
import DeckBuilder from "./pages/DeckBuilder"; // El antiguo Home (Renombrado)
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDecks from "./pages/MyDecks";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Portada Principal */}
        <Route path="/" element={<Home />} />

        {/* El Constructor de Mazos (Protegido o Público según desees) */}
        <Route path="/builder" element={<DeckBuilder />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-decks" element={<MyDecks />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

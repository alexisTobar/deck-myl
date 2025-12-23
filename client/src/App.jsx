import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePortal from "./pages/Home";           
import ImperioHome from "./pages/ImperioHome";   
import PBHome from "./pages/PrimerBloqueHome";    
import ImperioBuilder from "./pages/ImperioBuilder"; 
import PBBuilder from "./pages/PBBuilder";           
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDecks from "./pages/MyDecks";
import Community from "./pages/Community";

// ✅ 1. Importa el nuevo componente de Admin
import AdminCards from "./pages/AdminCards"; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePortal />} />

        {/* --- MUNDO IMPERIO --- */}
        <Route path="/imperio" element={<ImperioHome />} />
        <Route path="/imperio/builder" element={<ImperioBuilder />} />
        <Route path="/imperio/community" element={<Community format="imperio" />} />

        {/* --- MUNDO PRIMER BLOQUE --- */}
        <Route path="/primer-bloque" element={<PBHome />} />
        <Route path="/primer-bloque/builder" element={<PBBuilder />} />
        <Route path="/primer-bloque/community" element={<Community format="primer_bloque" />} />

        {/* --- RUTAS GLOBALES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-decks" element={<MyDecks />} />
        <Route path="/community" element={<Community />} />

        {/* ✅ 2. Nueva Ruta para el Panel de Administrador */}
        <Route path="/admin/cards" element={<AdminCards />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
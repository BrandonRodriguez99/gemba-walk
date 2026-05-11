import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import NuevaVisita from "./pages/NuevaVisita";
import Seguimiento from "./pages/Seguimiento";
import Analitica from "./pages/Analitica";
import GestionUsuarios from "./pages/GestionUsuarios";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, minHeight: "100vh", overflowY: "auto", padding: "30px", background: "#f1f5f9", boxSizing: "border-box" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nueva" element={<ProtectedRoute allowedRoles={["Admin", "Inspector"]}><NuevaVisita /></ProtectedRoute>} />
          <Route path="/seguimiento" element={<ProtectedRoute allowedRoles={["Admin", "Supervisor", "Inspector"]}><Seguimiento /></ProtectedRoute>} />
          <Route path="/analitica" element={<ProtectedRoute allowedRoles={["Admin", "Supervisor"]}><Analitica /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedRoles={["Admin"]}><GestionUsuarios /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
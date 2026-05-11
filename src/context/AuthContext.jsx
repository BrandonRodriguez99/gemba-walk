import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", role: "Admin", name: "Administrador" },
  { username: "supervisor", password: "sup123", role: "Supervisor", name: "Supervisor" },
  { username: "inspector", password: "insp123", role: "Inspector", name: "Inspector" }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("gemba_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedUsers = localStorage.getItem("gemba_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem("gemba_users", JSON.stringify(DEFAULT_USERS));
      setUsers(DEFAULT_USERS);
    }

    setLoading(false);
  }, []);

  const login = (username, password) => {
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) {
      throw new Error("Usuario o contraseña incorrectos");
    }
    const payload = { username: found.username, role: found.role, name: found.name };
    localStorage.setItem("gemba_user", JSON.stringify(payload));
    setUser(payload);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem("gemba_user");
    setUser(null);
  };

  const createUser = ({ username, password, role, name }) => {
    if (!username || !password || !role || !name) {
      throw new Error("Todos los campos son obligatorios");
    }
    if (users.some(u => u.username === username)) {
      throw new Error("El nombre de usuario ya existe");
    }
    const nuevo = { username, password, role, name };
    const next = [...users, nuevo];
    localStorage.setItem("gemba_users", JSON.stringify(next));
    setUsers(next);
    return nuevo;
  };

  const value = useMemo(() => ({ user, users, loading, login, logout, createUser }), [user, users, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

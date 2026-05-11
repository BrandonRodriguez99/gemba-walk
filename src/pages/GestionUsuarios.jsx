import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Admin", "Supervisor", "Inspector"];

export default function GestionUsuarios() {
  const { users, createUser } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "Inspector" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await createUser(form);
      setMessage("Usuario creado correctamente.");
      setForm({ username: "", password: "", name: "", role: "Inspector" });
    } catch (err) {
      setError(err.message || "Error al crear usuario");
    }
  };

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.role.localeCompare(b.role) || a.username.localeCompare(b.username)),
    [users]
  );

  return (
    <div className="page-content">
      <div className="page-hero">
        <div>
          <h1 className="hero-title">Administración de usuarios</h1>
          <p className="hero-description">Aquí puedes crear nuevos usuarios y asignarles roles dentro del sistema.</p>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-header">
          <span className="section-tag">Crear usuario</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nombre completo</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre del usuario"
            />
          </div>

          <div className="form-field">
            <label>Usuario</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Usuario para iniciar sesión"
            />
          </div>

          <div className="form-field">
            <label>Contraseña</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Contraseña"
            />
          </div>

          <div className="form-field">
            <label>Rol</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="form-actions" style={{ gridColumn: "1 / -1", gap: "10px" }}>
            <button className="btn-primary" type="submit">Crear usuario</button>
          </div>

          {message && <div className="success-box">{message}</div>}
          {error && <div className="error-box">{error}</div>}
        </form>
      </div>

      <div className="card section-card" style={{ marginTop: "24px" }}>
        <div className="section-header">
          <span className="section-tag">Usuarios existentes</span>
        </div>

        <div className="table-card-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.username}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

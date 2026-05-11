import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(username.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-hero">
          <h1>Iniciar sesión</h1>
          <p>Accede con tu usuario y contraseña para entrar al sistema Gemba.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Usuario</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario"
            autoFocus
          />

          <label>Contraseña</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="contraseña"
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary login-btn">
            Entrar
          </button>

          <div className="login-footer">
            <p>Credenciales de ejemplo:</p>
            <ul>
              <li>admin / admin123</li>
              <li>supervisor / sup123</li>
              <li>inspector / insp123</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

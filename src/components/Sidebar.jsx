import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Dashboard", roles: ["Admin", "Supervisor", "Inspector"] },
  { to: "/nueva", label: "Nueva Visita", roles: ["Admin", "Inspector"] },
  { to: "/seguimiento", label: "Seguimiento", roles: ["Admin", "Supervisor", "Inspector"] },
  { to: "/analitica", label: "Analítica", roles: ["Admin", "Supervisor"] },
  { to: "/usuarios", label: "Usuarios", roles: ["Admin"] }
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div style={sidebarStyle}>
      <h2 style={titleStyle}>Gemba Walk</h2>

      <ul style={menuStyle}>
        {LINKS.filter(link => link.roles.includes(user.role)).map((link) => (
          <li key={link.to} style={itemStyle}>
            <Link to={link.to} style={linkStyle}>{link.label}</Link>
          </li>
        ))}
      </ul>

      <div style={footerStyle}>
        <div style={{ marginBottom: 18 }}>
          <div style={userNameStyle}>{user.name}</div>
          <div style={userRoleStyle}>{user.role}</div>
        </div>
        <button onClick={logout} style={logoutStyle} type="button">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

const sidebarStyle = {
  width: "240px",
  background: "#0f172a",
  color: "white",
  height: "100vh",
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
  padding: "30px 20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const titleStyle = {
  marginBottom: "40px",
  fontSize: "20px",
  letterSpacing: "0.12em"
};

const menuStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  flex: 1
};

const itemStyle = {
  marginBottom: "18px"
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: 600
};

const footerStyle = {
  paddingTop: "20px",
  borderTop: "1px solid rgba(255,255,255,0.12)"
};

const userNameStyle = {
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "4px"
};

const userRoleStyle = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.68)"
};

const logoutStyle = {
  marginTop: "12px",
  width: "100%",
  border: "1px solid rgba(255,255,255,0.22)",
  background: "transparent",
  color: "white",
  borderRadius: "10px",
  padding: "10px 12px",
  cursor: "pointer",
  fontSize: "14px"
};
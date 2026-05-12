import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Dashboard() {

  const location = useLocation();
  const [visitas, setVisitas] = useState([]);
  const [compromisos, setCompromisos] = useState(0);
  const [sinClasificar, setSinClasificar] = useState(0);
  const [tasaCierre, setTasaCierre] = useState(0);

  useEffect(() => {
    obtenerDatos();
  }, [location.pathname]);

  const obtenerDatos = async () => {
    try {
      const res = await fetch(
      `${import.meta.env.VITE_API_URL}/visitas`
      );
      const data = await res.json();

      setVisitas(data);

      let total = 0;
      let sinClasif = 0;
      let cerrados = 0;

      data.forEach(v => {
        if (Array.isArray(v.compromisos)) {
          total += v.compromisos.length;

          v.compromisos.forEach(c => {
            const estado = (c.Estado || c.estado || "").toString();
            const clasif = (c.Clasificacion || c.clasificacion || "").toString();

            if (!clasif || clasif === "Sin clasificar") {
              sinClasif++;
            }

            if (estado === "Cerrado" || clasif === "Cerrado") {
              cerrados++;
            }
          });
        }
      });

      setCompromisos(total);
      setSinClasificar(sinClasif);

      const tasa = total > 0 ? Math.round((cerrados / total) * 100) : 0;
      setTasaCierre(tasa);

    } catch (error) {
      console.error("Error dashboard:", error);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const visitasRecientes = [...visitas]
    .sort((a, b) => new Date(b.Fecha || b.fecha) - new Date(a.Fecha || a.fecha))
    .slice(0, 6);

  const compromisosActivos = visitas
    .flatMap(v => (Array.isArray(v.compromisos) ? v.compromisos : []).map(c => ({
      ...c,
      visitaColaborador: v.Colaborador || v.colaborador || "-",
      visitaArea: v.Area || v.area || "-",
      visitaTipo: v.TipoGemba || v.tipoGemba || v.Tipo || v.tipo || "-",
      visitaEstado: c.Estado || c.estado || (c.Clasificacion === "Cerrado" ? "Cerrado" : "En seguimiento")
    })))
    .filter(c => c.visitaEstado !== "Cerrado")
    .slice(0, 8);

    console.log(import.meta.env.VITE_API_URL);

  return (
    <div className="dashboard-page">
      <div className="page-hero">
        <div>
          <h1 className="hero-title">Dashboard General</h1>
          <p className="hero-description">Resumen de visitas y compromisos activos.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="kpi-card azul">
          <span>Visitas realizadas</span>
          <h1 className="kpi-value">{visitas.length || 0}</h1>
        </div>
        <div className="kpi-card naranja">
          <span>Compromisos totales</span>
          <h1 className="kpi-value">{compromisos || 0}</h1>
        </div>
        <div className="kpi-card amarillo">
          <span>Sin clasificar</span>
          <h1 className="kpi-value">{sinClasificar || 0}</h1>
        </div>
        <div className="kpi-card azul2">
          <span>Tasa de cierre</span>
          <h1 className="kpi-value">{tasaCierre || 0}%</h1>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="table-card">
          <div className="table-card-header">
            <div>
              <h3>Visitas recientes</h3>
              <p>Últimas visitas registradas.</p>
            </div>
            <span>{visitasRecientes.length} visitas</span>
          </div>
          <div className="table-card-body">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Área</th>
                  <th>Tipo</th>
                  <th>Compromisos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visitasRecientes.map((visita) => {
                  const totalCompromisos = Array.isArray(visita.compromisos) ? visita.compromisos.length : 0;
                  const estadoVisita = totalCompromisos === 0
                    ? "Sin compromisos"
                    : (Array.isArray(visita.compromisos) && visita.compromisos.some(c => c.Clasificacion !== "Cerrado" && c.Estado !== "Cerrado")
                      ? "En seguimiento"
                      : "Cerrado");

                  return (
                    <tr key={visita.Id || visita.id || Math.random()}>
                      <td>{visita.Colaborador || visita.colaborador || "-"}</td>
                      <td>{visita.Area || visita.area || "-"}</td>
                      <td>{visita.TipoGemba || visita.tipoGemba || visita.Tipo || visita.tipo || "-"}</td>
                      <td>{totalCompromisos}</td>
                      <td>{estadoVisita}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <div>
              <h3>Compromisos activos</h3>
              <p>Compromisos en seguimiento pendientes de cierre.</p>
            </div>
            <span>{compromisosActivos.length} activos</span>
          </div>
          <div className="table-card-body">
            <table>
              <thead>
                <tr>
                  <th>Compromiso</th>
                  <th>Responsable</th>
                  <th>Área</th>
                  <th>Fecha límite</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {compromisosActivos.map((compromiso, index) => (
                  <tr key={compromiso.Id || compromiso.id || index}>
                    <td>{compromiso.Descripcion || compromiso.descripcion || "-"}</td>
                    <td>{compromiso.Responsable || compromiso.responsable || "-"}</td>
                    <td>{compromiso.visitaArea}</td>
                    <td>{formatDate(compromiso.FechaLimite || compromiso.fechaLimite || compromiso.fecha)}</td>
                    <td>{compromiso.visitaEstado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
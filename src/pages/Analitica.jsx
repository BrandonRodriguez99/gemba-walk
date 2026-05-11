import { useEffect, useMemo, useState } from "react";

export default function Analitica() {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(
        `${import.meta.env.VITE_API_URL}/visitas`
         );
        const data = await res.json();
        setVisitas(data);
      } catch (error) {
        console.error("Error al cargar analítica:", error);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const resumen = useMemo(() => {
    const areaCounts = {};
    const clasifCounts = {};
    const tipoCounts = {};
    const areaProgreso = {};
    const timeline = {};
    let totalCompromisos = 0;

    visitas.forEach((visita) => {
      const area = visita.Area || visita.area || "Sin área";
      const tipo = visita.TipoGemba || visita.tipoGemba || visita.Tipo || visita.tipo || "Desconocido";
      const compromisos = Array.isArray(visita.compromisos) ? visita.compromisos : [];

      areaCounts[area] = (areaCounts[area] || 0) + compromisos.length;
      tipoCounts[tipo] = (tipoCounts[tipo] || 0) + 1;

      if (!areaProgreso[area]) {
        areaProgreso[area] = { cerrados: 0, total: 0 };
      }

      compromisos.forEach((compromiso) => {
        totalCompromisos += 1;

        const clasificacion = compromiso.Clasificacion || compromiso.clasificacion || "Sin clasificar";
        clasifCounts[clasificacion] = (clasifCounts[clasificacion] || 0) + 1;

        const estado = (compromiso.Estado || compromiso.estado || "") === "Cerrado" || clasificacion === "Cerrado";
        if (estado) areaProgreso[area].cerrados += 1;
        areaProgreso[area].total += 1;

        const fecha = compromiso.FechaLimite || compromiso.fechaLimite || compromiso.fecha || "";
        if (fecha) {
          const fechaSimple = new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" });
          timeline[fechaSimple] = (timeline[fechaSimple] || 0) + 1;
        }
      });
    });

    const ordenTimeline = Object.keys(timeline).sort((a, b) => {
      const [da, ma] = a.split("/").map(Number);
      const [db, mb] = b.split("/").map(Number);
      return ma - mb || da - db;
    });

    return {
      areaCounts,
      clasifCounts,
      tipoCounts,
      areaProgreso,
      timeline,
      ordenTimeline,
      totalCompromisos
    };
  }, [visitas]);

  const maxAreaCount = Math.max(0, ...Object.values(resumen.areaCounts));
  const maxTipoCount = Math.max(0, ...Object.values(resumen.tipoCounts));
  const maxTimeline = Math.max(0, ...Object.values(resumen.timeline));

  const totalVisitas = visitas.length;
  const totalCerrados = Object.values(resumen.areaProgreso).reduce((sum, stats) => sum + (stats.cerrados || 0), 0);
  const totalCompromisos = resumen.totalCompromisos;
  const cierrePorcentaje = totalCompromisos > 0 ? Math.round((totalCerrados / totalCompromisos) * 100) : 0;
  const areasCount = Object.keys(resumen.areaProgreso).length;

  return (
    <div className="analytics-page">
      <div className="page-hero">
        <div>
          <h1 className="hero-title">Analítica & Tendencias</h1>
          <p className="hero-description">Visualización de compromisos por departamento, clasificación y progreso.</p>
        </div>
      </div>

      {cargando ? (
        <div className="analytics-loading">Cargando datos...</div>
      ) : (
        <>
          <div className="analytics-summary">
            <div className="summary-card analytics-summary-card">
              <p className="summary-card-label">Visitas registradas</p>
              <strong>{totalVisitas}</strong>
            </div>
            <div className="summary-card analytics-summary-card">
              <p className="summary-card-label">Compromisos totales</p>
              <strong>{totalCompromisos}</strong>
            </div>
            <div className="summary-card analytics-summary-card">
              <p className="summary-card-label">Cierre</p>
              <strong>{cierrePorcentaje}%</strong>
            </div>
            <div className="summary-card analytics-summary-card">
              <p className="summary-card-label">Áreas analizadas</p>
              <strong>{areasCount}</strong>
            </div>
          </div>

          <div className="analytics-grid">
          <section className="analytics-card">
            <div className="analytics-card-title">
              <h3>Compromisos por departamento</h3>
              <span>{Object.values(resumen.areaCounts).reduce((sum, value) => sum + value, 0)} compromisos</span>
            </div>
            <div className="bar-chart">
              {Object.entries(resumen.areaCounts).map(([area, cantidad]) => (
                <div key={area} className="bar-row">
                  <div className="bar-label">{area}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${maxAreaCount ? (cantidad / maxAreaCount) * 100 : 0}%` }} />
                  </div>
                  <div className="bar-value">{cantidad}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="analytics-card">
            <div className="analytics-card-title">
              <h3>Distribución por clasificación</h3>
              <span>{resumen.totalCompromisos} compromisos</span>
            </div>
            <div className="legend-grid">
              {Object.entries(resumen.clasifCounts).map(([clasif, cantidad]) => {
                const color = clasif.toLowerCase().includes("agil") ? "#fb6500" : clasif.toLowerCase().includes("proyecto") ? "#0b2341" : "#f6c344";
                return (
                  <div key={clasif} className="legend-item">
                    <span className="legend-dot" style={{ background: color }} />
                    <div>
                      <strong>{clasif}</strong>
                      <p>{cantidad} compromisos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analytics-card">
            <div className="analytics-card-title">
              <h3>Visitas por tipo</h3>
              <span>{Object.values(resumen.tipoCounts).reduce((sum, value) => sum + value, 0)} visitas</span>
            </div>
            <div className="horizontal-chart">
              {Object.entries(resumen.tipoCounts).map(([tipo, cantidad]) => (
                <div key={tipo} className="horizontal-row">
                  <div className="horizontal-label">{tipo}</div>
                  <div className="horizontal-bar-track">
                    <div className="horizontal-bar-fill" style={{ width: `${maxTipoCount ? (cantidad / maxTipoCount) * 100 : 0}%` }} />
                  </div>
                  <span>{cantidad}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="analytics-card">
            <div className="analytics-card-title">
              <h3>% Avance por área</h3>
              <span>{Object.keys(resumen.areaProgreso).length} áreas</span>
            </div>
            <div className="progress-chart">
              {Object.entries(resumen.areaProgreso).map(([area, stats]) => {
                const porcentaje = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;
                return (
                  <div key={area} className="progress-row">
                    <div className="progress-label">
                      <span>{area}</span>
                      <strong>{porcentaje}%</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="analytics-card analytics-fullwidth">
            <div className="analytics-card-title">
              <h3>Línea de tiempo – compromisos acumulados</h3>
              <span>{resumen.ordenTimeline.length} fechas</span>
            </div>
            <div className="timeline-chart">
              <div className="timeline-line" />
              {resumen.ordenTimeline.map((fecha, index) => {
                const cantidad = resumen.timeline[fecha] || 0;
                const left = (index / Math.max(1, resumen.ordenTimeline.length - 1)) * 100;
                return (
                  <div key={fecha} className="timeline-point" style={{ left: `${left}%` }}>
                    <div className="timeline-dot" />
                    <span>{cantidad}</span>
                    <p>{fecha}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </>
      )}
    </div>
  );
}

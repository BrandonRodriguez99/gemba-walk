import { useEffect, useState } from "react";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const getValue = (item, keys) => {
  for (const key of keys) {
    if (item[key] || item[key] === 0) return item[key];
  }
  return "";
};

const getNombreCompleto = (c) => {
  if (c.NombreCompleto) return c.NombreCompleto;
  return [c.Nombre, c.ApellidoPaterno, c.ApellidoMaterno, c.nombre, c.apellidoPaterno, c.apellidoMaterno]
    .filter(Boolean)
    .join(" ")
    .trim();
};

/* 🔍 BUSCADOR COMBOBOX */
function ComboBuscador({ data, onSelect, value }) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    setBusqueda(value || "");
  }, [value]);

  const filtrados = busqueda.trim().length > 0
    ? data.filter(c =>
        getNombreCompleto(c)
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    : [];

  return (
    <div style={{ position: "relative" }}>
      <input
        className="input"
        value={busqueda}
        placeholder="Buscar..."
        onFocus={() => setMostrar(true)}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setMostrar(true);
          onSelect({ personalizado: e.target.value });
        }}
      />

      {mostrar && filtrados.length > 0 && (
        <div className="dropdown">
          {filtrados.slice(0, 8).map((c, i) => (
            <div
              key={i}
              className="dropdown-item"
              onMouseDown={() => {
                setBusqueda(getNombreCompleto(c));
                onSelect(c);
                setMostrar(false);
              }}
            >
              {getNombreCompleto(c)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Seguimiento() {
  const [visitas, setVisitas] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [compromisosBorrador, setCompromisosBorrador] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    Promise.all([
      fetch("http://localhost:3001/visitas").then(r => r.json()),
      fetch("http://localhost:3001/colaboradores").then(r => r.json()).catch(() => [])
    ])
      .then(([visitasData, colaboradoresData]) => {
        setVisitas(Array.isArray(visitasData) ? visitasData : []);
        setColaboradores(Array.isArray(colaboradoresData) ? colaboradoresData : []);
      })
      .catch((error) => {
        console.error("Error al cargar datos:", error);
        setVisitas([]);
        setColaboradores([]);
      })
      .finally(() => setCargando(false));
  }, []);

  const actualizarCompromisoEditado = (index, campo, valor) => {
    const nuevosBorradores = [...compromisosBorrador];
    
    // Actualizar el compromiso con el campo especificado
    if (campo === "Descripcion") {
      nuevosBorradores[index] = { ...nuevosBorradores[index], Descripcion: valor };
    } else if (campo === "Responsable") {
      nuevosBorradores[index] = { ...nuevosBorradores[index], Responsable: valor };
    } else if (campo === "FechaLimite") {
      nuevosBorradores[index] = { ...nuevosBorradores[index], FechaLimite: valor };
    } else if (campo === "Clasificacion") {
      nuevosBorradores[index] = { ...nuevosBorradores[index], Clasificacion: valor };
    } else if (campo === "Estado") {
      nuevosBorradores[index] = { ...nuevosBorradores[index], Estado: valor };
    }
    
    setCompromisosBorrador(nuevosBorradores);
  };

  const guardarCambios = async () => {
    if (!selected) return;
    
    setGuardando(true);
    try {
      // Crear los compromisos normalizados
      const compromisosNormalizados = compromisosBorrador.map(c => ({
        Descripcion: c.Descripcion || c.descripcion || c.texto || "",
        Responsable: c.Responsable || c.responsable || "",
        FechaLimite: c.FechaLimite || c.fechaLimite || c.fecha || "",
        Clasificacion: c.Clasificacion || c.clasificacion || "Sin clasificar",
        Estado: c.Estado || c.estado || "Seguimiento"
      }));

      console.log("Guardando compromisos en BD:", compromisosNormalizados);

      // Guardar en SQL Server a través del backend
      const response = await fetch("http://localhost:3001/compromisos/actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitaId: selected.Id,
          compromisos: compromisosNormalizados
        })
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json().catch(() => null);
        console.log("Response data:", data);

        const visitaActualizada = {
          ...selected,
          compromisos: compromisosNormalizados
        };

        setVisitas(visitas.map(v => (v.Id === selected.Id) ? visitaActualizada : v));
        setSelected(visitaActualizada);
        
        alert("✅ Cambios guardados en SQL Server");
      } else {
        const errorText = await response.text().catch(() => response.statusText);
        console.error("Respuesta de error del servidor:", errorText);
        alert(`❌ Error al guardar: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-hero">
        <div>
          <h1 className="hero-title">Seguimiento de visitas</h1>
          <p className="hero-description">Visualiza todas las visitas registradas y abre el detalle para ver compromisos.</p>
        </div>
      </div>

      <div className="seguimiento-summary">
        <div className="summary-card">
          <span>Total visitas</span>
          <strong>{visitas.length}</strong>
        </div>
        <div className="summary-card">
          <span>Visitas con compromisos</span>
          <strong>{visitas.filter(v => Array.isArray(v.compromisos) && v.compromisos.length > 0).length}</strong>
        </div>
      </div>

      <div className="seguimiento-grid">
        {cargando && <div className="empty-state">Cargando visitas...</div>}

        {!cargando && visitas.length === 0 && (
          <div className="empty-state">No hay visitas registradas.</div>
        )}

        {!cargando && visitas.map((visita, index) => {
          const colaborador = getValue(visita, ["Colaborador", "colaborador"]);
          const lider = getValue(visita, ["Lider", "lider"]);
          const area = getValue(visita, ["Area", "area"]);
          const tipo = getValue(visita, ["TipoGemba", "tipoGemba"]);
          const fecha = formatDate(getValue(visita, ["Fecha", "fecha"]));
          const compromisos = Array.isArray(visita.compromisos) ? visita.compromisos : [];

          return (
            <div key={visita.Id || index} className="visita-card">
              <div className="visita-card-row">
                <div>
                  <div className="visita-card-title">{colaborador || "Sin colaborador"}</div>
                  <div className="visita-card-meta">{area || "Área no definida"}</div>
                </div>
                <span className="visita-chip">{tipo || "Sin tipo"}</span>
              </div>

              <div className="visita-card-info">
                <span>{lider ? `Líder: ${lider}` : "Sin líder"}</span>
                <span>{fecha ? `Fecha: ${fecha}` : "Fecha no definida"}</span>
              </div>

              <div className="visita-card-footer">
                <span>{compromisos.length} compromisos</span>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setSelected(visita);
                    // Normalizar compromisos - SOLO campos que existen en tabla SQL
                    const compromisosBorrador = Array.isArray(visita.compromisos) ? visita.compromisos.map(c => ({
                      Descripcion: c.Descripcion || c.descripcion || c.texto || "",
                      Responsable: c.Responsable || c.responsable || "",
                      FechaLimite: c.FechaLimite || c.fechaLimite || c.fecha || "",
                      Clasificacion: c.Clasificacion || c.clasificacion || "Sin clasificar",
                      Estado: c.Estado || c.estado || "Seguimiento"
                    })) : [];
                    setCompromisosBorrador(compromisosBorrador);
                  }} 
                  type="button"
                >
                  Ver detalle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card modal-large" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de visita Gemba</h3>
              <button className="modal-close" onClick={() => setSelected(null)} type="button">✕</button>
            </div>

            <div className="modal-content-scroll">
              <div className="modal-grid">
                <div>
                  <p className="modal-label">Colaborador</p>
                  <p>{getValue(selected, ["Colaborador", "colaborador"]) || "—"}</p>
                </div>
                <div>
                  <p className="modal-label">Líder</p>
                  <p>{getValue(selected, ["Lider", "lider"]) || "—"}</p>
                </div>
                <div>
                  <p className="modal-label">Área</p>
                  <p>{getValue(selected, ["Area", "area"]) || "—"}</p>
                </div>
                <div>
                  <p className="modal-label">Unidad</p>
                  <p>{getValue(selected, ["UnidadNegocio", "unidad"]) || "—"}</p>
                </div>
                <div>
                  <p className="modal-label">Tipo</p>
                  <p>{getValue(selected, ["TipoGemba", "tipoGemba"]) || "—"}</p>
                </div>
                <div>
                  <p className="modal-label">Fecha</p>
                  <p>{formatDate(getValue(selected, ["Fecha", "fecha"])) || "—"}</p>
                </div>
              </div>

              <div className="modal-section">
                <h4>Preguntas del Gemba</h4>
                <div className="gemba-questions">
                  {getValue(selected, ["TipoGemba", "tipoGemba"]) === "Cascada" && selected.cascada && (
                    <div className="gemba-section">
                      <h5>Gemba Cascada</h5>
                      <div className="gemba-grid">
                        <div className="gemba-item">
                          <strong>¿Qué actividad estás realizando?</strong>
                          <p>{selected.cascada.p1 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Tienes un punto de control definido?</strong>
                          <p>{selected.cascada.p2 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿A cuál KPI impacta?</strong>
                          <p>{selected.cascada.p3 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Qué mejorarías?</strong>
                          <p>{selected.cascada.p4 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Está en tu agenda?</strong>
                          <p>{selected.cascada.p5 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Existe procedimiento?</strong>
                          <p>{selected.cascada.p6 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>Propuesta de mejora</strong>
                          <p>{selected.cascada.p7 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>Desperdicios detectados</strong>
                          <p>{Array.isArray(selected.cascada.p8) ? selected.cascada.p8.join(", ") : "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {getValue(selected, ["TipoGemba", "tipoGemba"]) === "Gerencial" && selected.gerencial && (
                    <div className="gemba-section">
                      <h5>Gemba Gerencial</h5>
                      <div className="gemba-grid">
                        <div className="gemba-item">
                          <strong>¿Recibiste la capacitación necesaria?</strong>
                          <p>{selected.gerencial.g1 || "—"}</p>
                          <small>{selected.gerencial.g1_text || ""}</small>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Has tenido que adaptar actividades?</strong>
                          <p>{selected.gerencial.g2 || "—"}</p>
                          <small>{selected.gerencial.g2_text || ""}</small>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Hay retrasos o malentendidos?</strong>
                          <p>{selected.gerencial.g3 || "—"}</p>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Cuentas con lo necesario?</strong>
                          <p>{selected.gerencial.g4 || "—"}</p>
                          <small>{selected.gerencial.g4_text || ""}</small>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Situaciones inseguras detectadas?</strong>
                          <p>{selected.gerencial.g5 || "—"}</p>
                          <small>{selected.gerencial.g5_text || ""}</small>
                        </div>
                        <div className="gemba-item">
                          <strong>¿Te escuchan cuando propones ideas?</strong>
                          <p>{selected.gerencial.g6 || "—"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h4>Compromisos declarados</h4>
                {Array.isArray(selected.compromisos) && selected.compromisos.length > 0 ? (
                  selected.compromisos.map((compromiso, index) => (
                    <div key={index} className="compromiso-editable">
                      <div className="compromiso-editable-header">
                        <span className="compromiso-number">Compromiso {index + 1}</span>
                        <select
                          className="compromiso-status"
                          value={getValue(compromisosBorrador[index], ["Estado", "estado"]) || "Seguimiento"}
                          onChange={(e) => actualizarCompromisoEditado(index, "Estado", e.target.value)}
                        >
                          <option value="Seguimiento">Seguimiento</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>
                      </div>

                      <div className="compromiso-editable-content">
                        <div className="compromiso-field">
                          <label className="compromiso-label">Descripción</label>
                          <textarea
                            className="input"
                            value={getValue(compromisosBorrador[index], ["Descripcion", "descripcion", "texto"]) || ""}
                            onChange={(e) => actualizarCompromisoEditado(index, "Descripcion", e.target.value)}
                          />
                        </div>

                        <div className="compromiso-grid">
                          <div className="compromiso-field">
                            <label className="compromiso-label">Responsable</label>
                            <ComboBuscador
                              data={colaboradores}
                              value={getValue(compromisosBorrador[index], ["Responsable", "responsable"]) || ""}
                              onSelect={(colaborador) => {
                                const nombre = getNombreCompleto(colaborador) || colaborador.personalizado || "";
                                actualizarCompromisoEditado(index, "Responsable", nombre);
                              }}
                            />
                          </div>

                          <div className="compromiso-field">
                            <label className="compromiso-label">Fecha Límite</label>
                            <input
                              type="date"
                              className="input"
                              value={getValue(compromisosBorrador[index], ["FechaLimite", "fechaLimite", "fecha"]) || ""}
                              onChange={(e) => actualizarCompromisoEditado(index, "FechaLimite", e.target.value)}
                            />
                          </div>

                          <div className="compromiso-field">
                            <label className="compromiso-label">Clasificación</label>
                            <select
                              className="input"
                              value={getValue(compromisosBorrador[index], ["Clasificacion", "clasificacion"]) || "Sin clasificar"}
                              onChange={(e) => actualizarCompromisoEditado(index, "Clasificacion", e.target.value)}
                            >
                              <option>Sin clasificar</option>
                              <option>Ágil</option>
                              <option>Proyecto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No hay compromisos registrados para esta visita.</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-primary" 
                onClick={guardarCambios} 
                type="button"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

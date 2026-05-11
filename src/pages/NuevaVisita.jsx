import { useEffect, useState } from "react";

const getNombreCompleto = (c) => {
  if (c.NombreCompleto) return c.NombreCompleto;
  return [c.Nombre, c.ApellidoPaterno, c.ApellidoMaterno, c.nombre, c.apellidoPaterno, c.apellidoMaterno]
    .filter(Boolean)
    .join(" ")
    .trim();
};

const getEmail = (c) => {
  const emailField = Object.keys(c).find(key => /correo|email/i.test(key));
  return emailField ? c[emailField] || "" : "";
};

const UNIDADES = [
  "TM Aguascalientes",
  "TM Altamira",
  "TM Arca Occidente",
  "TM Arca Saltillo",
  "TM CDMX",
  "TM El Salto",
  "TM Escobedo",
  "TM Guadalajara",
  "TM Guanajuato",
  "TM Lázaro Cárdenas",
  "TM Manzanillo",
  "TM Meoqui",
  "TM Piedras Negras",
  "TM Toluca",
  "TM Veracruz"
];

/* 🔍 BUSCADOR */
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
        }}
      />

      {mostrar && filtrados.length > 0 && (
        <div className="dropdown">
          {filtrados.slice(0, 8).map((c, i) => (
            <div
              key={i}
              className="dropdown-item"
              onMouseDown={() => {
                onSelect(c);
                setBusqueda(getNombreCompleto(c));
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

/* 🔘 OPCIONES */
function Opcion({ value, selected, onClick }) {
  return (
    <button
      className={selected ? "opcion selected" : "opcion"}
      onClick={() => onClick(value)}
      type="button"
    >
      {value}
    </button>
  );
}

export default function NuevaVisita() {

  const [colaboradores, setColaboradores] = useState([]);

  const [tipoGemba, setTipoGemba] = useState("Cascada");

  const [form, setForm] = useState({
    colaborador: "",
    empleado: "",
    unidad: "",
    area: "",
    correo: "",

    lider: "",
    liderEmpleado: "",
    liderUnidad: "",
    liderArea: "",
    liderCorreo: "",

    nivel: ""
  });

  /* CASCADA */
  const [cascada, setCascada] = useState({
    p1: "", p2: "", p3: "", p4: "",
    p5: "", p6: "", p7: "", p8: []
  });

  /* GERENCIAL */
  const [gerencial, setGerencial] = useState({
    g1: "", g1_text: "",
    g2: "", g2_text: "",
    g3: "",
    g4: "", g4_text: "",
    g5: "", g5_text: "",
    g6: ""
  });

  /* COMPROMISOS */
const [compromisos, setCompromisos] = useState([
  { id: 1, texto: "", responsable: "", fecha: "", clasificacion: "Sin clasificar" }
]);
  useEffect(() => {
    fetch("http://localhost:3001/colaboradores")
      .then(res => res.json())
      .then(data => setColaboradores(data));
  }, []);

  const agregarCompromiso = () => {
  setCompromisos(prev => [
    ...prev,
    {
      id: Date.now(),
      texto: "",
      responsable: "",
      fecha: "",
      clasificacion: "Sin clasificar"
    }
  ]);
};

const eliminarCompromiso = (id) => {
  setCompromisos(prev => prev.filter(c => c.id !== id));
};

const actualizarCampo = (id, campo, valor) => {
  setCompromisos(prev =>
    prev.map(c =>
      c.id === id ? { ...c, [campo]: valor } : c
    )
  );
};

  /* GUARDAR */
  const guardar = async () => {
    const compromisosTransformados = compromisos.map(c => ({
      texto: c.texto?.trim() || "",
      Descripcion: c.texto?.trim() || "",
      descripcion: c.texto?.trim() || "",
      Responsable: c.responsable?.trim() || null,
      responsable: c.responsable?.trim() || null,
      FechaLimite: c.fecha || null,
      fechaLimite: c.fecha || null,
      fecha: c.fecha || null,
      Clasificacion: c.clasificacion || "Sin clasificar",
      clasificacion: c.clasificacion || "Sin clasificar"
    }));

    const payload = {
      ...form,
      Correo: form.correo || null,
      LiderCorreo: form.liderCorreo || null,
      TipoGemba: tipoGemba || "Cascada",
      tipoGemba: tipoGemba || "Cascada",
      cascada: tipoGemba === "Cascada" ? cascada : null,
      gerencial: tipoGemba === "Gerencial" ? gerencial : null,
      Compromisos: compromisosTransformados,
      compromisos: compromisosTransformados
    };

    console.log("Payload enviado:", payload);

    try {
      const response = await fetch("http://localhost:3001/visitas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }

      console.log("Respuesta del servidor:", result);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      alert("Guardado ✅");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la visita");
    }
  };

  return (
    <div className="page-content">

      <div className="page-hero">
        <div>
          <h1 className="hero-title">Nueva Visita Gemba</h1>
          <p className="hero-description">Completa el instrumento de campo y declara los compromisos de mejora al cierre.</p>
        </div>
      </div>

      <div className="page-top">
        <div className="type-toggle">
          <button
            className={tipoGemba === "Cascada" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setTipoGemba("Cascada")}
            type="button"
          >
            Cascada
          </button>
          <button
            className={tipoGemba === "Gerencial" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setTipoGemba("Gerencial")}
            type="button"
          >
            Gerencial
          </button>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-header">
          <span className="section-tag">Datos de la visita</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <h3>Colaborador</h3>
            <ComboBuscador
              data={colaboradores}
              value={form.colaborador}
              onSelect={(c) => {
                const nombre = c.NombreCompleto || [c.Nombre, c.ApellidoPaterno, c.ApellidoMaterno, c.nombre, c.apellidoPaterno, c.apellidoMaterno]
                  .filter(Boolean)
                  .join(" ")
                  .trim();
                setForm(p => ({
                  ...p,
                  colaborador: nombre,
                  empleado: c.NumeroEmpleado || c.numeroEmpleado || "",
                  unidad: UNIDADES.includes(c.UnidadNegocio || c.unidadNegocio || "")
                    ? c.UnidadNegocio || c.unidadNegocio
                    : "",
                  area: c.Area || c.area || "",
                  correo: getEmail(c)
                }));
              }}
            />

            <div className="form-field">
              <label>Unidad</label>
              <select
                className="input"
                value={form.unidad}
                onChange={(e) => setForm(p => ({ ...p, unidad: e.target.value }))}
              >
                <option value="">Seleccionar unidad</option>
                {UNIDADES.map((unidad) => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>

            <div className="summary-list">
              <p><span>Empleado:</span> {form.empleado}</p>
              <p><span>Área:</span> {form.area}</p>
              <p><span>Correo:</span> {form.correo}</p>
            </div>
          </div>

          <div className="form-group">
            <h3>Líder</h3>
            <ComboBuscador
              data={colaboradores}
              value={form.lider}
              onSelect={(c) => {
                const nombre = c.NombreCompleto || [c.Nombre, c.ApellidoPaterno, c.ApellidoMaterno, c.nombre, c.apellidoPaterno, c.apellidoMaterno]
                  .filter(Boolean)
                  .join(" ")
                  .trim();
                setForm(p => ({
                  ...p,
                  lider: nombre,
                  liderEmpleado: c.NumeroEmpleado || c.numeroEmpleado || "",
                  liderUnidad: c.UnidadNegocio || c.unidadNegocio || "",
                  liderArea: c.Area || c.area || "",
                  liderCorreo: getEmail(c)
                }));
              }}
            />
            <div className="summary-list">
              <p><span>Empleado:</span> {form.liderEmpleado}</p>
              <p><span>Unidad:</span> {form.liderUnidad}</p>
              <p><span>Área:</span> {form.liderArea}</p>
              <p><span>Correo:</span> {form.liderCorreo}</p>
            </div>

            <div className="form-field">
              <label>Nivel</label>
              <select className="input"
                value={form.nivel}
                onChange={(e) => setForm(p => ({ ...p, nivel: e.target.value }))}>
                <option value="">Seleccionar nivel</option>
                <option>Gerente</option>
                <option>Coordinador</option>
                <option>Ingeniero</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gemba */}
{tipoGemba === "Cascada" && (
  <div className="card">
    <h3>Gemba Cascada</h3>

    <label className="pregunta">¿Qué actividad estás realizando?</label>
    <textarea className="input"
      placeholder="Describe la actividad observada..."
      onChange={(e) => setCascada(p => ({ ...p, p1: e.target.value }))} />

    <label className="pregunta">¿Tienes un punto de control definido?</label>
    <div className="grupo-opciones">
      {["Sí, está definido", "Parcialmente", "No existe"].map(op => (
        <Opcion key={op}
          value={op}
          selected={cascada.p2 === op}
          onClick={(v) => setCascada(p => ({ ...p, p2: v }))} />
      ))}
    </div>

    <label className="pregunta">¿A cuál KPI impacta?</label>
    <textarea className="input"
      placeholder="KPI o indicador..."
      onChange={(e) => setCascada(p => ({ ...p, p3: e.target.value }))} />

    <label className="pregunta">¿Qué mejorarías?</label>
    <textarea className="input"
      placeholder="Área de mejora..."
      onChange={(e) => setCascada(p => ({ ...p, p4: e.target.value }))} />

    <label className="pregunta">¿Está en tu agenda?</label>
    <div className="grupo-opciones">
      {["Sí, está planeada", "Surgió espontáneo", "Sin agenda"].map(op => (
        <Opcion key={op}
          value={op}
          selected={cascada.p5 === op}
          onClick={(v) => setCascada(p => ({ ...p, p5: v }))} />
      ))}
    </div>

    <label className="pregunta">¿Existe procedimiento?</label>
    <div className="grupo-opciones">
      {["Sí lo conoce", "Existe pero no lo usa", "No existe"].map(op => (
        <Opcion key={op}
          value={op}
          selected={cascada.p6 === op}
          onClick={(v) => setCascada(p => ({ ...p, p6: v }))} />
      ))}
    </div>

    <label className="pregunta">Propuesta de mejora</label>
    <textarea className="input"
      placeholder="Ideas del colaborador..."
      onChange={(e) => setCascada(p => ({ ...p, p7: e.target.value }))} />

    <label className="pregunta">Desperdicios detectados</label>
    <div className="grupo-opciones">
      {["Tiempos", "Reprocesos", "Traslados", "Inventario", "Ninguno"].map(op => (
        <Opcion key={op}
          value={op}
          selected={cascada.p8.includes(op)}
          onClick={(v) => {
            let arr = [...cascada.p8];
            arr.includes(v) ? arr = arr.filter(x => x !== v) : arr.push(v);
            setCascada(p => ({ ...p, p8: arr }));
          }} />
      ))}
    </div>
  </div>
)}
      {tipoGemba === "Gerencial" && (
  <div className="card">
    <h3>Gemba Gerencial</h3>

    <label className="pregunta">
      ¿Recibiste la capacitación necesaria antes de iniciar?
    </label>
    <div className="grupo-opciones">
      {["Sí, completa", "Parcialmente", "No la recibí"].map(op => (
        <Opcion key={op}
          value={op}
          selected={gerencial.g1 === op}
          onClick={(v) => setGerencial(p => ({ ...p, g1: v }))} />
      ))}
    </div>

    <textarea className="input"
      placeholder="Notas adicionales..."
      onChange={(e) => setGerencial(p => ({ ...p, g1_text: e.target.value }))} />

    <label className="pregunta">
      ¿Has tenido que adaptar actividades fuera del procedimiento?
    </label>
    <div className="grupo-opciones">
      {["No, sigo el procedimiento", "Algunas veces", "Frecuentemente"].map(op => (
        <Opcion key={op}
          value={op}
          selected={gerencial.g2 === op}
          onClick={(v) => setGerencial(p => ({ ...p, g2: v }))} />
      ))}
    </div>

    <textarea className="input"
      placeholder="¿Qué adaptas y por qué?"
      onChange={(e) => setGerencial(p => ({ ...p, g2_text: e.target.value }))} />

    <label className="pregunta">
      ¿Hay retrasos o malentendidos frecuentes?
    </label>
    <textarea className="input"
      placeholder="Describe..."
      onChange={(e) => setGerencial(p => ({ ...p, g3: e.target.value }))} />

    <label className="pregunta">
      ¿Cuentas con lo necesario para trabajar?
    </label>
    <div className="grupo-opciones">
      {["Todo disponible", "Faltan algunos", "Frecuentemente improviso"].map(op => (
        <Opcion key={op}
          value={op}
          selected={gerencial.g4 === op}
          onClick={(v) => setGerencial(p => ({ ...p, g4: v }))} />
      ))}
    </div>

    <textarea className="input"
      placeholder="¿Qué recursos faltan?"
      onChange={(e) => setGerencial(p => ({ ...p, g4_text: e.target.value }))} />

    <label className="pregunta">
      ¿Situaciones inseguras detectadas?
    </label>
    <div className="grupo-opciones">
      {["No, todo seguro", "He visto riesgos", "Situación urgente"].map(op => (
        <Opcion key={op}
          value={op}
          selected={gerencial.g5 === op}
          onClick={(v) => setGerencial(p => ({ ...p, g5: v }))} />
      ))}
    </div>

    <textarea className="input"
      placeholder="Describe situación..."
      onChange={(e) => setGerencial(p => ({ ...p, g5_text: e.target.value }))} />

    <label className="pregunta">
      ¿Te escuchan cuando propones ideas?
    </label>
    <div className="grupo-opciones">
      {["Sí, siempre", "A veces", "No hay canal"].map(op => (
        <Opcion key={op}
          value={op}
          selected={gerencial.g6 === op}
          onClick={(v) => setGerencial(p => ({ ...p, g6: v }))} />
      ))}
    </div>
  </div>
)}

      {/* COMPROMISOS */}
      <div className="card section-card">
        <div className="section-header">
          <span className="section-tag-red">Cierre obligatorio - Compromisos de mejora</span>
        </div>

        {compromisos.map((c) => (
          <div key={c.id} className="compromiso-card">
            <button 
              className="compromiso-delete-btn"
              onClick={() => eliminarCompromiso(c.id)}
              type="button"
              title="Eliminar compromiso"
            >
              ✕
            </button>

            <div className="compromiso-field">
              <label className="compromiso-label">Descripción</label>
              <textarea className="input"
                placeholder="Describe el compromiso de mejora..."
                value={c.texto || ""}
                onChange={(e) => actualizarCampo(c.id, "texto", e.target.value)} />
            </div>

            <div className="compromiso-grid">
              <div className="compromiso-field">
                <label className="compromiso-label">Responsable</label>
                <ComboBuscador
                  data={colaboradores}
                  value={c.responsable}
                  onSelect={(col) =>
                    actualizarCampo(c.id, "responsable", getNombreCompleto(col))
                  }
                />
              </div>

              <div className="compromiso-field">
                <label className="compromiso-label">Fecha Límite</label>
                <input 
                  type="date" 
                  className="input"
                  value={c.fecha || ""}
                  onChange={(e) => actualizarCampo(c.id, "fecha", e.target.value)}
                  required
                />
              </div>

              <div className="compromiso-field">
                <label className="compromiso-label">Clasificación</label>
                <select className="input"
                  value={c.clasificacion || "Sin clasificar"}
                  onChange={(e) => actualizarCampo(c.id, "clasificacion", e.target.value)}>
                  <option>Sin clasificar</option>
                  <option>Ágil</option>
                  <option>Proyecto</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="compromiso-add">
          <button 
            className="compromiso-add-btn"
            onClick={agregarCompromiso}
            type="button"
          >
            + Agregar compromiso
          </button>
        </div>
      </div>

      {/* NIVEL */}
      <div className="form-actions">
        <button className="btn-primary" onClick={guardar}>
          Guardar Visita
        </button>
      </div>
    </div>
  );
}
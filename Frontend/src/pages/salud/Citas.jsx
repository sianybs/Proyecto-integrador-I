import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const FORM_VACIO = {
  Fecha: "",
  Hora: "",
  Motivo: "",
  IdMascota: "",
};

const HORARIOS_DISPONIBLES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

const ESTADOS_FINALES = ["Cancelada", "Atendida"];

function obtenerFechaActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function horarioYaPaso(fecha, hora) {
  if (!fecha) return false;

  const fechaHoraCita = new Date(`${fecha}T${hora}:00`);
  return fechaHoraCita <= new Date();
}

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [fechaReporte, setFechaReporte] = useState("");
  const [mostrandoReporte, setMostrandoReporte] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError("");

    try {
      const [resCitas, resMascotas] = await Promise.all([
        axiosClient.get("/citas"),
        axiosClient.get("/mascotas"),
      ]);

      setCitas(resCitas.data);
      setMascotas(resMascotas.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudieron cargar las citas",
      );
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
      ...(name === "Fecha" ? { Hora: "" } : {}),
    });
  }

  // Agendar es lo único que arma este formulario. La cita, una vez creada,
  // solo cambia de estado a través de acciones explícitas (Cancelar) — nunca
  // editando el campo Estado directo, para no repetir el bug de reabrir una
  // cita ya atendida.
  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const payload = {
        ...form,
        IdMascota: Number(form.IdMascota),
      };

      await axiosClient.post("/citas", payload);
      setForm(FORM_VACIO);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo agendar la cita");
    } finally {
      setGuardando(false);
    }
  }

  // Usa el endpoint especial de cancelar (no el genérico de estado):
  // el backend valida ahí mismo la regla de "más de 1 hora de anticipación"
  // y bloquea cancelar citas ya atendidas o ya canceladas.
  async function cancelar(cita) {
    const confirmar = window.confirm(
      `¿Cancelar la cita de ${cita.NombreMascota} (${cita.Fecha.slice(0, 10)} ${cita.Hora})?`,
    );

    if (!confirmar) return;

    setError("");

    try {
      await axiosClient.patch(`/citas/${cita.IdCita}/cancelar`);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cancelar la cita");
    }
  }

  async function consultarCitasPorFecha(e) {
    e.preventDefault();

    if (!fechaReporte) return;

    setCargando(true);
    setError("");

    try {
      const { data } = await axiosClient.get(`/citas/fecha/${fechaReporte}`);

      setCitas(data);
      setMostrandoReporte(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo generar el reporte de citas",
      );
    } finally {
      setCargando(false);
    }
  }

  async function mostrarTodasLasCitas() {
    setFechaReporte("");
    setMostrandoReporte(false);
    await cargarTodo();
  }

  return (
    <div className="crud-pagina">
      <h1>Citas</h1>

      {error && <p className="mensaje-error">{error}</p>}

      <form className="crud-form" onSubmit={manejarSubmit}>
        <h2>Agendar cita</h2>

        <div className="crud-form-grid">
          <label>
            Fecha
            <input
              type="date"
              name="Fecha"
              value={form.Fecha}
              onChange={manejarCambio}
              min={obtenerFechaActual()}
              required
            />
          </label>

          <label>
            Hora
            <select
              name="Hora"
              value={form.Hora}
              onChange={manejarCambio}
              disabled={
                form.Fecha &&
                HORARIOS_DISPONIBLES.every((hora) =>
                  horarioYaPaso(form.Fecha, hora),
                )
              }
              required
            >
              <option value="">Selecciona un horario...</option>

              {HORARIOS_DISPONIBLES.filter(
                (hora) => !horarioYaPaso(form.Fecha, hora),
              ).map((hora) => (
                <option key={hora} value={hora}>
                  {hora}
                </option>
              ))}
            </select>
            {form.Fecha &&
              HORARIOS_DISPONIBLES.every((hora) =>
                horarioYaPaso(form.Fecha, hora),
              ) && (
                <span className="mensaje-error">
                  Ya no hay horarios disponibles para este día.
                </span>
              )}
          </label>

          <label>
            Motivo
            <input
              name="Motivo"
              value={form.Motivo}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Mascota
            <select
              name="IdMascota"
              value={form.IdMascota}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona una mascota...</option>

              {mascotas.map((m) => (
                <option key={m.IdMascota} value={m.IdMascota}>
                  {m.Nombre} ({m.NombreDueno})
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mensaje-aviso">
          Horario de atención: 8:00 a.m. a 4:00 p.m.
        </p>

        {mascotas.length === 0 && !cargando && (
          <p className="mensaje-aviso">
            Todavía no hay mascotas registradas — creá una primero en la
            pantalla de Mascotas.
          </p>
        )}

        <div className="crud-form-botones">
          <button type="submit" disabled={guardando || mascotas.length === 0}>
            {guardando ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </form>

      <form className="crud-busqueda" onSubmit={consultarCitasPorFecha}>
        <input
          type="date"
          value={fechaReporte}
          onChange={(e) => {
            setFechaReporte(e.target.value);
            setMostrandoReporte(false);
          }}
          required
        />

        <button type="submit" disabled={!fechaReporte}>
          Consultar citas por fecha
        </button>

        {mostrandoReporte && (
          <button
            type="button"
            className="btn-secundario"
            onClick={mostrarTodasLasCitas}
          >
            Mostrar todas
          </button>
        )}
      </form>

      {mostrandoReporte && <h2>Reporte de citas del {fechaReporte}</h2>}

      {cargando ? (
        <p>Cargando...</p>
      ) : citas.length === 0 ? (
        <p>
  {mostrandoReporte
    ? `No hay citas registradas para el ${fechaReporte}.`
    : 'No hay citas agendadas todavía.'}
</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {citas.map((cita) => (
              <tr key={cita.IdCita}>
                <td>{cita.Fecha.slice(0, 10)}</td>
                <td>{cita.Hora}</td>
                <td>{cita.NombreMascota}</td>
                <td>{cita.NombreDueno}</td>
                <td>{cita.Motivo}</td>
                <td>{cita.Estado}</td>

                <td className="crud-tabla-acciones">
                  {!ESTADOS_FINALES.includes(cita.Estado) && (
                    <button
                      className="btn-peligro"
                      onClick={() => cancelar(cita)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const FORM_VACIO = {
  Fecha: "",
  Diagnostico: "",
  Tratamiento: "",
  Observaciones: "",
  IdCita: "",
};

// Solo tiene sentido registrar una atención sobre una cita que todavía
// no fue atendida ni cancelada.
const ESTADOS_ELEGIBLES = ["Pendiente", "Reprogramada"];

export default function Atenciones() {
  const [atenciones, setAtenciones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [idMascotaHistorial, setIdMascotaHistorial] = useState("");
  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(FORM_VACIO);
  const [idEditando, setIdEditando] = useState(null); // null = creando, no editando
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError("");
    try {
      const [resAtenciones, resCitas, resMascotas] = await Promise.all([
        axiosClient.get("/atenciones"),
        axiosClient.get("/citas"),
        axiosClient.get("/mascotas"),
      ]);

      setAtenciones(resAtenciones.data);
      setCitas(resCitas.data);
      setMascotas(resMascotas.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudieron cargar las atenciones",
      );
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function empezarEdicion(atencion) {
    setIdEditando(atencion.IdAtencion);
    setForm({
      Fecha: atencion.Fecha.slice(0, 10),
      Diagnostico: atencion.Diagnostico,
      Tratamiento: atencion.Tratamiento,
      Observaciones: atencion.Observaciones,
      IdCita: atencion.IdCita, // no se edita, solo se muestra
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setIdEditando(null);
    setForm(FORM_VACIO);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      if (idEditando) {
        // La cita de una atención ya registrada no se cambia, solo el
        // diagnóstico/tratamiento/observaciones/fecha.
        const { IdCita, ...datosEditables } = form;
        await axiosClient.put(`/atenciones/${idEditando}`, datosEditables);
      } else {
        const payload = { ...form, IdCita: Number(form.IdCita) };
        await axiosClient.post("/atenciones", payload);
      }
      setForm(FORM_VACIO);
      setIdEditando(null);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo guardar la atención");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(atencion) {
    const confirmar = window.confirm(
      `¿Eliminar la atención de ${atencion.NombreMascota} del ${atencion.Fecha.slice(0, 10)}?`,
    );
    if (!confirmar) return;

    setError("");
    try {
      await axiosClient.delete(`/atenciones/${atencion.IdAtencion}`);
      await cargarTodo();
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo eliminar la atención",
      );
    }
  }

  async function consultarHistorial(e) {
    e.preventDefault();

    if (!idMascotaHistorial) return;

    setCargando(true);
    setError("");

    try {
      const { data } = await axiosClient.get(
        `/atenciones/mascota/${idMascotaHistorial}`,
      );

      setAtenciones(data);
      setMostrandoHistorial(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo consultar el historial médico",
      );
    } finally {
      setCargando(false);
    }
  }

  async function mostrarTodasLasAtenciones() {
    setIdMascotaHistorial("");
    setMostrandoHistorial(false);
    await cargarTodo();
  }

  function obtenerNombreMascota(atencion) {
    if (atencion.NombreMascota) {
      return atencion.NombreMascota;
    }

    const mascota = mascotas.find(
      (item) => item.IdMascota === Number(idMascotaHistorial),
    );

    return mascota ? mascota.Nombre : "Mascota";
  }

  const citasElegibles = citas.filter((c) =>
    ESTADOS_ELEGIBLES.includes(c.Estado),
  );

  return (
    <div className="crud-pagina">
      <h1>Atención veterinaria</h1>

      {error && <p className="mensaje-error">{error}</p>}

      <form className="crud-form" onSubmit={manejarSubmit}>
        <h2>{idEditando ? "Editar atención" : "Registrar atención"}</h2>

        <div className="crud-form-grid">
          <label>
            Fecha
            <input
              type="date"
              name="Fecha"
              value={form.Fecha}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Diagnóstico
            <input
              name="Diagnostico"
              value={form.Diagnostico}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Tratamiento
            <input
              name="Tratamiento"
              value={form.Tratamiento}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Observaciones
            <input
              name="Observaciones"
              value={form.Observaciones}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Cita
            {idEditando ? (
              // La cita ya quedó fija al crear la atención; no se reasigna al editar.
              <input
                value={
                  citas.find((c) => c.IdCita === form.IdCita)
                    ? `${citas.find((c) => c.IdCita === form.IdCita).NombreMascota} — ${citas
                        .find((c) => c.IdCita === form.IdCita)
                        .Fecha.slice(0, 10)}`
                    : `Cita #${form.IdCita}`
                }
                disabled
              />
            ) : (
              <select
                name="IdCita"
                value={form.IdCita}
                onChange={manejarCambio}
                required
              >
                <option value="">Selecciona una cita pendiente...</option>
                {citasElegibles.map((c) => (
                  <option key={c.IdCita} value={c.IdCita}>
                    {c.NombreMascota} — {c.Fecha.slice(0, 10)} {c.Hora} (
                    {c.Motivo})
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        {citasElegibles.length === 0 && !cargando && !idEditando && (
          <p className="mensaje-aviso">
            No hay citas pendientes o reprogramadas para atender — agendá o
            revisá una en la pantalla de Citas.
          </p>
        )}

        <div className="crud-form-botones">
          <button
            type="submit"
            disabled={guardando || (!idEditando && citasElegibles.length === 0)}
          >
            {guardando
              ? "Guardando..."
              : idEditando
                ? "Guardar cambios"
                : "Registrar atención"}
          </button>
          {idEditando && (
            <button
              type="button"
              className="btn-secundario"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <form className="crud-busqueda" onSubmit={consultarHistorial}>
        <select
          value={idMascotaHistorial}
          onChange={(e) => {
            setIdMascotaHistorial(e.target.value);
            setMostrandoHistorial(false);
          }}
          required
        >
          <option value="">Selecciona una mascota...</option>

          {mascotas.map((mascota) => (
            <option key={mascota.IdMascota} value={mascota.IdMascota}>
              {mascota.Nombre} ({mascota.NombreDueno})
            </option>
          ))}
        </select>

        <button type="submit" disabled={!idMascotaHistorial}>
          Consultar historial
        </button>

        {mostrandoHistorial && (
          <button
            type="button"
            className="btn-secundario"
            onClick={mostrarTodasLasAtenciones}
          >
            Mostrar todas
          </button>
        )}
      </form>

      {mostrandoHistorial && (
        <h2>Historial médico de la mascota seleccionada</h2>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : atenciones.length === 0 ? (
        <p>No hay atenciones registradas todavía.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Mascota</th>
              <th>Diagnóstico</th>
              <th>Tratamiento</th>
              <th>Observaciones</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {atenciones.map((atencion) => (
              <tr key={atencion.IdAtencion}>
                <td>{atencion.Fecha.slice(0, 10)}</td>
                <td>{obtenerNombreMascota(atencion)}</td>
                <td>{atencion.Diagnostico}</td>
                <td>{atencion.Tratamiento}</td>
                <td>{atencion.Observaciones}</td>
                <td className="crud-tabla-acciones">
                  <button
                    className="btn-secundario"
                    onClick={() => empezarEdicion(atencion)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-peligro"
                    onClick={() => eliminar(atencion)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

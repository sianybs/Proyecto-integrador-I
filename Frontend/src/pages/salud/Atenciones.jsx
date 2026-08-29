import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const FORM_VACIO = {
  Fecha: "",
  Diagnostico: "",
  Tratamiento: "",
  Observaciones: "",
  IdCita: "",
};

const REPORTE_VACIO = {
  totalPacientesAtendidos: 0,
  detalle: [],
};

const ESTADOS_ELEGIBLES = [
  "Pendiente",
  "Reprogramada",
];

export default function Atenciones() {
  const [atenciones, setAtenciones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);

  const [idMascotaHistorial, setIdMascotaHistorial] =
    useState("");
  const [mostrandoHistorial, setMostrandoHistorial] =
    useState(false);

  const [reporte, setReporte] = useState(REPORTE_VACIO);
  const [mostrandoReporte, setMostrandoReporte] =
    useState(false);
  const [cargandoReporte, setCargandoReporte] =
    useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(FORM_VACIO);
  const [idEditando, setIdEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    setError("");

    try {
      const [
        resAtenciones,
        resCitas,
        resMascotas,
      ] = await Promise.all([
        axiosClient.get("/atenciones"),
        axiosClient.get("/citas"),
        axiosClient.get("/mascotas"),
      ]);

      setAtenciones(resAtenciones.data);
      setCitas(resCitas.data);
      setMascotas(resMascotas.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las atenciones"
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
  let componenteActivo = true;

  Promise.all([
    axiosClient.get('/atenciones'),
    axiosClient.get('/citas'),
    axiosClient.get('/mascotas'),
  ])
    .then(
      ([
        resAtenciones,
        resCitas,
        resMascotas,
      ]) => {
        if (!componenteActivo) {
          return;
        }

        setAtenciones(resAtenciones.data);
        setCitas(resCitas.data);
        setMascotas(resMascotas.data);
      }
    )
    .catch((err) => {
      if (componenteActivo) {
        setError(
          err.response?.data?.message ||
            'No se pudieron cargar las atenciones'
        );
      }
    })
    .finally(() => {
      if (componenteActivo) {
        setCargando(false);
      }
    });

  return () => {
    componenteActivo = false;
  };
}, []);

  function manejarCambio(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function empezarEdicion(atencion) {
    setIdEditando(atencion.IdAtencion);

    setForm({
      Fecha: atencion.Fecha.slice(0, 10),
      Diagnostico: atencion.Diagnostico,
      Tratamiento: atencion.Tratamiento,
      Observaciones: atencion.Observaciones,
      IdCita: atencion.IdCita,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
        const datosEditables = {
          Fecha: form.Fecha,
          Diagnostico: form.Diagnostico,
          Tratamiento: form.Tratamiento,
          Observaciones: form.Observaciones,
        };

        await axiosClient.put(
          `/atenciones/${idEditando}`,
          datosEditables
        );
      } else {
        const payload = {
          ...form,
          IdCita: Number(form.IdCita),
        };

        await axiosClient.post(
          "/atenciones",
          payload
        );
      }

      setForm(FORM_VACIO);
      setIdEditando(null);
      setMostrandoReporte(false);
      await cargarTodo();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo guardar la atención"
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(atencion) {
    const confirmar = window.confirm(
      `¿Eliminar la atención de ${
        atencion.NombreMascota
      } del ${atencion.Fecha.slice(0, 10)}?`
    );

    if (!confirmar) {
      return;
    }

    setError("");

    try {
      await axiosClient.delete(
        `/atenciones/${atencion.IdAtencion}`
      );

      setMostrandoReporte(false);
      await cargarTodo();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo eliminar la atención"
      );
    }
  }

  async function consultarHistorial(e) {
    e.preventDefault();

    if (!idMascotaHistorial) {
      return;
    }

    setCargando(true);
    setError("");
    setMostrandoReporte(false);

    try {
      const { data } = await axiosClient.get(
        `/atenciones/mascota/${idMascotaHistorial}`
      );

      setAtenciones(data);
      setMostrandoHistorial(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo consultar el historial médico"
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

  async function cargarReportePacientes() {
    setCargandoReporte(true);
    setError("");

    try {
      const { data } = await axiosClient.get(
        "/atenciones/reporte"
      );

      setReporte({
        totalPacientesAtendidos:
          data.totalPacientesAtendidos || 0,
        detalle: data.detalle || [],
      });

      setMostrandoReporte(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo generar el reporte de pacientes atendidos"
      );
    } finally {
      setCargandoReporte(false);
    }
  }

  function cerrarReporte() {
    setMostrandoReporte(false);
    setReporte(REPORTE_VACIO);
  }

  function obtenerNombreMascota(atencion) {
    if (atencion.NombreMascota) {
      return atencion.NombreMascota;
    }

    const mascota = mascotas.find(
      (item) =>
        item.IdMascota ===
        Number(idMascotaHistorial)
    );

    return mascota
      ? mascota.Nombre
      : "Mascota";
  }

  function obtenerDescripcionCita() {
    const cita = citas.find(
      (item) => item.IdCita === form.IdCita
    );

    if (!cita) {
      return `Cita #${form.IdCita}`;
    }

    return `${
      cita.NombreMascota
    } — ${cita.Fecha.slice(0, 10)}`;
  }

  const citasElegibles = citas.filter((cita) =>
    ESTADOS_ELEGIBLES.includes(cita.Estado)
  );

  return (
    <div className="crud-pagina">
      <h1>Atención veterinaria</h1>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      <form
        className="crud-form"
        onSubmit={manejarSubmit}
      >
        <h2>
          {idEditando
            ? "Editar atención"
            : "Registrar atención"}
        </h2>

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
              <input
                value={obtenerDescripcionCita()}
                disabled
              />
            ) : (
              <select
                name="IdCita"
                value={form.IdCita}
                onChange={manejarCambio}
                required
              >
                <option value="">
                  Selecciona una cita pendiente...
                </option>

                {citasElegibles.map((cita) => (
                  <option
                    key={cita.IdCita}
                    value={cita.IdCita}
                  >
                    {cita.NombreMascota} —{" "}
                    {cita.Fecha.slice(0, 10)}{" "}
                    {cita.Hora} ({cita.Motivo})
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        {citasElegibles.length === 0 &&
          !cargando &&
          !idEditando && (
            <p className="mensaje-aviso">
              No hay citas pendientes o reprogramadas
              para atender. Agenda o revisa una en la
              pantalla de Citas.
            </p>
          )}

        <div className="crud-form-botones">
          <button
            type="submit"
            disabled={
              guardando ||
              (!idEditando &&
                citasElegibles.length === 0)
            }
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

      <form
        className="crud-busqueda"
        onSubmit={consultarHistorial}
      >
        <select
          value={idMascotaHistorial}
          onChange={(e) => {
            setIdMascotaHistorial(
              e.target.value
            );
            setMostrandoHistorial(false);
          }}
          required
        >
          <option value="">
            Selecciona una mascota...
          </option>

          {mascotas.map((mascota) => (
            <option
              key={mascota.IdMascota}
              value={mascota.IdMascota}
            >
              {mascota.Nombre} (
              {mascota.NombreDueno})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!idMascotaHistorial}
        >
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

      <section className="crud-form">
        <div className="crud-form-botones">
          <button
            type="button"
            onClick={cargarReportePacientes}
            disabled={cargandoReporte}
          >
            {cargandoReporte
              ? "Generando reporte..."
              : "Reporte de pacientes atendidos"}
          </button>

          {mostrandoReporte && (
            <button
              type="button"
              className="btn-secundario"
              onClick={cerrarReporte}
            >
              Cerrar reporte
            </button>
          )}
        </div>

        {mostrandoReporte && (
          <div>
            <h2>
              Reporte de pacientes atendidos
            </h2>

            <p className="mensaje-exito">
              Total de pacientes diferentes atendidos:{" "}
              <strong>
                {reporte.totalPacientesAtendidos}
              </strong>
            </p>

            {reporte.detalle.length === 0 ? (
              <p>
                Todavía no hay pacientes atendidos.
              </p>
            ) : (
              <table className="crud-tabla">
                <thead>
                  <tr>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Cantidad de atenciones</th>
                  </tr>
                </thead>

                <tbody>
                  {reporte.detalle.map((paciente) => (
                    <tr key={paciente.IdMascota}>
                      <td>
                        {paciente.NombreMascota}
                      </td>

                      <td>
                        {paciente.NombreDueno}
                      </td>

                      <td>
                        {paciente.CantidadAtenciones}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {mostrandoHistorial && (
        <h2>
          Historial médico de la mascota seleccionada
        </h2>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : atenciones.length === 0 ? (
        <p>
          No hay atenciones registradas todavía.
        </p>
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
                <td>
                  {atencion.Fecha.slice(0, 10)}
                </td>

                <td>
                  {obtenerNombreMascota(atencion)}
                </td>

                <td>
                  {atencion.Diagnostico}
                </td>

                <td>
                  {atencion.Tratamiento}
                </td>

                <td>
                  {atencion.Observaciones}
                </td>

                <td className="crud-tabla-acciones">
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() =>
                      empezarEdicion(atencion)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-peligro"
                    onClick={() =>
                      eliminar(atencion)
                    }
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
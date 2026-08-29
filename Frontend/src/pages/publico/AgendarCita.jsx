import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";

const NUEVA_MASCOTA = "__nueva__";

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

function obtenerFechaActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function horarioYaPaso(fecha, hora) {
  if (!fecha) return false;

  return new Date(`${fecha}T${hora}:00`) <= new Date();
}

const MASCOTA_VACIA = {
  Nombre: "",
  Especie: "",
  Raza: "",
  EdadAnimal: "",
};

export default function AgendarCita() {
  const { usuario } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState("");
  const [nuevaMascota, setNuevaMascota] = useState(MASCOTA_VACIA);

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    axiosClient
      .get(`/mascotas/cliente/${usuario.id}`)
      .then(({ data }) => {
        setMascotas(data);
        setMascotaSeleccionada(
          data.length > 0 ? String(data[0].IdMascota) : NUEVA_MASCOTA,
        );
      })
      .catch(() => setError("No se pudieron cargar tus mascotas"))
      .finally(() => setCargandoMascotas(false));
  }, [usuario.id]);

  function manejarCambioMascota(e) {
    setNuevaMascota({ ...nuevaMascota, [e.target.name]: e.target.value });
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");

    if (hora < "08:00" || hora > "16:00") {
      setError(
        "Las citas solo se pueden agendar entre las 8:00 a.m. y las 4:00 p.m.",
      );
      return;
    }

    setGuardando(true);
    try {
      let idMascota = mascotaSeleccionada;

      if (mascotaSeleccionada === NUEVA_MASCOTA) {
        const { data } = await axiosClient.post("/mascotas", {
          ...nuevaMascota,
          IdCliente: usuario.id,
        });
        idMascota = data.IdMascota;
      }

      await axiosClient.post("/citas", {
        Fecha: fecha,
        Hora: hora,
        Motivo: motivo,
        IdMascota: idMascota,
      });

      setExito(
        "¡Cita agendada correctamente! Te enviamos la confirmación por correo.",
      );
      setFecha("");
      setHora("");
      setMotivo("");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo agendar la cita");
    } finally {
      setGuardando(false);
    }
  }

  const hoy = obtenerFechaActual();

  return (
    <div className="pagina-publica-ancho">
      <form className="form-publico" onSubmit={manejarSubmit}>
        <h1>Agendar cita</h1>
        <p className="subtitulo">
          Elegí a tu mascota y el horario que más te convenga.
        </p>

        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <label>
          Mascota
          {cargandoMascotas ? (
            <span>Cargando tus mascotas...</span>
          ) : (
            <select
              value={mascotaSeleccionada}
              onChange={(e) => setMascotaSeleccionada(e.target.value)}
            >
              {mascotas.map((m) => (
                <option key={m.IdMascota} value={m.IdMascota}>
                  {m.Nombre} ({m.Especie})
                </option>
              ))}
              <option value={NUEVA_MASCOTA}>
                + Registrar una mascota nueva
              </option>
            </select>
          )}
        </label>

        {mascotaSeleccionada === NUEVA_MASCOTA && (
          <div className="form-grid">
            <label>
              Nombre de la mascota
              <input
                name="Nombre"
                value={nuevaMascota.Nombre}
                onChange={manejarCambioMascota}
                required
              />
            </label>

            <label>
              Especie
              <select
                name="Especie"
                value={nuevaMascota.Especie}
                onChange={manejarCambioMascota}
                required
              >
                <option value="">Seleccioná una especie...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Roedor">Roedor</option>
                <option value="Loro">Loro</option>
              </select>
            </label>

            <label>
              Raza
              <input
                name="Raza"
                value={nuevaMascota.Raza}
                onChange={manejarCambioMascota}
              />
            </label>

            <label>
              Edad
              <input
                name="EdadAnimal"
                value={nuevaMascota.EdadAnimal}
                onChange={manejarCambioMascota}
                placeholder="Ej. 2 años"
              />
            </label>
          </div>
        )}

        <div className="form-grid">
          <label>
            Fecha
            <input
              type="date"
              min={hoy}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setHora("");
              }}
              required
            />
          </label>

          <label>
            Hora
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              disabled={
                fecha &&
                HORARIOS_DISPONIBLES.every((horario) =>
                  horarioYaPaso(fecha, horario),
                )
              }
              required
            >
              <option value="">Seleccioná un horario...</option>

              {HORARIOS_DISPONIBLES.filter(
                (horario) => !horarioYaPaso(fecha, horario),
              ).map((horario) => (
                <option key={horario} value={horario}>
                  {horario}
                </option>
              ))}
            </select>
            {fecha &&
              HORARIOS_DISPONIBLES.every((horario) =>
                horarioYaPaso(fecha, horario),
              ) && (
                <span className="mensaje-error">
                  Ya no hay horarios disponibles para este día.
                </span>
              )}
          </label>
        </div>

        <label className="ancho-completo">
          Motivo de la cita
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={125}
            required
          />
        </label>

        <div className="form-botones">
          <button type="submit" className="btn btn-rojo" disabled={guardando}>
            {guardando ? "Agendando..." : "Agendar cita"}
          </button>
        </div>
      </form>
    </div>
  );
}

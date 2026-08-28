import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Postulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  async function cargarPostulaciones() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get('/postulaciones');
      setPostulaciones(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudieron cargar las postulaciones'
      );
    } finally {
      setCargando(false);
    }
  }

  async function contratar(postulacion) {
    const confirmar = window.confirm(
      `¿Seguro que querés contratar a ${postulacion.NombreCompleto}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/postulaciones/${postulacion.IdPostulacion}/contratar`
      );

      setMensaje(
        `${data.message}. Correo asignado: ${data.correoAsignado}`
      );

      await cargarPostulaciones();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo contratar a la persona'
      );
    }
  }

  async function rechazar(postulacion) {
    const confirmar = window.confirm(
      `¿Seguro que querés rechazar la postulación de ${postulacion.NombreCompleto}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/postulaciones/${postulacion.IdPostulacion}/rechazar`
      );

      setMensaje(
        data.message || 'Postulación rechazada correctamente'
      );

      await cargarPostulaciones();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo rechazar la postulación'
      );
    }
  }

  async function eliminar(postulacion) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la postulación de ${postulacion.NombreCompleto}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.delete(
        `/postulaciones/${postulacion.IdPostulacion}`
      );

      setMensaje(
        data.message || 'Postulación eliminada correctamente'
      );

      await cargarPostulaciones();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo eliminar la postulación'
      );
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';

    return new Date(fecha).toLocaleDateString('es-CR');
  }

  function mostrarEstado(estado) {
    if (estado === 'Aceptada') {
      return 'Contratado';
    }

    return estado;
  }

  const postulacionesFiltradas = postulaciones.filter((postulacion) => {
    const texto = busqueda.toLowerCase();

    return (
      postulacion.NombreCompleto?.toLowerCase().includes(texto) ||
      postulacion.Cedula?.toString().includes(texto) ||
      postulacion.CorreoElectronico?.toLowerCase().includes(texto) ||
      postulacion.NombreRol?.toLowerCase().includes(texto) ||
      postulacion.Estado?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="crud-pagina">
      <h1>Postulaciones de Empleo</h1>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {mensaje && (
        <p>
          {mensaje}
        </p>
      )}

      <div className="crud-busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre, cédula, correo, rol o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {busqueda && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setBusqueda('')}
          >
            Limpiar
          </button>
        )}
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : postulacionesFiltradas.length === 0 ? (
        <p>No hay postulaciones registradas.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Correo</th>
              <th>Fecha nacimiento</th>
              <th>Rol</th>
              <th>Motivo</th>
              <th>Fecha postulación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {postulacionesFiltradas.map((postulacion) => (
              <tr key={postulacion.IdPostulacion}>
                <td>
                  {postulacion.NombreCompleto}
                </td>

                <td>
                  {postulacion.Cedula}
                </td>

                <td>
                  {postulacion.CorreoElectronico}
                </td>

                <td>
                  {formatearFecha(
                    postulacion.FechaNacimiento
                  )}
                </td>

                <td>
                  {postulacion.NombreRol ||
                    `Rol #${postulacion.IdRol || '-'}`}
                </td>

                <td>
                  {postulacion.MotivoPostulacion || '-'}
                </td>

                <td>
                  {formatearFecha(
                    postulacion.FechaPostulacion
                  )}
                </td>

                <td>
                  {mostrarEstado(postulacion.Estado)}
                </td>

                <td className="crud-tabla-acciones">
                  {postulacion.Estado === 'Pendiente' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          contratar(postulacion)
                        }
                      >
                        Contratar
                      </button>

                      <button
                        type="button"
                        className="btn-peligro"
                        onClick={() =>
                          rechazar(postulacion)
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="btn-peligro"
                    onClick={() =>
                      eliminar(postulacion)
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
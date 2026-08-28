import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Adopciones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function cargarSolicitudes() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get('/adopciones');
      setSolicitudes(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar las solicitudes de adopción'
      );
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, accion, mensajeConfirmacion) {
    const confirmar = window.confirm(mensajeConfirmacion);

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/adopciones/${id}/${accion}`
      );

      setMensaje(
        data.message || 'Solicitud actualizada correctamente'
      );

      await cargarSolicitudes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo actualizar la solicitud'
      );
    }
  }

  async function eliminarSolicitud(solicitud) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la solicitud #${solicitud.IdSolicitud}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.delete(
        `/adopciones/${solicitud.IdSolicitud}`
      );

      setMensaje(
        data.message || 'Solicitud eliminada correctamente'
      );

      await cargarSolicitudes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo eliminar la solicitud'
      );
    }
  }

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    const texto = busqueda.toLowerCase();

    return (
      solicitud.NombreSolicitante?.toLowerCase().includes(texto) ||
      solicitud.NombreAnimal?.toLowerCase().includes(texto) ||
      solicitud.Especie?.toLowerCase().includes(texto) ||
      solicitud.Estado?.toLowerCase().includes(texto) ||
      solicitud.Cedula?.toString().includes(texto)
    );
  });

  return (
    <div className="crud-pagina">
      <h1>Solicitudes de Adopción</h1>

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
          placeholder="Buscar por solicitante, animal, especie, cédula o estado..."
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
      ) : solicitudesFiltradas.length === 0 ? (
        <p>No hay solicitudes de adopción registradas.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Cédula</th>
              <th>Animal</th>
              <th>Condición vivienda</th>
              <th>Tiene mascotas</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {solicitudesFiltradas.map((solicitud) => (
              <tr key={solicitud.IdSolicitud}>
                <td>
                  {solicitud.NombreSolicitante || '-'}
                </td>

                <td>
                  {solicitud.Cedula || '-'}
                </td>

                <td>
                  {solicitud.NombreAnimal ||
                    solicitud.Animal ||
                    `Animal #${solicitud.IdAnimalRefugio || '-'}`}
                </td>

                <td>
                  {solicitud.CondicionVivienda || '-'}
                </td>

                <td>
                  {solicitud.TieneMascotas ? 'Sí' : 'No'}
                </td>

                <td>
                  {solicitud.MotivoAdopcion || '-'}
                </td>

                <td>
                  {solicitud.Estado}
                </td>

                <td className="crud-tabla-acciones">

                  {solicitud.Estado === 'Pendiente' && (
                    <>
                      <button
                        onClick={() =>
                          cambiarEstado(
                            solicitud.IdSolicitud,
                            'aprobar',
                            '¿Seguro que querés aprobar esta solicitud?'
                          )
                        }
                      >
                        Aprobar
                      </button>

                      <button
                        className="btn-peligro"
                        onClick={() =>
                          cambiarEstado(
                            solicitud.IdSolicitud,
                            'rechazar',
                            '¿Seguro que querés rechazar esta solicitud?'
                          )
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {solicitud.Estado === 'Aprobada' && (
                    <button
                      className="btn-secundario"
                      onClick={() =>
                        cambiarEstado(
                          solicitud.IdSolicitud,
                          'devolver',
                          '¿Confirmás que el animal fue devuelto al refugio?'
                        )
                      }
                    >
                      Devolver
                    </button>
                  )}

                  <button
                    className="btn-peligro"
                    onClick={() =>
                      eliminarSolicitud(solicitud)
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
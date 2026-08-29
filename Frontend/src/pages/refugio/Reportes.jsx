import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Reportes() {
  const [reporteAdopciones, setReporteAdopciones] = useState({
    totalAdopcionesRealizadas: 0,
    porEspecie: [],
    detalle: []
  });

  const [reporteDonaciones, setReporteDonaciones] = useState({
    totalGeneral: 0,
    porDestino: []
  });

  const [postulaciones, setPostulaciones] = useState([]);
  const [estadoPostulacion, setEstadoPostulacion] = useState('');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

   useEffect(() => {
  let componenteActivo = true;

  Promise.all([
    axiosClient.get('/adopciones/reporte'),
    axiosClient.get('/donaciones/reporte'),
    axiosClient.get('/postulaciones/reporte'),
  ])
    .then(
      ([
        respuestaAdopciones,
        respuestaDonaciones,
        respuestaPostulaciones,
      ]) => {
        if (!componenteActivo) {
          return;
        }

        setReporteAdopciones(
          respuestaAdopciones.data
        );

        setReporteDonaciones(
          respuestaDonaciones.data
        );

        setPostulaciones(
          respuestaPostulaciones.data
        );
      }
    )
    .catch((err) => {
      if (componenteActivo) {
        setError(
          err.response?.data?.message ||
            'No se pudieron cargar los reportes'
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

  async function filtrarPostulaciones(estado) {
    setEstadoPostulacion(estado);
    setError('');

    try {
      const url = estado
        ? `/postulaciones/reporte?estado=${estado}`
        : '/postulaciones/reporte';

      const { data } = await axiosClient.get(url);

      setPostulaciones(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudieron cargar las postulaciones'
      );
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';

    return new Date(fecha).toLocaleDateString('es-CR');
  }

  function formatearMonto(monto) {
    const numero = Number(monto || 0);

    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(numero);
  }

  function mostrarEstado(estado) {
    if (estado === 'Aceptada') {
      return 'Contratado';
    }

    return estado;
  }

  if (cargando) {
    return (
      <div className="crud-pagina">
        <h1>Reportes</h1>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="crud-pagina">
      <h1>Reportes</h1>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {/* REPORTE DE ADOPCIONES */}

      <section className="crud-form">
        <h2>Reporte de Adopciones</h2>

        <p>
          <strong>
            Total de adopciones realizadas:
          </strong>{' '}
          {reporteAdopciones.totalAdopcionesRealizadas || 0}
        </p>

        <h3>Adopciones por especie</h3>

        {reporteAdopciones.porEspecie?.length === 0 ? (
          <p>No hay adopciones aprobadas.</p>
        ) : (
          <table className="crud-tabla">
            <thead>
              <tr>
                <th>Especie</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              {reporteAdopciones.porEspecie.map(
                (item, index) => (
                  <tr key={index}>
                    <td>
                      {item.Especie}
                    </td>

                    <td>
                      {item.Cantidad}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}

        <h3>Detalle de adopciones</h3>

        {reporteAdopciones.detalle?.length === 0 ? (
          <p>No hay adopciones realizadas.</p>
        ) : (
          <table className="crud-tabla">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Animal</th>
                <th>Especie</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {reporteAdopciones.detalle.map(
                (adopcion, index) => (
                  <tr
                    key={
                      adopcion.IdSolicitud ||
                      index
                    }
                  >
                    <td>
                      {adopcion.NombreSolicitante ||
                        adopcion.NombreCliente ||
                        `Cliente #${adopcion.IdCliente || '-'}`}
                    </td>

                    <td>
                      {adopcion.NombreAnimal ||
                        adopcion.Animal ||
                        '-'}
                    </td>

                    <td>
                      {adopcion.Especie || '-'}
                    </td>

                    <td>
                      {adopcion.Estado}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* REPORTE DE DONACIONES */}

      <section className="crud-form">
        <h2>Reporte de Donaciones</h2>

        <p>
          <strong>
            Total de donaciones aprobadas:
          </strong>{' '}
          {formatearMonto(
            reporteDonaciones.totalGeneral
          )}
        </p>

        <h3>Donaciones por destino</h3>

        {reporteDonaciones.porDestino?.length === 0 ? (
          <p>No hay donaciones aprobadas.</p>
        ) : (
          <table className="crud-tabla">
            <thead>
              <tr>
                <th>Destino</th>
                <th>Total donado</th>
              </tr>
            </thead>

            <tbody>
              {reporteDonaciones.porDestino.map(
                (item, index) => (
                  <tr key={index}>
                    <td>
                      {item.DestinoDonacion}
                    </td>

                    <td>
                      {formatearMonto(
                        item.TotalDonado
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* REPORTE DE POSTULACIONES */}

      <section className="crud-form">
        <h2>
          Reporte de Postulaciones
        </h2>

        <div className="crud-busqueda">
          <select
            value={estadoPostulacion}
            onChange={(e) =>
              filtrarPostulaciones(
                e.target.value
              )
            }
          >
            <option value="">
              Todos los estados
            </option>

            <option value="Pendiente">
              Pendientes
            </option>

            <option value="Aceptada">
              Contratados
            </option>

            <option value="Rechazada">
              Rechazados
            </option>
          </select>
        </div>

        {postulaciones.length === 0 ? (
          <p>
            No hay postulaciones para mostrar.
          </p>
        ) : (
          <table className="crud-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {postulaciones.map(
                (postulacion) => (
                  <tr
                    key={
                      postulacion.IdPostulacion
                    }
                  >
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
                      {postulacion.NombreRol}
                    </td>

                    <td>
                      {formatearFecha(
                        postulacion.FechaPostulacion
                      )}
                    </td>

                    <td>
                      {mostrarEstado(
                        postulacion.Estado
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
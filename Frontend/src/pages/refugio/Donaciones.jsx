import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Donaciones() {
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    cargarDonaciones();
  }, []);

  async function cargarDonaciones() {
    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.get('/donaciones');
      setDonaciones(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar las donaciones'
      );
    } finally {
      setCargando(false);
    }
  }

  async function buscarPorPeriodo(e) {
    e.preventDefault();

    if (!desde || !hasta) {
      setError('Debes seleccionar una fecha inicial y una fecha final');
      return;
    }

    setCargando(true);
    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.get('/donaciones/periodo', {
        params: {
          desde,
          hasta,
        },
      });

      setDonaciones(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron buscar las donaciones por período'
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
        `/donaciones/${id}/${accion}`
      );

      setMensaje(
        data.message || 'Donación actualizada correctamente'
      );

      await cargarDonaciones();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo actualizar la donación'
      );
    }
  }

  async function eliminarDonacion(donacion) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la donación #${donacion.IdDonacion}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.delete(
        `/donaciones/${donacion.IdDonacion}`
      );

      setMensaje(
        data.message || 'Donación eliminada correctamente'
      );

      await cargarDonaciones();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo eliminar la donación'
      );
    }
  }

  function limpiarFiltros() {
    setBusqueda('');
    setDesde('');
    setHasta('');
    cargarDonaciones();
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';

    return new Date(fecha).toLocaleDateString('es-CR');
  }

  function formatearMonto(monto) {
    const numero = Number(monto);

    if (Number.isNaN(numero)) {
      return monto;
    }

    return numero.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
    });
  }

  const donacionesFiltradas = donaciones.filter((donacion) => {
    const texto = busqueda.toLowerCase();

    return (
      donacion.NombreDonante?.toLowerCase().includes(texto) ||
      donacion.NombreCliente?.toLowerCase().includes(texto) ||
      donacion.MetodoPago?.toLowerCase().includes(texto) ||
      donacion.DestinoDonacion?.toLowerCase().includes(texto) ||
      donacion.Estado?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="crud-pagina">
      <h1>Gestión de Donaciones</h1>

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

      <form
        className="crud-form"
        onSubmit={buscarPorPeriodo}
      >
        <h2>Buscar por período</h2>

        <div className="crud-form-grid">
          <label>
            Desde
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </label>

          <label>
            Hasta
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </label>
        </div>

        <div className="crud-form-botones">
          <button type="submit">
            Buscar
          </button>

          <button
            type="button"
            className="btn-secundario"
            onClick={limpiarFiltros}
          >
            Mostrar todas
          </button>
        </div>
      </form>

      <div className="crud-busqueda">
        <input
          placeholder="Buscar por donante, método, destino o estado..."
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
      ) : donacionesFiltradas.length === 0 ? (
        <p>No hay donaciones registradas.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Donante</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Destino</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {donacionesFiltradas.map((donacion) => (
              <tr key={donacion.IdDonacion}>
                <td>{formatearFecha(donacion.Fecha)}</td>

                <td>
                  {donacion.NombreDonante ||
                    donacion.NombreCliente ||
                    `Cliente #${donacion.IdCliente || '-'}`}
                </td>

                <td>{formatearMonto(donacion.Monto)}</td>

                <td>{donacion.MetodoPago || '-'}</td>

                <td>{donacion.DestinoDonacion || '-'}</td>

                <td>{donacion.Estado}</td>

                <td className="crud-tabla-acciones">
                  {donacion.Estado === 'Pendiente' && (
                    <>
                      <button
                        onClick={() =>
                          cambiarEstado(
                            donacion.IdDonacion,
                            'aprobar',
                            '¿Seguro que querés aprobar esta donación?'
                          )
                        }
                      >
                        Aprobar
                      </button>

                      <button
                        className="btn-peligro"
                        onClick={() =>
                          cambiarEstado(
                            donacion.IdDonacion,
                            'rechazar',
                            '¿Seguro que querés rechazar esta donación?'
                          )
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  <button
                    className="btn-peligro"
                    onClick={() =>
                      eliminarDonacion(donacion)
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
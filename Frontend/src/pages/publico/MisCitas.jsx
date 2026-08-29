import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ESTADOS_CANCELABLES = [
  'Pendiente',
  'Reprogramada',
];

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargarCitas() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get(
        '/citas/mis-citas'
      );

      setCitas(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudieron cargar tus citas'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
  let componenteActivo = true;

  axiosClient
    .get('/citas/mis-citas')
    .then(({ data }) => {
      if (componenteActivo) {
        setCitas(data);
      }
    })
    .catch((err) => {
      if (componenteActivo) {
        setError(
          err.response?.data?.message ||
            'No se pudieron cargar tus citas'
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

  async function cancelarCita(cita) {
    const confirmar = window.confirm(
      `¿Quieres cancelar la cita de ${
        cita.NombreMascota
      } del ${cita.Fecha.slice(0, 10)} a las ${
        cita.Hora
      }?`
    );

    if (!confirmar) {
      return;
    }

    setCancelando(cita.IdCita);
    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/citas/mis-citas/${cita.IdCita}/cancelar`
      );

      setMensaje(data.message);
      await cargarCitas();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo cancelar la cita'
      );
    } finally {
      setCancelando(null);
    }
  }

  return (
    <div className="pagina-publica-ancho">
      <h1>Mis citas</h1>

      <p className="subtitulo">
        Consulta tus citas actuales y anteriores.
      </p>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="mensaje-exito">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <p>Cargando tus citas...</p>
      ) : citas.length === 0 ? (
        <p className="mensaje-aviso">
          Todavía no tienes citas registradas.
        </p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Mascota</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {citas.map((cita) => (
              <tr key={cita.IdCita}>
                <td>
                  {cita.Fecha.slice(0, 10)}
                </td>

                <td>{cita.Hora}</td>
                <td>{cita.NombreMascota}</td>
                <td>{cita.Motivo}</td>
                <td>{cita.Estado}</td>

                <td className="crud-tabla-acciones">
                  {ESTADOS_CANCELABLES.includes(
                    cita.Estado
                  ) && (
                    <button
                      type="button"
                      className="btn-peligro"
                      disabled={
                        cancelando === cita.IdCita
                      }
                      onClick={() =>
                        cancelarCita(cita)
                      }
                    >
                      {cancelando === cita.IdCita
                        ? 'Cancelando...'
                        : 'Cancelar'}
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
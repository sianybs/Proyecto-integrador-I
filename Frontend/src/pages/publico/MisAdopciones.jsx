import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const FOTOS = [
  '/imagenes/refugio-perro.jpg',
  '/imagenes/refugio-gato.webp',
  '/imagenes/refugio-cafe.jpg',
];

const URL_BACKEND = 'http://localhost:4000';

function obtenerFoto(adopcion) {
  return adopcion.Imagen
    ? `${URL_BACKEND}${adopcion.Imagen}`
    : FOTOS[(adopcion.IdAnimalRefugio - 1) % FOTOS.length];
}

export default function MisAdopciones() {
  const [adopciones, setAdopciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargarAdopciones() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get('/adopciones/mis-adopciones');
      setAdopciones(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus adopciones');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let componenteActivo = true;

    axiosClient
      .get('/adopciones/mis-adopciones')
      .then(({ data }) => {
        if (componenteActivo) setAdopciones(data);
      })
      .catch((err) => {
        if (componenteActivo) {
          setError(err.response?.data?.message || 'No se pudieron cargar tus adopciones');
        }
      })
      .finally(() => {
        if (componenteActivo) setCargando(false);
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  async function actualizarSolicitud(adopcion, accion) {
    const esDevolucion = accion === 'devolver';
    const pregunta = esDevolucion
      ? `¿Confirmas que deseas devolver a ${adopcion.NombreAnimal} al refugio?`
      : `¿Confirmas que deseas cancelar la solicitud para adoptar a ${adopcion.NombreAnimal}?`;

    if (!window.confirm(pregunta)) return;

    setProcesando(adopcion.IdSolicitud);
    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/adopciones/mis-adopciones/${adopcion.IdSolicitud}/${accion}`
      );
      setMensaje(data.message);
      await cargarAdopciones();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar la adopción');
    } finally {
      setProcesando(null);
    }
  }

  return (
    <main className="mis-adopciones-pagina">
      <header className="mis-adopciones-hero">
        <span className="seccion-etiqueta seccion-etiqueta-clara">Tu familia Vet-Care</span>
        <h1>Mis adopciones</h1>
        <p>Consulta tus solicitudes y las mascotas que has adoptado.</p>
      </header>

      <section className="contenido-renovado mis-adopciones-contenido">
        {error && <p className="mensaje-error">{error}</p>}
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}

        {cargando ? (
          <p className="estado-carga-renovado">Cargando tus adopciones...</p>
        ) : adopciones.length === 0 ? (
          <div className="mis-adopciones-vacio">
            <h2>Aún no tienes solicitudes de adopción</h2>
            <p>Conoce a los animales que esperan una familia.</p>
            <Link to="/refugio/catalogo" className="boton-area boton-refugio">
              Ver animales en adopción
            </Link>
          </div>
        ) : (
          <div className="mis-adopciones-grid">
            {adopciones.map((adopcion) => (
              <article className="mi-adopcion-tarjeta" key={adopcion.IdSolicitud}>
                <img
                  src={obtenerFoto(adopcion)}
                  alt={`Mascota ${adopcion.NombreAnimal}`}
                />
                <div className="mi-adopcion-cuerpo">
                  <div className="mi-adopcion-encabezado">
                    <span>{adopcion.Especie}{adopcion.Edad ? ` · ${adopcion.Edad}` : ''}</span>
                    <strong className={`estado-adopcion estado-${adopcion.Estado.toLowerCase()}`}>
                      {adopcion.Estado}
                    </strong>
                  </div>
                  <h2>{adopcion.NombreAnimal}</h2>
                  {adopcion.Personalidad && <p>{adopcion.Personalidad}</p>}
                  <small>Solicitud #{adopcion.IdSolicitud}</small>

                  {adopcion.Estado === 'Pendiente' && (
                    <button
                      type="button"
                      className="btn-adopcion-secundario"
                      disabled={procesando === adopcion.IdSolicitud}
                      onClick={() => actualizarSolicitud(adopcion, 'cancelar')}
                    >
                      {procesando === adopcion.IdSolicitud ? 'Procesando...' : 'Cancelar solicitud'}
                    </button>
                  )}

                  {adopcion.Estado === 'Aprobada' && (
                    <button
                      type="button"
                      className="btn-adopcion-devolver"
                      disabled={procesando === adopcion.IdSolicitud}
                      onClick={() => actualizarSolicitud(adopcion, 'devolver')}
                    >
                      {procesando === adopcion.IdSolicitud ? 'Procesando...' : 'Devolver al refugio'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

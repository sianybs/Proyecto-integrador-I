import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function Catalogo() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/refugio/disponibles')
      .then(({ data }) => setAnimales(data))
      .catch(() => setError('No se pudo cargar el catálogo de animales.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="pagina-publica-ancho">
      <h1 className="centrado">Animales disponibles para adopción</h1>
      <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '2rem' }}>
        Estos son todos los animales que hoy están esperando un hogar en Vet-Care.
      </p>

      {error && <p className="mensaje-error">{error}</p>}

      {cargando ? (
        <p className="centrado">Cargando animales...</p>
      ) : error ? null : animales.length === 0 ? (
        <p className="centrado">Por ahora no hay animales disponibles para adopción.</p>
      ) : (
        <div className="tarjetas-grid">
          {animales.map((animal) => (
            <div className="tarjeta" key={animal.IdAnimalRefugio}>
              <div className="tarjeta-imagen" />
              <div className="tarjeta-cuerpo">
                <h3>{animal.Nombre}</h3>
                <span className="etiqueta">
                  {animal.Especie}
                  {animal.Edad ? ` · ${animal.Edad}` : ''}
                </span>
                {animal.Personalidad && <p className="descripcion">{animal.Personalidad}</p>}
                <Link
                  to={`/adopcion/solicitar?animal=${animal.IdAnimalRefugio}`}
                  className="btn btn-azul btn-bloque"
                >
                  Quiero adoptarlo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

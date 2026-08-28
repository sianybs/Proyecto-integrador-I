import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function InicioRefugio() {
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
    <div>
      <section className="hero hero-azul">
        <div className="hero-texto">
          <h1>
            Cada huella cuenta una
            <br />
            historia de <u>amor</u>
          </h1>
          <p>
            Nuestro refugio le da un segundo hogar a decenas de animales cada
            año. Conocé sus historias, adoptá o ayudá con una donación.
          </p>
          <div className="hero-botones">
            <Link to="/nosotros" className="btn" style={{ background: 'var(--blanco)', color: 'var(--azul)' }}>
              Conocer más sobre nosotros
            </Link>
            <Link to="/donar" className="btn btn-outline" style={{ borderColor: 'var(--blanco)', color: 'var(--blanco)' }}>
              Quiero donar
            </Link>
          </div>
        </div>
        <div className="hero-imagen" />
      </section>

      <div className="pagina-publica-ancho">
        <h2 className="centrado">Mascotas que buscan un hogar</h2>
        <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '1.5rem' }}>
          Este es un adelanto de nuestro catálogo. Podés ver todos los
          animales disponibles y postularte para adoptar a alguno.
        </p>

        {error && <p className="mensaje-error">{error}</p>}

        {cargando ? (
          <p className="centrado">Cargando animales...</p>
        ) : error ? null : animales.length === 0 ? (
          <p className="centrado">Por ahora no hay animales disponibles para adopción.</p>
        ) : (
          <div className="tarjetas-grid">
            {animales.slice(0, 3).map((animal) => (
              <div className="tarjeta" key={animal.IdAnimalRefugio}>
                <div className="tarjeta-imagen" />
                <div className="tarjeta-cuerpo">
                  <h3>{animal.Nombre}</h3>
                  <span className="etiqueta">
                    {animal.Especie}
                    {animal.Edad ? ` · ${animal.Edad}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="centrado" style={{ marginTop: '2rem' }}>
          <Link to="/refugio/catalogo" className="btn btn-azul">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </div>
  );
}

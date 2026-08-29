import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const FOTOS = [
  "/imagenes/refugio-perro.jpg",
  "/imagenes/refugio-gato.webp",
  "/imagenes/refugio-cafe.jpg",
];

export default function InicioRefugio() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient
      .get("/refugio/disponibles")
      .then(({ data }) => setAnimales(data))
      .catch(() => setError("No se pudo cargar el catálogo de animales."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="refugio-renovado">
      <section className="refugio-hero">
        <div className="refugio-hero-texto">
          <span className="seccion-etiqueta seccion-etiqueta-clara">Refugio Vet-Care</span>
          <h1>Cada huella cuenta una historia de amor.</h1>
          <p>
            Rescatamos, cuidamos y conectamos animales con familias dispuestas
            a brindarles una segunda oportunidad.
          </p>
          <div className="hero-acciones-renovadas">
            <Link to="/refugio/catalogo" className="boton-area boton-claro">Conocer animales</Link>
            <Link to="/donar" className="boton-area boton-transparente">Quiero ayudar</Link>
          </div>
        </div>
        <div className="refugio-hero-imagen">
          <img src="/imagenes/refugio-hogar.jpg" alt="Cachorros esperando encontrar un hogar" />
        </div>
      </section>

      <section className="refugio-catalogo-inicio contenido-renovado">
        <header className="titulo-seccion-renovado">
          <span className="seccion-etiqueta">Nuevos amigos</span>
          <h2>Mascotas que buscan un hogar</h2>
          <p>Conoce algunos de los animales disponibles actualmente en Vet-Care.</p>
        </header>

        {error && <p className="mensaje-error">{error}</p>}
        {cargando ? (
          <p className="estado-carga-renovado">Cargando animales...</p>
        ) : error ? null : animales.length === 0 ? (
          <p className="estado-carga-renovado">Por ahora no hay animales disponibles para adopción.</p>
        ) : (
          <div className="animales-renovados-grid">
            {animales.slice(0, 3).map((animal) => (
              <article className="animal-renovado" key={animal.IdAnimalRefugio}>
                <img
                  src={FOTOS[(animal.IdAnimalRefugio - 1) % FOTOS.length]}
                  alt={"Mascota " + animal.Nombre}
                />
                <div>
                  <span>{animal.Especie}{animal.Edad ? " · " + animal.Edad : ""}</span>
                  <h3>{animal.Nombre}</h3>
                  {animal.Personalidad && <p>{animal.Personalidad}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="accion-centrada">
          <Link to="/refugio/catalogo" className="boton-area boton-refugio">Ver catálogo completo →</Link>
        </div>
      </section>

      <section className="proceso-adopcion">
        <div className="contenido-renovado">
          <header className="titulo-seccion-renovado">
            <span className="seccion-etiqueta">Adopción responsable</span>
            <h2>¿Cómo adoptar?</h2>
            <p>Un proceso sencillo para encontrar el compañero ideal.</p>
          </header>
          <div className="pasos-adopcion-grid">
            <article><span>1</span><h3>Elige una mascota</h3><p>Explora el catálogo y conoce su historia.</p></article>
            <article><span>2</span><h3>Envía tu solicitud</h3><p>Completa el formulario con tus datos.</p></article>
            <article><span>3</span><h3>Revisión</h3><p>El equipo evaluará la solicitud responsablemente.</p></article>
            <article><span>4</span><h3>Nuevo hogar</h3><p>Finaliza el proceso y recibe a tu compañero.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}

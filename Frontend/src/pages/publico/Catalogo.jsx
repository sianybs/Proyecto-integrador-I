import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const FOTOS = [
  "/imagenes/refugio-perro.jpg",
  "/imagenes/refugio-gato.webp",
  "/imagenes/refugio-cafe.jpg",
];

const URL_BACKEND = "http://localhost:4000";

function obtenerFoto(animal) {
  return animal.Imagen
    ? `${URL_BACKEND}${animal.Imagen}`
    : FOTOS[(animal.IdAnimalRefugio - 1) % FOTOS.length];
}

export default function Catalogo() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  useEffect(() => {
    if (!animalSeleccionado) return undefined;

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") setAnimalSeleccionado(null);
    }

    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = "";
    };
  }, [animalSeleccionado]);

  useEffect(() => {
    axiosClient
      .get("/refugio/disponibles")
      .then(({ data }) => setAnimales(data))
      .catch(() => setError("No se pudo cargar el catálogo de animales."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="catalogo-renovado">
      <header className="catalogo-hero">
        <span className="seccion-etiqueta seccion-etiqueta-clara">Adopta una vida</span>
        <h1>Encuentra a tu nuevo compañero</h1>
        <p>Cada uno está esperando una familia que le brinde cuidado, paciencia y amor.</p>
      </header>

      <section className="contenido-renovado catalogo-contenido">
        {error && <p className="mensaje-error">{error}</p>}
        {cargando ? (
          <p className="estado-carga-renovado">Cargando animales...</p>
        ) : error ? null : animales.length === 0 ? (
          <p className="estado-carga-renovado">Por ahora no hay animales disponibles para adopción.</p>
        ) : (
          <div className="animales-renovados-grid catalogo-grid">
            {animales.map((animal) => (
              <article
                className="animal-renovado animal-renovado-seleccionable"
                key={animal.IdAnimalRefugio}
                onClick={() => setAnimalSeleccionado(animal)}
              >
                <img
                  src={obtenerFoto(animal)}
                  alt={"Mascota " + animal.Nombre}
                />
                <div>
                  <span>{animal.Especie}{animal.Edad ? " · " + animal.Edad : ""}</span>
                  <h3>{animal.Nombre}</h3>
                  {animal.Personalidad && <p>{animal.Personalidad}</p>}
                  <button
                    type="button"
                    className="boton-area boton-refugio boton-animal"
                    onClick={() => setAnimalSeleccionado(animal)}
                  >
                    Conocer más
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {animalSeleccionado && (
        <div
          className="animal-modal-fondo"
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setAnimalSeleccionado(null);
          }}
        >
          <section className="animal-modal" role="dialog" aria-modal="true" aria-labelledby="animal-modal-titulo">
            <button
              type="button"
              className="animal-modal-cerrar"
              aria-label="Cerrar detalles"
              onClick={() => setAnimalSeleccionado(null)}
            >
              ×
            </button>

            <div className="animal-modal-imagen">
              <img src={obtenerFoto(animalSeleccionado)} alt={animalSeleccionado.Nombre} />
            </div>

            <div className="animal-modal-contenido">
              <span>{animalSeleccionado.Especie}{animalSeleccionado.Edad ? ` · ${animalSeleccionado.Edad}` : ""}</span>
              <h2 id="animal-modal-titulo">Conoce a {animalSeleccionado.Nombre}</h2>

              {animalSeleccionado.Personalidad && <div className="animal-modal-dato"><strong>Su personalidad</strong><p>{animalSeleccionado.Personalidad}</p></div>}
              {animalSeleccionado.Historia && <div className="animal-modal-dato"><strong>Su historia</strong><p>{animalSeleccionado.Historia}</p></div>}
              {animalSeleccionado.HistorialSalud && <div className="animal-modal-dato"><strong>Información de salud</strong><p>{animalSeleccionado.HistorialSalud}</p></div>}

              <div className="animal-modal-acciones">
                <button type="button" onClick={() => setAnimalSeleccionado(null)}>Cancelar</button>
                <Link
                  to={`/adopcion/solicitar?animal=${animalSeleccionado.IdAnimalRefugio}`}
                  className="boton-area boton-refugio"
                >
                  Quiero adoptar
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

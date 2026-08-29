import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-renovado">
      <section className="home-bienvenida">
        <div className="home-bienvenida-texto">
          <span className="seccion-etiqueta">Bienvenido a Vet-Care</span>
          <h1>Dos áreas, un mismo compromiso con el bienestar animal.</h1>
          <p>
            Encuentra atención veterinaria profesional para tu mascota o
            conoce a los animales del refugio que esperan una nueva familia.
          </p>
        </div>
      </section>

      <section className="home-opciones">
        <article className="home-opcion home-opcion-salud">
          <div className="home-opcion-imagen home-imagen-salud" />
          <div className="home-opcion-contenido">
            <span>Clínica veterinaria</span>
            <h2>Cuidamos a tus mejores amigos</h2>
            <p>
              Agenda consultas, registra tus mascotas y conserva su atención
              médica en un mismo lugar.
            </p>
            <Link to="/veterinaria" className="boton-area boton-salud">
              Ir a Veterinaria <strong>→</strong>
            </Link>
          </div>
        </article>

        <article className="home-opcion home-opcion-refugio">
          <div className="home-opcion-imagen home-imagen-refugio" />
          <div className="home-opcion-contenido">
            <span>Refugio y adopciones</span>
            <h2>Cada huella merece un hogar</h2>
            <p>
              Conoce a los animales disponibles, solicita una adopción o
              colabora mediante una donación.
            </p>
            <Link to="/refugio" className="boton-area boton-refugio">
              Ir al Refugio <strong>→</strong>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

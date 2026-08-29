import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function InicioVeterinaria() {
  const { estaLogueado, usuario } = useAuth();
  const esCliente = estaLogueado && usuario?.rol === "Cliente";

  return (
    <main className="veterinaria-renovada">
      <section className="veterinaria-hero">
        <div className="veterinaria-hero-texto">
          <span className="seccion-etiqueta seccion-etiqueta-clara">Clínica veterinaria</span>
          <h1>Cuidado profesional para tus mejores amigos.</h1>
          <p>
            Consultas, seguimiento e historial médico en un mismo lugar.
            Nuestro equipo está listo para cuidar a tu mascota.
          </p>
          <div className="hero-acciones-renovadas">
            <Link to={esCliente ? "/citas/agendar" : "/registro"} className="boton-area boton-claro">
              {esCliente ? "Agendar una cita" : "Registrar mi mascota"}
            </Link>
            <Link to="/nosotros" className="boton-area boton-transparente">Conocer Vet-Care</Link>
          </div>
        </div>
        <div className="veterinaria-foto-arco">
          <img
            src="/imagenes/veterinaria-consulta.jpg"
            alt="Veterinario acompañando a un perro durante su consulta"
          />
        </div>
      </section>

      <section className="servicios-veterinarios contenido-renovado">
        <header className="titulo-seccion-renovado">
          <span className="seccion-etiqueta seccion-etiqueta-roja">Nuestros servicios</span>
          <h2>Atención para cada etapa de su vida</h2>
          <p>Organizamos la información de tu mascota para ofrecer un seguimiento claro y continuo.</p>
        </header>
        <div className="servicios-vet-grid">
          <article><span>01</span><h3>Consultas generales</h3><p>Revisiones, controles preventivos y orientación profesional.</p></article>
          <article><span>02</span><h3>Diagnóstico y tratamiento</h3><p>Registro de atenciones, diagnósticos y tratamientos indicados.</p></article>
          <article><span>03</span><h3>Historial médico</h3><p>Información clínica centralizada para dar continuidad a cada caso.</p></article>
        </div>
      </section>

      <section className="veterinaria-horario contenido-renovado">
        <div>
          <span className="seccion-etiqueta seccion-etiqueta-roja">Horario de atención</span>
          <h2>Agenda la próxima visita de tu mascota</h2>
          <p>Atendemos de 8:00 a. m. a 4:00 p. m., con citas cada 30 minutos.</p>
        </div>
        <Link to="/citas/agendar" className="boton-area boton-salud">Agendar cita →</Link>
      </section>
    </main>
  );
}

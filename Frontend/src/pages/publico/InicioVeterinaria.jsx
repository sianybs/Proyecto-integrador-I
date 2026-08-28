import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function InicioVeterinaria() {
  const { estaLogueado, usuario } = useAuth();
  const esCliente = estaLogueado && usuario?.rol === 'Cliente';

  return (
    <div>
      <section className="hero hero-rojo">
        <div className="hero-texto">
          <h1>
            Cuidado profesional para
            <br />
            tus mejores amigos
          </h1>
          <p>
            Gestión simplificada de pacientes, expedientes y citas en un solo
            lugar. Nuestro equipo veterinario está listo para atender a tu
            mascota.
          </p>
          <div className="hero-botones">
            {esCliente ? (
              <Link to="/citas/agendar" className="btn" style={{ background: 'var(--blanco)', color: 'var(--rojo)' }}>
                Agendar cita
              </Link>
            ) : (
              <Link to="/registro" className="btn" style={{ background: 'var(--blanco)', color: 'var(--rojo)' }}>
                Nuevo registro
              </Link>
            )}
            <Link to="/citas/agendar" className="btn btn-outline" style={{ borderColor: 'var(--blanco)', color: 'var(--blanco)' }}>
              Agendar
            </Link>
          </div>
        </div>
        <div className="hero-imagen" />
      </section>

      <div className="pagina-publica-ancho">
        <div className="caja caja-roja">
          <h2>Sobre nosotros</h2>
          <p>
            En Vet-Care contamos con un equipo de veterinarios, asistentes y
            recepcionistas dedicados a la salud de tu mascota: consultas,
            diagnósticos, tratamientos y seguimiento, con historial médico
            centralizado para que nunca se pierda información importante.
          </p>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <h3>Consultas generales</h3>
            <p>Revisiones, vacunación y control de rutina.</p>
          </div>
          <div className="info-item">
            <h3>Diagnóstico y tratamiento</h3>
            <p>Atención veterinaria con registro de historial médico.</p>
          </div>
          <div className="info-item">
            <h3>Horario de atención</h3>
            <p>Citas disponibles de 8:00 a.m. a 4:00 p.m.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

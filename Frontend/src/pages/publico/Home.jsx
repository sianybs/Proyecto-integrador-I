import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="pagina-publica-ancho">
      <h1 className="centrado">¿Qué estás buscando?</h1>
      <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '2rem' }}>
        Vet-Care acompaña a las mascotas y a las personas que las cuidan, desde
        una consulta veterinaria hasta encontrarles un nuevo hogar.
      </p>

      <div className="eleccion-grid">
        <div className="eleccion-opcion">
          <h2>Servicio veterinaria</h2>
          <p>Agendá una cita para tu mascota con nuestro equipo profesional.</p>
          <Link to="/veterinaria" className="btn btn-rojo">
            Quiero agendar
          </Link>
        </div>

        <div className="eleccion-opcion">
          <h2>Refugio</h2>
          <p>Conocé a los animales que buscan un hogar o ayudá con una donación.</p>
          <Link to="/refugio" className="btn btn-azul">
            Quiero ayudar
          </Link>
        </div>
      </div>
    </div>
  );
}

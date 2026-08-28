export default function Nosotros() {
  return (
    <div className="pagina-publica-ancho">
      <h1 className="centrado">Sobre nosotros</h1>
      <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '2rem' }}>
        Un hogar para todas las mascotas.
      </p>

      <div className="caja">
        <h2>Nuestra misión</h2>
        <p>
          Vet-Care nació para brindar atención veterinaria de calidad y, al
          mismo tiempo, dar una segunda oportunidad a los animales del refugio
          que buscan una familia. Creemos que la salud y el bienestar animal
          van de la mano.
        </p>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <h3>Área de salud</h3>
          <p>
            Veterinarios, asistentes y recepcionistas atienden citas,
            diagnósticos y tratamientos, con historial médico centralizado
            para cada mascota.
          </p>
        </div>
        <div className="info-item">
          <h3>Área de refugio</h3>
          <p>
            Encargados y cuidadores trabajan todos los días para que cada
            animal reciba alimento, cuidado y, eventualmente, un hogar
            definitivo.
          </p>
        </div>
        <div className="info-item">
          <h3>Nuestro equipo</h3>
          <p>
            Un equipo comprometido con el bienestar animal, siempre buscando
            crecer y sumar más manos que quieran ayudar.
          </p>
        </div>
      </div>
    </div>
  );
}

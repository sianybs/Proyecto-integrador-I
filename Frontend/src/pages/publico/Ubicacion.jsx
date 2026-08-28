export default function Ubicacion() {
  return (
    <div className="pagina-publica-ancho">
      <h1 className="centrado">Ubicación</h1>
      <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '2rem' }}>
        Visitanos en nuestras instalaciones.
      </p>

      <div className="info-grid">
        <div className="info-item">
          <h3>Dirección</h3>
          <p>El Roble, Puntarenas, Costa Rica.</p>
        </div>
        <div className="info-item">
          <h3>Horario de atención</h3>
          <p>Lunes a sábado, de 8:00 a.m. a 4:00 p.m.</p>
        </div>
        <div className="info-item">
          <h3>Cómo llegar</h3>
          <p>A pocos minutos del centro de Puntarenas, con acceso para vehículos.</p>
        </div>
      </div>
    </div>
  );
}

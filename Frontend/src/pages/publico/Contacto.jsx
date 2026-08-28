export default function Contacto() {
  return (
    <div className="pagina-publica-ancho">
      <h1 className="centrado">Contacto</h1>
      <p className="centrado" style={{ color: 'rgba(19,19,19,0.65)', marginBottom: '2rem' }}>
        ¿Tenés dudas? Escribinos por cualquiera de estos medios.
      </p>

      <div className="info-grid">
        <div className="info-item">
          <h3>Teléfono</h3>
          <p>2222-2222</p>
        </div>
        <div className="info-item">
          <h3>Correo</h3>
          <p>contacto@vetcare.com</p>
        </div>
        <div className="info-item">
          <h3>Dirección</h3>
          <p>El Roble, Puntarenas, Costa Rica.</p>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function FooterPublico() {
  return (
    <footer className="footer-publico">
      <div className="footer-contenedor">
        <section className="footer-identidad">
          <div className="footer-marca">
            <img src="/logo-vetcare.png" alt="Logo de Vet-Care" />
            <div>
              <h2>Vet-Care</h2>
              <span>Veterinaria y Refugio</span>
            </div>
          </div>
          <p>
            Cada huella cuenta una historia de cuidado, rescate y amor.
            Trabajamos por la salud y el bienestar de los animales de Costa Rica.
          </p>
        </section>

        <section className="footer-columna">
          <h3>Páginas</h3>
          <Link to="/">Inicio</Link>
          <Link to="/veterinaria">Veterinaria</Link>
          <Link to="/refugio">Refugio</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/ubicacion">Ubicación</Link>
          <Link to="/contacto">Contacto</Link>
        </section>

        <section className="footer-columna footer-contacto">
          <h3>Contacto</h3>
          <p><span>⌖</span> El Roble, Puntarenas</p>
          <a href="mailto:vetcare1317@gmail.com"><span>✉</span> vetcare1317@gmail.com</a>
          <a href="tel:22222222"><span>☎</span> 2222-2222</a>
          <p><span>◷</span> Lun – Sáb: 8:00 a.m. – 4:00 p.m.</p>
        </section>

        <section className="footer-columna footer-empleo">
          <h3>Trabaja con nosotros</h3>
          <p>
            Forma parte de un equipo comprometido con la salud y el bienestar animal.
          </p>
          <Link to="/empleo/postularse" className="footer-empleo-boton">
            Enviar postulación →
          </Link>
        </section>
      </div>

      <div className="footer-inferior">
        <p>© 2026 Vet-Care. Hecho con <span aria-label="amor">♥</span> en Costa Rica.</p>
      </div>
    </footer>
  );
}

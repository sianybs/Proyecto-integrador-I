import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MiPerfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/');
  }

  return (
    <div className="pagina-publica-ancho">
      <div className="crud-form">
        <h1>Mi perfil</h1>

        <p className="subtitulo">
          Administrá tus mascotas, citas y solicitudes.
        </p>

        <div className="info-grid">
          <div className="info-item">
            <h3>Nombre</h3>
            <p>{usuario.nombre}</p>
          </div>

          <div className="info-item">
            <h3>Correo electrónico</h3>
            <p>{usuario.correo}</p>
          </div>

          <div className="info-item">
            <h3>Tipo de cuenta</h3>
            <p>{usuario.rol}</p>
          </div>
        </div>
      </div>

      <div className="panel-nav">
        <div className="panel-bloque">
          <h2>Mis mascotas y citas</h2>

          <ul>
            <li>
              <Link to="/citas/agendar">
                Agendar una cita
              </Link>
            </li>

            <li>
              <Link to="/mis-citas">
                Ver mis citas
              </Link>
            </li>
          </ul>
        </div>

        <div className="panel-bloque">
          <h2>Refugio</h2>

          <ul>
            <li>
              <Link to="/refugio/catalogo">
                Ver animales en adopción
              </Link>
            </li>

            <li>
              <Link to="/adopcion/solicitar">
                Solicitar una adopción
              </Link>
            </li>

            <li>
              <Link to="/donar">
                Realizar una donación
              </Link>
            </li>
          </ul>
        </div>

        <div className="panel-bloque">
          <h2>Cuenta</h2>

          <button
            type="button"
            className="btn-peligro"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();

  const rolesDeSalud = ["Administrador", "Veterinario", "Recepcionista"];

  const rolesDeRefugio = ["Administrador", "Encargado del Refugio"];

  return (
    <div className="panel-staff panel-moderno">
      <section className="panel-bienvenida">
        <div>
          <span className="panel-bienvenida-etiqueta">Centro de gestión</span>

          <h2>¿Qué deseas gestionar hoy?</h2>

          <p>
            Accede rápidamente a las herramientas disponibles según tu rol
            dentro de Vet-Care.
          </p>
        </div>

        <div className="panel-colores">
          <span className="indicador-salud">Veterinaria</span>

          <span className="indicador-refugio">Refugio</span>
        </div>
      </section>

      <nav className="panel-nav panel-nav-moderno">
        {rolesDeSalud.includes(usuario.rol) && (
          <section className="panel-bloque panel-bloque-salud">
            <div className="panel-bloque-icono">+</div>

            <div className="panel-bloque-encabezado">
              <span>Gestión clínica</span>
              <h2>Área de Salud</h2>

              <p>Administra pacientes, consultas y expedientes veterinarios.</p>
            </div>

            <ul>
              <li>
                <Link to="/staff/duenos">
                  <span>Dueños</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/mascotas">
                  <span>Mascotas</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/citas">
                  <span>Citas</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/atenciones">
                  <span>Atención veterinaria</span>
                  <strong>→</strong>
                </Link>
              </li>
            </ul>
          </section>
        )}

        {rolesDeRefugio.includes(usuario.rol) && (
          <section className="panel-bloque panel-bloque-refugio">
            <div className="panel-bloque-icono">♡</div>

            <div className="panel-bloque-encabezado">
              <span>Bienestar animal</span>
              <h2>Área de Refugio</h2>

              <p>Gestiona animales, adopciones y ayudas recibidas.</p>
            </div>

            <ul>
              <li>
                <Link to="/staff/animales">
                  <span>Animales</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/adopciones">
                  <span>Adopciones</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/donaciones">
                  <span>Donaciones</span>
                  <strong>→</strong>
                </Link>
              </li>
            </ul>
          </section>
        )}

        {usuario.rol === "Administrador" && (
          <section className="panel-bloque panel-bloque-admin">
            <div className="panel-bloque-icono">⚙</div>

            <div className="panel-bloque-encabezado">
              <span>Configuración</span>
              <h2>Administración</h2>

              <p>
                Supervisa el personal, las solicitudes y los reportes generales.
              </p>
            </div>

            <ul>
              <li>
                <Link to="/staff/postulaciones">
                  <span>Postulaciones</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/empleados">
                  <span>Empleados</span>
                  <strong>→</strong>
                </Link>
              </li>

              <li>
                <Link to="/staff/reportes">
                  <span>Reportes</span>
                  <strong>→</strong>
                </Link>
              </li>
            </ul>
          </section>
        )}
      </nav>
    </div>
  );
}

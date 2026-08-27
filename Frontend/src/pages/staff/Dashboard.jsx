import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Esta pantalla es un punto de partida: a medida que cada bloque
// (Salud / Refugio) construya sus propias paginas, se van agregando
// mas links aca, mostrando solo los que le corresponden al rol logueado.
export default function Dashboard() {
  const { usuario, logout } = useAuth();

  const rolesDeSalud = ['Administrador', 'Veterinario', 'Recepcionista'];
  const rolesDeRefugio = ['Administrador', 'Encargado del Refugio'];

  return (
    <div className="panel-staff">
      <header className="panel-header">
        <div>
          <h1>Vet-Care · Panel interno</h1>
          <p>
            Hola, <strong>{usuario.nombre}</strong> ({usuario.rol})
          </p>
        </div>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <nav className="panel-nav">
        {rolesDeSalud.includes(usuario.rol) && (
          <div className="panel-bloque">
            <h2>Área de Salud</h2>
            <ul>
              <li><Link to="/staff/duenos">Dueños</Link></li>
              <li><Link to="/staff/mascotas">Mascotas</Link></li>
              <li><Link to="/staff/citas">Citas</Link></li>
              <li><Link to="/staff/atenciones">Atención veterinaria</Link></li>
            </ul>
          </div>
        )}

        {rolesDeRefugio.includes(usuario.rol) && (
          <div className="panel-bloque">
            <h2>Área de Refugio</h2>
            <ul>
              <li><Link to="/staff/animales">Animales</Link></li>
              <li><Link to="/staff/adopciones">Adopciones</Link></li>
              <li><Link to="/staff/donaciones">Donaciones</Link></li>
              <li><Link to="/staff/postulaciones">Postulaciones</Link></li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}

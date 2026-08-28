import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NavbarPublico() {
  const { usuario, estaLogueado, logout } = useAuth();

  return (
    <header className="navbar-publico">
      <NavLink to="/" className="logo">
        <span className="marca">Vet-Care</span>
        <span className="submarca">Veterinaria/Refugio</span>
      </NavLink>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'activo' : '')}>
          Inicio
        </NavLink>
        <NavLink to="/veterinaria" className={({ isActive }) => (isActive ? 'activo' : '')}>
          Veterinaria
        </NavLink>
        <NavLink to="/refugio" className={({ isActive }) => (isActive ? 'activo' : '')}>
          Refugio
        </NavLink>
        <NavLink to="/nosotros" className={({ isActive }) => (isActive ? 'activo' : '')}>
          Nosotros
        </NavLink>
        <NavLink to="/ubicacion" className={({ isActive }) => (isActive ? 'activo' : '')}>
          Ubicación
        </NavLink>
        <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'activo' : '')}>
          Contacto
        </NavLink>
      </nav>

      <div className="acciones">
        {estaLogueado && usuario?.rol === 'Cliente' ? (
          <>
            <span className="saludo">Hola, {usuario.nombre}</span>
            <button type="button" className="btn btn-outline" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn btn-rojo">
            Iniciar sesión
          </NavLink>
        )}
      </div>
    </header>
  );
}

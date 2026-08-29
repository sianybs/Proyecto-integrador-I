import { useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { useAuth } from "../../context/AuthContext";

export default function NavbarPublico() {
  const { usuario, estaLogueado, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="navbar-publico">
      <NavLink to="/" className="logo" onClick={cerrarMenu}>
        <img
          src="/logo-vetcare.png"
          alt="Logo de Vet-Care"
          className="logo-imagen"
        />

        <span className="logo-texto">
          <span className="marca">Vet-Care</span>
          <span className="submarca">Veterinaria y Refugio</span>
        </span>
      </NavLink>

      <button
        type="button"
        className={`navbar-hamburguesa ${menuAbierto ? "abierta" : ""}`}
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        aria-controls="menu-publico"
        onClick={() => setMenuAbierto((abierto) => !abierto)}
      >
        <span />
        <span />
        <span />
      </button>

      <div id="menu-publico" className={`navbar-contenido ${menuAbierto ? "abierto" : ""}`}>
        <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Inicio
        </NavLink>

        <NavLink
          to="/veterinaria"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Veterinaria
        </NavLink>

        <NavLink
          to="/refugio"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Refugio
        </NavLink>

        <NavLink
          to="/nosotros"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Nosotros
        </NavLink>

        <NavLink
          to="/empleo/postularse"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Empleo
        </NavLink>

        <NavLink
          to="/ubicacion"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Ubicación
        </NavLink>

        <NavLink
          to="/contacto"
          className={({ isActive }) => (isActive ? "activo" : "")}
          onClick={cerrarMenu}
        >
          Contacto
        </NavLink>
        </nav>

        <div className="acciones">
        {estaLogueado && usuario?.rol === "Cliente" ? (
          <Dropdown align="end">
            <Dropdown.Toggle id="dropdown-perfil" className="perfil-toggle">
              Hola, {usuario.nombre}
            </Dropdown.Toggle>

            <Dropdown.Menu className="perfil-menu">
              <Dropdown.Header>Mi perfil</Dropdown.Header>

              <Dropdown.Item as={NavLink} to="/mi-perfil">
                Mis datos
              </Dropdown.Item>

              <Dropdown.Item as={NavLink} to="/citas/agendar">
                Agendar cita
              </Dropdown.Item>

              <Dropdown.Item as={NavLink} to="/mis-mascotas">
                Mis mascotas
              </Dropdown.Item>

              <Dropdown.Item as={NavLink} to="/mis-citas">
                Mis citas
              </Dropdown.Item>

              <Dropdown.Item as={NavLink} to="/mis-adopciones">
                Mis adopciones
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                as="button"
                className="cerrar-sesion-item"
                onClick={logout}
              >
                Cerrar sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <NavLink to="/login" className="btn btn-rojo" onClick={cerrarMenu}>
            Iniciar sesión
          </NavLink>
        )}
        </div>
      </div>
    </header>
  );
}

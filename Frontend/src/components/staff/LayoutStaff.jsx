import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const enlacesSalud = [
  { to: "/staff/duenos", texto: "Dueños" },
  { to: "/staff/mascotas", texto: "Mascotas" },
  { to: "/staff/citas", texto: "Citas" },
  { to: "/staff/atenciones", texto: "Atenciones" },
];

const enlacesRefugio = [
  { to: "/staff/animales", texto: "Animales" },
  { to: "/staff/adopciones", texto: "Adopciones" },
  { to: "/staff/donaciones", texto: "Donaciones" },
];

const enlacesAdmin = [
  { to: "/staff/postulaciones", texto: "Postulaciones" },
  { to: "/staff/empleados", texto: "Empleados" },
  { to: "/staff/reportes", texto: "Reportes" },
];

export default function LayoutStaff() {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const veSalud = ["Administrador", "Veterinario", "Recepcionista"].includes(usuario.rol);
  const veRefugio = ["Administrador", "Encargado del Refugio"].includes(usuario.rol);
  const esAdmin = usuario.rol === "Administrador";
  const cerrarMenu = () => setMenuAbierto(false);

  const crearEnlaces = (enlaces) => enlaces.map((enlace) => (
    <NavLink
      key={enlace.to}
      to={enlace.to}
      className={({ isActive }) => (isActive ? "activo" : "")}
      onClick={cerrarMenu}
    >
      {enlace.texto}
    </NavLink>
  ));

  return (
    <div className="staff-layout">
      <header className="staff-navbar">
        <NavLink to="/staff" end className="staff-marca" onClick={cerrarMenu}>
          <img src="/logo-vetcare.png" alt="Logo de Vet-Care" />
          <span><strong>Vet-Care</strong><small>Panel interno</small></span>
        </NavLink>

        <button
          type="button"
          className={`staff-hamburguesa ${menuAbierto ? "abierta" : ""}`}
          aria-label={menuAbierto ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((valor) => !valor)}
        >
          <span /><span /><span />
        </button>

        <div className={`staff-navbar-contenido ${menuAbierto ? "abierto" : ""}`}>
          <nav className="staff-nav-enlaces">
            <NavLink to="/staff" end onClick={cerrarMenu}>Inicio</NavLink>
            {veSalud && <div className="staff-nav-grupo"><span>Salud</span>{crearEnlaces(enlacesSalud)}</div>}
            {veRefugio && <div className="staff-nav-grupo"><span>Refugio</span>{crearEnlaces(enlacesRefugio)}</div>}
            {esAdmin && <div className="staff-nav-grupo"><span>Administración</span>{crearEnlaces(enlacesAdmin)}</div>}
          </nav>

          <div className="staff-usuario">
            <div><strong>{usuario.nombre}</strong><span>{usuario.rol}</span></div>
            <button type="button" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="staff-contenido">
        <Outlet />
      </main>
    </div>
  );
}

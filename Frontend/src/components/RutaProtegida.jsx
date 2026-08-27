import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Uso:
//   <RutaProtegida><PaginaDuenos /></RutaProtegida>
//   -> exige estar logueado, sin importar el rol
//
//   <RutaProtegida rolesPermitidos={['Administrador']}><PaginaEmpleados /></RutaProtegida>
//   -> exige estar logueado Y tener uno de esos roles
export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, estaLogueado } = useAuth();

  if (!estaLogueado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}

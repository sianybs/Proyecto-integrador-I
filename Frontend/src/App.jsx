import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';

import Home from './pages/publico/Home';
import Login from './pages/staff/Login';
import Dashboard from './pages/staff/Dashboard';
import Duenos from './pages/salud/Duenos';
import Mascotas from './pages/salud/Mascotas';
import Citas from './pages/salud/Citas';
import Atenciones from './pages/salud/Atenciones';
import Animales from './pages/refugio/Animales';
import Adopciones from './pages/refugio/Adopciones';
import Donaciones from './pages/refugio/Donaciones';
import Postulaciones from './pages/refugio/Postulaciones';
import Empleados from './pages/refugio/Empleados';
import Reportes from './pages/refugio/Reportes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- Sitio publico (Bloque A) --- */}
          <Route path="/" element={<Home />} />
          {/* Ejemplo de como se van a ir agregando las demas paginas publicas:
              <Route path="/adopciones" element={<Adopciones />} />
              <Route path="/donaciones" element={<DonacionesPublico />} />
              <Route path="/postulaciones" element={<PostulacionPublica />} />
              <Route path="/contacto" element={<Contacto />} /> */}

          {/* --- Login unico (staff y clientes; el destino despues de
              loguearse depende del rol que devuelve el backend) --- */}
          <Route path="/login" element={<Login />} />

          {/* --- Sitio interno / staff --- */}
          <Route
            path="/staff"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />
          {/* Estas 3 pantallas son del bloque de Salud: solo Administrador,
              Veterinario y Recepcionista pueden entrar (aunque escriban
              la URL directo) */}
          <Route
            path="/staff/duenos"
            element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Veterinario', 'Recepcionista']}>
                <Duenos />
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/mascotas"
            element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Veterinario', 'Recepcionista']}>
                <Mascotas />
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/citas"
            element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Veterinario', 'Recepcionista']}>
                <Citas />
              </RutaProtegida>
            }
          />
          <Route
            path="/staff/atenciones"
            element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Veterinario', 'Recepcionista']}>
                <Atenciones />
              </RutaProtegida>
            }
          />
           {/* --- Bloque C: Refugio --- */}
          <Route
            path="/staff/animales"
            element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Encargado del Refugio']}>
                <Animales />
              </RutaProtegida>
              
            }
            
          /><Route
           path="/staff/adopciones"
           element={
              <RutaProtegida rolesPermitidos={['Administrador', 'Encargado del Refugio']}>
            <Adopciones />
           </RutaProtegida>
  }
/>
<Route
  path="/staff/donaciones"
  element={
    <RutaProtegida rolesPermitidos={['Administrador', 'Encargado del Refugio']}>
      <Donaciones />
    </RutaProtegida>
  }
/>
<Route
  path="/staff/postulaciones"
  element={
    <RutaProtegida rolesPermitidos={['Administrador']}>
      <Postulaciones />
    </RutaProtegida>
  }
/>
<Route
  path="/staff/empleados"
  element={
    <RutaProtegida rolesPermitidos={['Administrador']}>
      <Empleados />
    </RutaProtegida>
  }
/>
<Route
  path="/staff/reportes"
  element={
    <RutaProtegida rolesPermitidos={['Administrador']}>
      <Reportes />
    </RutaProtegida>
  }
/>

          

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";
import LayoutPublico from "./components/publico/LayoutPublico";
import LayoutStaff from "./components/staff/LayoutStaff";

import Home from "./pages/publico/Home";
import Nosotros from "./pages/publico/Nosotros";
import Ubicacion from "./pages/publico/Ubicacion";
import Contacto from "./pages/publico/Contacto";
import InicioVeterinaria from "./pages/publico/InicioVeterinaria";
import InicioRefugio from "./pages/publico/InicioRefugio";
import Catalogo from "./pages/publico/Catalogo";
import Registro from "./pages/publico/Registro";
import AgendarCita from "./pages/publico/AgendarCita";
import MisMascotas from "./pages/publico/MisMascotas";
import MisCitas from "./pages/publico/MisCitas";
import MisAdopciones from "./pages/publico/MisAdopciones";
import MisDatos from "./pages/publico/MisDatos";
import SolicitarAdopcion from "./pages/publico/SolicitarAdopcion";
import Donar from "./pages/publico/Donar";
import Postularse from "./pages/publico/Postularse";
import Login from "./pages/staff/Login";
import CambiarContrasenaTemporal from "./pages/staff/CambiarContrasenaTemporal";
import Dashboard from "./pages/staff/Dashboard";
import Duenos from "./pages/salud/Duenos";
import Mascotas from "./pages/salud/Mascotas";
import Citas from "./pages/salud/Citas";
import Atenciones from "./pages/salud/Atenciones";
import Animales from "./pages/refugio/Animales";
import Adopciones from "./pages/refugio/Adopciones";
import Donaciones from "./pages/refugio/Donaciones";
import Postulaciones from "./pages/refugio/Postulaciones";
import Empleados from "./pages/refugio/Empleados";
import Reportes from "./pages/refugio/Reportes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- Sitio publico + Cliente (Bloque A) --- */}
          <Route element={<LayoutPublico />}>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/veterinaria" element={<InicioVeterinaria />} />
            <Route path="/refugio" element={<InicioRefugio />} />
            <Route path="/refugio/catalogo" element={<Catalogo />} />
            <Route path="/empleo/postularse" element={<Postularse />} />

            {/* Formularios que exigen estar logueado como Cliente */}
            <Route
              path="/citas/agendar"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <AgendarCita />
                </RutaProtegida>
              }
            />
            <Route
              path="/mis-mascotas"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <MisMascotas />
                </RutaProtegida>
              }
            />
            <Route
              path="/mi-perfil"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <MisDatos />
                </RutaProtegida>
              }
            />
            <Route
              path="/mis-citas"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <MisCitas />
                </RutaProtegida>
              }
            />
            <Route
              path="/mis-adopciones"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <MisAdopciones />
                </RutaProtegida>
              }
            />
            <Route
              path="/adopcion/solicitar"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <SolicitarAdopcion />
                </RutaProtegida>
              }
            />
            <Route
              path="/donar"
              element={
                <RutaProtegida rolesPermitidos={["Cliente"]}>
                  <Donar />
                </RutaProtegida>
              }
            />
          </Route>

          {/* --- Login unico (staff y clientes; el destino despues de
              loguearse depende del rol que devuelve el backend) --- */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/cambiar-contrasena-temporal"
            element={
              <RutaProtegida permitirCambioTemporal>
                <CambiarContrasenaTemporal />
              </RutaProtegida>
            }
          />

          {/* Registro de cliente: pantalla completa, sin navbar/footer
              del sitio publico (igual que el login) */}
          <Route path="/registro" element={<Registro />} />

          {/* --- Sitio interno / staff con navegación compartida --- */}
          <Route
            path="/staff"
            element={
              <RutaProtegida>
                <LayoutStaff />
              </RutaProtegida>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="duenos" element={<RutaProtegida rolesPermitidos={["Administrador", "Veterinario", "Recepcionista"]}><Duenos /></RutaProtegida>} />
            <Route path="mascotas" element={<RutaProtegida rolesPermitidos={["Administrador", "Veterinario", "Recepcionista"]}><Mascotas /></RutaProtegida>} />
            <Route path="citas" element={<RutaProtegida rolesPermitidos={["Administrador", "Veterinario", "Recepcionista"]}><Citas /></RutaProtegida>} />
            <Route path="atenciones" element={<RutaProtegida rolesPermitidos={["Administrador", "Veterinario", "Recepcionista"]}><Atenciones /></RutaProtegida>} />

            <Route path="animales" element={<RutaProtegida rolesPermitidos={["Administrador", "Encargado del Refugio"]}><Animales /></RutaProtegida>} />
            <Route path="adopciones" element={<RutaProtegida rolesPermitidos={["Administrador", "Encargado del Refugio"]}><Adopciones /></RutaProtegida>} />
            <Route path="donaciones" element={<RutaProtegida rolesPermitidos={["Administrador", "Encargado del Refugio"]}><Donaciones /></RutaProtegida>} />

            <Route path="postulaciones" element={<RutaProtegida rolesPermitidos={["Administrador"]}><Postulaciones /></RutaProtegida>} />
            <Route path="empleados" element={<RutaProtegida rolesPermitidos={["Administrador"]}><Empleados /></RutaProtegida>} />
            <Route path="reportes" element={<RutaProtegida rolesPermitidos={["Administrador"]}><Reportes /></RutaProtegida>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

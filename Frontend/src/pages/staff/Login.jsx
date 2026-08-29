import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../publico/publico.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const recienRegistrado = Boolean(location.state?.registrado);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const usuarioLogueado = await login(correo, contrasena);

      if (usuarioLogueado.debeCambiarContrasena) {
        navigate("/cambiar-contrasena-temporal", { replace: true });
      } else if (usuarioLogueado.rol === "Cliente") {
        navigate("/");
      } else {
        navigate("/staff");
      }
    } catch (err) {
      const mensaje =
        err.response?.data?.message || "No se pudo iniciar sesión";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="sitio-publico login-pagina">
      <section className="login-presentacion">
        <Link to="/" className="login-marca">
          <img src="/logo-vetcare.png" alt="Logo de Vet-Care" />

          <span>
            <strong>Vet-Care</strong>
            <small>Veterinaria y Refugio</small>
          </span>
        </Link>

        <div className="login-presentacion-contenido login-estilo-anterior">
          <div className="login-perrito">
            <img
              src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=85&w=700"
              alt="Perrito de Vet-Care"
            />
          </div>

          <div className="login-mensaje-principal">
            <h1>
              Cuidamos a quienes
              <br />
              más querés.
            </h1>

            <p>Veterinaria, refugio y bienestar animal en un mismo lugar.</p>
          </div>
        </div>
        <p className="login-presentacion-pie">
          Vet-Care · El Roble, Puntarenas
        </p>
      </section>

      <section className="login-formulario-seccion">
        <div className="login-formulario-contenedor">
          <Link to="/" className="enlace-volver login-volver">
            ← Volver al inicio
          </Link>

          <div className="login-logo-movil">
            <img src="/logo-vetcare.png" alt="Logo de Vet-Care" />

            <strong>Vet-Care</strong>
          </div>

          <form
            className="tarjeta-cuenta login-tarjeta-moderna"
            onSubmit={manejarSubmit}
          >
            <header className="login-formulario-header">
              <span className="login-formulario-etiqueta">
                Acceso a tu cuenta
              </span>

              <h2>¡Bienvenido de nuevo!</h2>

              <p>Escribe tus datos para continuar.</p>
            </header>

            {recienRegistrado && (
              <p className="mensaje-exito">
                Cuenta creada correctamente. Ya puedes iniciar sesión.
              </p>
            )}

            <div className="login-campo">
              <label htmlFor="correo">Correo electrónico</label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@correo.com"
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <div className="login-campo">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="login-contrasena-control">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-mostrar-contrasena"
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={mostrarContrasena}
                  onClick={() => setMostrarContrasena((visible) => !visible)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z" />
                    <circle cx="12" cy="12" r="2.8" />
                    {mostrarContrasena && <path d="m4 4 16 16" />}
                  </svg>
                </button>
              </div>
            </div>

            {error && <p className="mensaje-error">{error}</p>}

            <button
              type="submit"
              className="btn login-boton"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="login-separador">
              <span>¿Todavía no tienes cuenta?</span>
            </div>

            <Link to="/registro" className="login-boton-registro">
              Crear una cuenta
            </Link>
          </form>

          <p className="login-ayuda">
            El personal de Vet-Care también inicia sesión desde esta página.
          </p>
        </div>
      </section>
    </main>
  );
}

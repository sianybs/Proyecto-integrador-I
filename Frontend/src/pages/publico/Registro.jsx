import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./publico.css";

const FORM_VACIO = {
  NombreCompleto: "",
  Cedula: "",
  Telefono: "",
  CorreoElectronico: "",
  Contrasena: "",
  ConfirmarContrasena: "",
};

function BotonVisibilidad({ visible, onClick, texto }) {
  return (
    <button
      type="button"
      className="login-mostrar-contrasena"
      aria-label={visible ? `Ocultar ${texto}` : `Mostrar ${texto}`}
      aria-pressed={visible}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z" />
        <circle cx="12" cy="12" r="2.8" />
        {visible && <path d="m4 4 16 16" />}
      </svg>
    </button>
  );
}

export default function Registro() {
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const navigate = useNavigate();

  function manejarCambio(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.Contrasena.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres",
      );
      return;
    }

    if (
      form.Contrasena !== form.ConfirmarContrasena
    ) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      await axiosClient.post("/clientes", {
        NombreCompleto: form.NombreCompleto,
        Cedula: form.Cedula,
        Telefono: form.Telefono,
        CorreoElectronico: form.CorreoElectronico,
        Contrasena: form.Contrasena,
      });

      navigate("/login", {
        state: {
          registrado: true,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo completar el registro",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="sitio-publico login-pagina registro-pagina">
      <section className="login-presentacion">
        <Link to="/" className="login-marca">
          <img
            src="/logo-vetcare.png"
            alt="Logo de Vet-Care"
          />

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
              Únete a nuestra
              <br />
              familia Vet-Care.
            </h1>

            <p>
              Registra tus mascotas, agenda sus citas y
              mantén su información siempre disponible.
            </p>
          </div>
        </div>

        <p className="login-presentacion-pie">
          Vet-Care · El Roble, Puntarenas
        </p>
      </section>

      <section className="login-formulario-seccion registro-formulario-seccion">
        <div className="login-formulario-contenedor registro-contenedor">
          <Link
            to="/"
            className="enlace-volver login-volver"
          >
            ← Volver al inicio
          </Link>

          <div className="login-logo-movil">
            <img
              src="/logo-vetcare.png"
              alt="Logo de Vet-Care"
            />

            <strong>Vet-Care</strong>
          </div>

          <form
            className="tarjeta-cuenta login-tarjeta-moderna registro-tarjeta"
            onSubmit={manejarSubmit}
          >
            <header className="login-formulario-header">
              <span className="login-formulario-etiqueta">
                Nuevo cliente
              </span>

              <h2>Crea tu cuenta</h2>

              <p>
                Completa tus datos para acceder a los
                servicios de Vet-Care.
              </p>
            </header>

            <div className="registro-campos">
              <div className="login-campo registro-campo-completo">
                <label htmlFor="NombreCompleto">
                  Nombre completo
                </label>

                <input
                  id="NombreCompleto"
                  name="NombreCompleto"
                  value={form.NombreCompleto}
                  onChange={manejarCambio}
                  placeholder="Escribe tu nombre completo"
                  autoComplete="name"
                  required
                  autoFocus
                />
              </div>

              <div className="login-campo">
                <label htmlFor="Cedula">
                  Cédula
                </label>

                <input
                  id="Cedula"
                  name="Cedula"
                  value={form.Cedula}
                  onChange={manejarCambio}
                  placeholder="Número de cédula"
                  maxLength={10}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="login-campo">
                <label htmlFor="Telefono">
                  Teléfono
                </label>

                <input
                  id="Telefono"
                  name="Telefono"
                  value={form.Telefono}
                  onChange={manejarCambio}
                  placeholder="Número telefónico"
                  maxLength={8}
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="login-campo registro-campo-completo">
                <label htmlFor="CorreoElectronico">
                  Correo electrónico
                </label>

                <input
                  id="CorreoElectronico"
                  name="CorreoElectronico"
                  type="email"
                  value={form.CorreoElectronico}
                  onChange={manejarCambio}
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-campo">
                <label htmlFor="Contrasena">
                  Contraseña
                </label>

                <div className="login-contrasena-control">
                  <input
                    id="Contrasena"
                    name="Contrasena"
                    type={mostrarContrasena ? "text" : "password"}
                    value={form.Contrasena}
                    onChange={manejarCambio}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                  />
                  <BotonVisibilidad
                    visible={mostrarContrasena}
                    texto="contraseña"
                    onClick={() => setMostrarContrasena((valor) => !valor)}
                  />
                </div>
              </div>

              <div className="login-campo">
                <label htmlFor="ConfirmarContrasena">
                  Confirmar contraseña
                </label>

                <div className="login-contrasena-control">
                  <input
                    id="ConfirmarContrasena"
                    name="ConfirmarContrasena"
                    type={mostrarConfirmacion ? "text" : "password"}
                    value={form.ConfirmarContrasena}
                    onChange={manejarCambio}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    required
                  />
                  <BotonVisibilidad
                    visible={mostrarConfirmacion}
                    texto="confirmación de contraseña"
                    onClick={() => setMostrarConfirmacion((valor) => !valor)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mensaje-error">{error}</p>
            )}

            <button
              type="submit"
              className="btn registro-boton"
              disabled={cargando}
            >
              {cargando
                ? "Creando cuenta..."
                : "Crear mi cuenta"}
            </button>

            <div className="login-separador">
              <span>¿Ya tienes una cuenta?</span>
            </div>

            <Link
              to="/login"
              className="registro-boton-login"
            >
              Iniciar sesión
            </Link>
          </form>

          <p className="login-ayuda">
            Al crear tu cuenta podrás registrar varias
            mascotas y gestionar sus citas.
          </p>
        </div>
      </section>
    </main>
  );
}

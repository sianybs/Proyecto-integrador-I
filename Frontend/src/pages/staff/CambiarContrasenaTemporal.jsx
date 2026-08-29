import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import "../publico/publico.css";

function CampoContrasena({ id, label, value, onChange, visible, onCambiarVisibilidad }) {
  return (
    <div className="login-campo">
      <label htmlFor={id}>{label}</label>
      <div className="login-contrasena-control">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          minLength={6}
          required
        />
        <button
          type="button"
          className="login-mostrar-contrasena"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={onCambiarVisibilidad}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z" />
            <circle cx="12" cy="12" r="2.8" />
            {visible && <path d="m4 4 16 16" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function CambiarContrasenaTemporal() {
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const { usuario, actualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setGuardando(true);
    try {
      await axiosClient.patch("/postulaciones/empleados/mi-contrasena-temporal", {
        contrasena,
        confirmarContrasena,
      });
      actualizarUsuario({ debeCambiarContrasena: false });
      navigate("/staff", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="sitio-publico cambio-temporal-pagina">
      <section className="cambio-temporal-tarjeta">
        <img src="/logo-vetcare.png" alt="Logo de Vet-Care" />
        <span className="login-formulario-etiqueta">Primer inicio de sesión</span>
        <h1>Crea tu propia contraseña</h1>
        <p>
          Hola, <strong>{usuario?.nombre}</strong>. Por seguridad debes reemplazar
          la contraseña temporal antes de entrar al panel.
        </p>

        <form onSubmit={manejarSubmit}>
          <CampoContrasena
            id="nueva-contrasena"
            label="Nueva contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            visible={mostrarNueva}
            onCambiarVisibilidad={() => setMostrarNueva((valor) => !valor)}
          />
          <CampoContrasena
            id="confirmar-contrasena"
            label="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            visible={mostrarConfirmacion}
            onCambiarVisibilidad={() => setMostrarConfirmacion((valor) => !valor)}
          />

          <small className="cambio-temporal-ayuda">Usa al menos 6 caracteres.</small>
          {error && <p className="mensaje-error">{error}</p>}

          <button className="btn login-boton" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar y entrar al panel"}
          </button>
          <button className="cambio-temporal-salir" type="button" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </form>
      </section>
    </main>
  );
}

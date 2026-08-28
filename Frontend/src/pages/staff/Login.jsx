import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../publico/publico.css';

// Login unico para staff y clientes: el destino despues de loguearse
// depende del rol que devuelve el backend. El estilo sigue la marca del
// sitio publico porque, ademas del personal, cualquier cliente entra por
// aca (ver App.jsx).
export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const recienRegistrado = Boolean(location.state?.registrado);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuarioLogueado = await login(correo, contrasena);
      if (usuarioLogueado.rol === 'Cliente') {
        navigate('/');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      const mensaje = err.response?.data?.message || 'No se pudo iniciar sesión';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="sitio-publico pantalla-cuenta">
      <div className="columna-cuenta">
        <Link to="/" className="enlace-volver">
          ← Volver al inicio
        </Link>

        <form className="tarjeta-cuenta" onSubmit={manejarSubmit}>
          <div className="marca-login">
            <span className="marca">Vet-Care</span>
            <span className="submarca">Veterinaria/Refugio</span>
          </div>

          <h1>Bienvenido de nuevo!</h1>
          <p className="subtitulo">Un hogar para todas las mascotas</p>

          {recienRegistrado && (
            <p className="mensaje-exito">Cuenta creada correctamente. Ya podés iniciar sesión.</p>
          )}

          <label htmlFor="correo">Usuario</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoFocus
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          {error && <p className="mensaje-error">{error}</p>}

          <button type="submit" className="btn btn-rojo" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="enlace-secundario">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

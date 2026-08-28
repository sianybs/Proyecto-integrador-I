import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './publico.css';

const FORM_VACIO = {
  NombreCompleto: '',
  Cedula: '',
  Telefono: '',
  CorreoElectronico: '',
  Contrasena: '',
  ConfirmarContrasena: '',
};

export default function Registro() {
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.Contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (form.Contrasena !== form.ConfirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await axiosClient.post('/clientes', {
        NombreCompleto: form.NombreCompleto,
        Cedula: form.Cedula,
        Telefono: form.Telefono,
        CorreoElectronico: form.CorreoElectronico,
        Contrasena: form.Contrasena,
      });

      navigate('/login', { state: { registrado: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el registro');
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

          <h1>Crea tu cuenta</h1>
          <p className="subtitulo">Un hogar para todas las mascotas</p>

          <label htmlFor="NombreCompleto">Nombre completo</label>
          <input
            id="NombreCompleto"
            name="NombreCompleto"
            value={form.NombreCompleto}
            onChange={manejarCambio}
            required
            autoFocus
          />

          <label htmlFor="Cedula">Cédula</label>
          <input
            id="Cedula"
            name="Cedula"
            value={form.Cedula}
            onChange={manejarCambio}
            maxLength={10}
            required
          />

          <label htmlFor="Telefono">Teléfono</label>
          <input
            id="Telefono"
            name="Telefono"
            value={form.Telefono}
            onChange={manejarCambio}
            maxLength={8}
            required
          />

          <label htmlFor="CorreoElectronico">Correo</label>
          <input
            id="CorreoElectronico"
            name="CorreoElectronico"
            type="email"
            value={form.CorreoElectronico}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="Contrasena">Contraseña</label>
          <input
            id="Contrasena"
            name="Contrasena"
            type="password"
            value={form.Contrasena}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="ConfirmarContrasena">Confirmar contraseña</label>
          <input
            id="ConfirmarContrasena"
            name="ConfirmarContrasena"
            type="password"
            value={form.ConfirmarContrasena}
            onChange={manejarCambio}
            required
          />

          {error && <p className="mensaje-error">{error}</p>}

          <button type="submit" className="btn btn-rojo" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>

          <p className="enlace-secundario">
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

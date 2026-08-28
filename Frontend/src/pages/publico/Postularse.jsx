import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const FORM_VACIO = {
  NombreCompleto: '',
  Cedula: '',
  FechaNacimiento: '',
  CorreoElectronico: '',
  Curriculum: '',
  MotivoPostulacion: '',
  IdRol: '',
};

export default function Postularse() {
  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    axiosClient
      .get('/postulaciones/roles')
      .then(({ data }) => {
        setRoles(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, IdRol: String(data[0].IdRol) }));
        }
      })
      .catch(() => setError('No se pudieron cargar los puestos disponibles'))
      .finally(() => setCargandoRoles(false));
  }, []);

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setGuardando(true);

    try {
      await axiosClient.post('/postulaciones', form);
      setExito('¡Postulación enviada! Te contactaremos si tu perfil calza con el puesto.');
      setForm({ ...FORM_VACIO, IdRol: form.IdRol });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la postulación');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina-publica-ancho">
      <form className="form-publico" onSubmit={manejarSubmit}>
        <h1>Postularse a un empleo</h1>
        <p className="subtitulo">Sumate al equipo de Vet-Care.</p>

        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <label>
          Nombre completo
          <input
            name="NombreCompleto"
            value={form.NombreCompleto}
            onChange={manejarCambio}
            required
          />
        </label>

        <label>
          Cédula
          <input name="Cedula" value={form.Cedula} onChange={manejarCambio} maxLength={10} required />
        </label>

        <label>
          Fecha de nacimiento
          <input
            type="date"
            name="FechaNacimiento"
            value={form.FechaNacimiento}
            onChange={manejarCambio}
            required
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            name="CorreoElectronico"
            value={form.CorreoElectronico}
            onChange={manejarCambio}
            required
          />
        </label>

        <label>
          Puesto al que aplicás
          {cargandoRoles ? (
            <span>Cargando puestos...</span>
          ) : (
            <select name="IdRol" value={form.IdRol} onChange={manejarCambio} required>
              {roles.map((rol) => (
                <option key={rol.IdRol} value={rol.IdRol}>
                  {rol.NombreRol}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          Currículum (enlace, opcional)
          <input
            name="Curriculum"
            value={form.Curriculum}
            onChange={manejarCambio}
            placeholder="Enlace a tu CV"
          />
        </label>

        <label className="ancho-completo">
          ¿Por qué querés trabajar con nosotros?
          <textarea
            name="MotivoPostulacion"
            value={form.MotivoPostulacion}
            onChange={manejarCambio}
            maxLength={150}
            required
          />
        </label>

        <div className="form-botones">
          <button type="submit" className="btn btn-rojo" disabled={guardando || roles.length === 0}>
            {guardando ? 'Enviando...' : 'Enviar postulación'}
          </button>
        </div>
      </form>
    </div>
  );
}

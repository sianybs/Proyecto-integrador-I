import { useEffect, useRef, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const FORM_VACIO = {
  NombreCompleto: '',
  Cedula: '',
  FechaNacimiento: '',
  CorreoElectronico: '',
  MotivoPostulacion: '',
  IdRol: '',
};

function obtenerFechaMaximaNacimiento() {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - 18);

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

const FECHA_MAXIMA_NACIMIENTO = obtenerFechaMaximaNacimiento();

export default function Postularse() {
  const { usuario } = useAuth();
  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [perfilCliente, setPerfilCliente] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const curriculumInput = useRef(null);
  const mensajeResultado = useRef(null);

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

  useEffect(() => {
    if (usuario?.rol !== 'Cliente') return;

    let componenteActivo = true;

    axiosClient
      .get('/clientes/mi-perfil')
      .then(({ data }) => {
        if (!componenteActivo) return;

        setPerfilCliente(data);
        setForm((formActual) => ({
          ...formActual,
          NombreCompleto: data.NombreCompleto || '',
          Cedula: data.Cedula || '',
          CorreoElectronico: data.CorreoElectronico || '',
        }));
      })
      .catch(() => {
        // El formulario sigue disponible para completarlo manualmente.
      });

    return () => {
      componenteActivo = false;
    };
  }, [usuario]);

  useEffect(() => {
    if ((error || exito) && mensajeResultado.current) {
      mensajeResultado.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [error, exito]);

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function manejarCurriculum(e) {
    const archivo = e.target.files?.[0] || null;
    setError('');

    if (archivo && (archivo.type !== 'application/pdf' || !archivo.name.toLowerCase().endsWith('.pdf'))) {
      setCurriculum(null);
      e.target.value = '';
      setError('El currículum debe ser un archivo PDF');
      return;
    }

    if (archivo && archivo.size > 5 * 1024 * 1024) {
      setCurriculum(null);
      e.target.value = '';
      setError('El currículum no puede superar los 5 MB');
      return;
    }

    setCurriculum(archivo);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (form.FechaNacimiento > FECHA_MAXIMA_NACIMIENTO) {
      setError('Debes ser mayor de 18 años para enviar una postulación');
      return;
    }

    setGuardando(true);

    try {
      const datosPostulacion = new FormData();
      Object.entries(form).forEach(([campo, valor]) => datosPostulacion.append(campo, valor));
      if (curriculum) datosPostulacion.append('Curriculum', curriculum);

      await axiosClient.post('/postulaciones', datosPostulacion);
      setExito('¡Postulación enviada! Te contactaremos si tu perfil calza con el puesto.');
      setCurriculum(null);
      if (curriculumInput.current) curriculumInput.current.value = '';
      setForm({
        ...FORM_VACIO,
        IdRol: form.IdRol,
        NombreCompleto: perfilCliente?.NombreCompleto || '',
        Cedula: perfilCliente?.Cedula || '',
        CorreoElectronico: perfilCliente?.CorreoElectronico || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la postulación');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="empleo-pagina">
      <header className="empleo-hero">
        <span className="seccion-etiqueta seccion-etiqueta-clara">Únete a Vet-Care</span>
        <h1>Trabaja con nosotros</h1>
        <p>Ayúdanos a cuidar, sanar y encontrar nuevos hogares para quienes más lo necesitan.</p>
      </header>

      <section className="contenido-renovado empleo-contenido">
        <aside className="empleo-informacion">
          <span className="empleo-etiqueta">Sé parte del equipo</span>
          <h2>Tu vocación puede transformar vidas</h2>
          <p>
            Buscamos personas responsables, empáticas y comprometidas con el bienestar animal.
          </p>

          <div className="empleo-pasos">
            <div><strong>01</strong><span><b>Completa tus datos</b><small>Cuéntanos quién eres y cómo contactarte.</small></span></div>
            <div><strong>02</strong><span><b>Elige el puesto</b><small>Selecciona el área que mejor se adapte a tu perfil.</small></span></div>
            <div><strong>03</strong><span><b>Envía tu postulación</b><small>Revisaremos tu información y nos pondremos en contacto.</small></span></div>
          </div>
        </aside>

        <form className="empleo-formulario" onSubmit={manejarSubmit}>
          <div className="empleo-formulario-header">
            <span>Formulario de postulación</span>
            <h2>Queremos conocerte</h2>
            <p>Completa todos los campos marcados como obligatorios.</p>
          </div>

          <div ref={mensajeResultado} className="empleo-resultado" aria-live="polite">
            {error && (
              <div className="empleo-resultado-error" role="alert">
                <strong>No se pudo enviar</strong>
                <p>{error}</p>
              </div>
            )}

            {exito && (
              <div className="empleo-resultado-exito" role="status">
                <span>✓</span>
                <div>
                  <strong>¡Postulación enviada correctamente!</strong>
                  <p>{exito}</p>
                </div>
              </div>
            )}
          </div>

          <fieldset className="empleo-seccion-form">
            <legend>Información personal</legend>
            <div className="empleo-campos-grid">
              <label className="empleo-campo-completo">
                Nombre completo
                <input name="NombreCompleto" value={form.NombreCompleto} onChange={manejarCambio} placeholder="Escribe tu nombre completo" required />
              </label>

              <label>
                Cédula
                <input
                  name="Cedula"
                  value={form.Cedula}
                  onChange={manejarCambio}
                  maxLength={10}
                  placeholder="Número de cédula"
                  readOnly={Boolean(perfilCliente)}
                  className={perfilCliente ? 'empleo-campo-bloqueado' : ''}
                  required
                />
                {perfilCliente && <small>Tomada de tu cuenta; no puede modificarse aquí.</small>}
              </label>

              <label>
                Fecha de nacimiento
                <input
                  type="date"
                  name="FechaNacimiento"
                  value={form.FechaNacimiento}
                  onChange={manejarCambio}
                  max={FECHA_MAXIMA_NACIMIENTO}
                  required
                />
                <small>Debes tener al menos 18 años.</small>
              </label>

              <label className="empleo-campo-completo">
                Correo electrónico
                <input type="email" name="CorreoElectronico" value={form.CorreoElectronico} onChange={manejarCambio} placeholder="nombre@correo.com" required />
              </label>
            </div>
          </fieldset>

          <fieldset className="empleo-seccion-form">
            <legend>Perfil profesional</legend>
            <div className="empleo-campos-grid">
              <label>
                Puesto al que aplicas
                {cargandoRoles ? (
                  <span className="empleo-cargando">Cargando puestos...</span>
                ) : (
                  <select name="IdRol" value={form.IdRol} onChange={manejarCambio} required>
                    {roles.map((rol) => (
                      <option key={rol.IdRol} value={rol.IdRol}>{rol.NombreRol}</option>
                    ))}
                  </select>
                )}
              </label>

              <label>
                Currículum <small>(PDF opcional, máximo 5 MB)</small>
                <input
                  ref={curriculumInput}
                  type="file"
                  name="Curriculum"
                  accept="application/pdf,.pdf"
                  onChange={manejarCurriculum}
                />
                {curriculum && <small className="empleo-archivo-seleccionado">Archivo seleccionado: {curriculum.name}</small>}
                <a
                  href="/documentos/CV_Ejemplo_VetCare.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="empleo-cv-ejemplo"
                >
                  Ver un CV PDF de ejemplo
                </a>
              </label>

              <label className="empleo-campo-completo">
                ¿Por qué quieres trabajar con nosotros?
                <textarea name="MotivoPostulacion" value={form.MotivoPostulacion} onChange={manejarCambio} maxLength={150} rows={5} placeholder="Cuéntanos brevemente tu motivación..." required />
                <small>{form.MotivoPostulacion.length}/150 caracteres</small>
              </label>
            </div>
          </fieldset>

          <button type="submit" className="empleo-boton-enviar" disabled={guardando || roles.length === 0}>
            {guardando ? 'Enviando postulación...' : 'Enviar postulación'}
          </button>
        </form>
      </section>
    </main>
  );
}

import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const FORM_VACIO = {
  IdEmpleado: '',
  NombreCompleto: '',
  Cedula: '',
  CorreoElectronico: '',
  Telefono: '',
  FechaContratacion: '',
  Activo: true,
  IdRol: '',
  IdPostulacion: ''
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);

  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarEmpleados();
  }, []);

  async function cargarEmpleados() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get(
        '/postulaciones/empleados'
      );

      setEmpleados(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudieron cargar los empleados'
      );
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  function comenzarEdicion(empleado) {
    setForm({
      IdEmpleado: empleado.IdEmpleado,
      NombreCompleto: empleado.NombreCompleto || '',
      Cedula: empleado.Cedula || '',
      CorreoElectronico:
        empleado.CorreoElectronico || '',
      Telefono: empleado.Telefono || '',
      FechaContratacion:
        empleado.FechaContratacion
          ? empleado.FechaContratacion.substring(0, 10)
          : '',
      Activo:
        empleado.Activo === true ||
        empleado.Activo === 1,
      IdRol: empleado.IdRol || '',
      IdPostulacion:
        empleado.IdPostulacion || ''
    });

    setEditando(true);
    setError('');
    setMensaje('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function cancelarEdicion() {
    setForm(FORM_VACIO);
    setEditando(false);
    setError('');
  }

  async function guardarCambios(e) {
    e.preventDefault();

    if (!form.NombreCompleto.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!form.Cedula.trim()) {
      setError('La cédula es obligatoria');
      return;
    }

    setError('');
    setMensaje('');

    try {
      const datos = {
        NombreCompleto: form.NombreCompleto,
        Cedula: form.Cedula,
        CorreoElectronico:
          form.CorreoElectronico || null,
        Telefono:
          form.Telefono || null,
        FechaContratacion:
          form.FechaContratacion,
        Activo:
          form.Activo,
        IdRol:
          Number(form.IdRol),
        IdPostulacion:
          Number(form.IdPostulacion)
      };

      const { data } = await axiosClient.put(
        `/postulaciones/empleados/${form.IdEmpleado}`,
        datos
      );

      setMensaje(
        data.message ||
          'Empleado actualizado correctamente'
      );

      setForm(FORM_VACIO);
      setEditando(false);

      await cargarEmpleados();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo actualizar el empleado'
      );
    }
  }

  async function eliminarEmpleado(empleado) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${empleado.NombreCompleto}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.delete(
        `/postulaciones/empleados/${empleado.IdEmpleado}`
      );

      setMensaje(
        data.message ||
          'Empleado eliminado correctamente'
      );

      await cargarEmpleados();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo eliminar el empleado'
      );
    }
  }

  async function cambiarContrasena(empleado) {
    const nuevaContrasena = window.prompt(
      `Ingrese una nueva contraseña para ${empleado.NombreCompleto}:`
    );

    if (nuevaContrasena === null) {
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres'
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que querés cambiar la contraseña de ${empleado.NombreCompleto}?`
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      const { data } = await axiosClient.patch(
        `/postulaciones/empleados/${empleado.IdEmpleado}/contrasena`,
        {
          contrasena: nuevaContrasena
        }
      );

      setMensaje(
        data.message ||
          'Contraseña actualizada correctamente'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo cambiar la contraseña'
      );
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return '-';

    return new Date(fecha).toLocaleDateString(
      'es-CR'
    );
  }

  const empleadosFiltrados = empleados.filter(
    (empleado) => {
      const texto = busqueda.toLowerCase();

      return (
        empleado.NombreCompleto
          ?.toLowerCase()
          .includes(texto) ||
        empleado.Cedula
          ?.toString()
          .includes(texto) ||
        empleado.CorreoElectronico
          ?.toLowerCase()
          .includes(texto) ||
        empleado.NombreRol
          ?.toLowerCase()
          .includes(texto)
      );
    }
  );

  return (
    <div className="crud-pagina">
      <h1>Empleados</h1>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {mensaje && (
        <p>
          {mensaje}
        </p>
      )}

      {editando && (
        <form
          className="crud-form"
          onSubmit={guardarCambios}
        >
          <h2>Editar empleado</h2>

          <div className="crud-form-grid">
            <label>
              Nombre completo
              <input
                type="text"
                name="NombreCompleto"
                value={form.NombreCompleto}
                onChange={manejarCambio}
                required
              />
            </label>

            <label>
              Cédula
              <input
                type="text"
                name="Cedula"
                value={form.Cedula}
                onChange={manejarCambio}
                maxLength={10}
                required
              />
            </label>

            <label>
              Correo institucional
              <input
                type="email"
                name="CorreoElectronico"
                value={form.CorreoElectronico}
                onChange={manejarCambio}
              />
            </label>

            <label>
              Teléfono
              <input
                type="text"
                name="Telefono"
                value={form.Telefono}
                onChange={(e) =>
                  setForm({
                    ...form,
                    Telefono:
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 8)
                  })
                }
                maxLength={8}
                placeholder="Opcional"
              />
            </label>

            <label>
              Fecha contratación
              <input
                type="date"
                name="FechaContratacion"
                value={form.FechaContratacion}
                onChange={manejarCambio}
              />
            </label>

            <label>
              Id Rol
              <input
                type="number"
                name="IdRol"
                value={form.IdRol}
                onChange={manejarCambio}
                required
              />
            </label>

            <label>
              Id Postulación
              <input
                type="number"
                name="IdPostulacion"
                value={form.IdPostulacion}
                onChange={manejarCambio}
                required
                readOnly
              />
            </label>

            <label>
              <input
                type="checkbox"
                name="Activo"
                checked={form.Activo}
                onChange={manejarCambio}
              />
              Empleado activo
            </label>
          </div>

          <div className="crud-form-botones">
            <button type="submit">
              Guardar cambios
            </button>

            <button
              type="button"
              className="btn-secundario"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="crud-busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre, cédula, correo o rol..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        {busqueda && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setBusqueda('')
            }
          >
            Limpiar
          </button>
        )}
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : empleadosFiltrados.length === 0 ? (
        <p>No hay empleados registrados.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Contratación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {empleadosFiltrados.map(
              (empleado) => (
                <tr
                  key={empleado.IdEmpleado}
                >
                  <td>
                    {empleado.NombreCompleto}
                  </td>

                  <td>
                    {empleado.Cedula}
                  </td>

                  <td>
                    {empleado.CorreoElectronico}
                  </td>

                  <td>
                    {empleado.Telefono || '-'}
                  </td>

                  <td>
                    {empleado.NombreRol ||
                      `Rol #${empleado.IdRol || '-'}`}
                  </td>

                  <td>
                    {formatearFecha(
                      empleado.FechaContratacion
                    )}
                  </td>

                  <td>
                    {empleado.Activo
                      ? 'Activo'
                      : 'Inactivo'}
                  </td>

                  <td className="crud-tabla-acciones">
                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={() =>
                        comenzarEdicion(
                          empleado
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        cambiarContrasena(
                          empleado
                        )
                      }
                    >
                      Contraseña
                    </button>

                    <button
                      type="button"
                      className="btn-peligro"
                      onClick={() =>
                        eliminarEmpleado(
                          empleado
                        )
                      }
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
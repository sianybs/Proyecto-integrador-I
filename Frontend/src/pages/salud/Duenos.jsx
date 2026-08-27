import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const FORM_VACIO = {
  NombreCompleto: '',
  Cedula: '',
  Telefono: '',
  CorreoElectronico: '',
};

export default function Duenos() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [idEditando, setIdEditando] = useState(null); // null = estamos creando, no editando
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setCargando(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/clientes');
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los dueños');
    } finally {
      setCargando(false);
    }
  }

  async function buscar(e) {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarClientes();
      return;
    }
    setCargando(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/clientes/buscar', { params: { nombre: busqueda } });
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo buscar');
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function empezarEdicion(cliente) {
    setIdEditando(cliente.IdCliente);
    setForm({
      NombreCompleto: cliente.NombreCompleto,
      Cedula: cliente.Cedula,
      Telefono: cliente.Telefono,
      CorreoElectronico: cliente.CorreoElectronico,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setIdEditando(null);
    setForm(FORM_VACIO);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (idEditando) {
        await axiosClient.put(`/clientes/${idEditando}`, form);
      } else {
        await axiosClient.post('/clientes', form);
      }
      setForm(FORM_VACIO);
      setIdEditando(null);
      await cargarClientes();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el dueño');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(cliente) {
    const confirmar = window.confirm(`¿Seguro que querés eliminar a ${cliente.NombreCompleto}?`);
    if (!confirmar) return;

    setError('');
    try {
      await axiosClient.delete(`/clientes/${cliente.IdCliente}`);
      await cargarClientes();
    } catch (err) {
      // El backend devuelve 409 cuando el cliente tiene mascotas/citas asociadas.
      setError(err.response?.data?.message || 'No se pudo eliminar el dueño');
    }
  }

  return (
    <div className="crud-pagina">
      <h1>Dueños</h1>

      {error && <p className="mensaje-error">{error}</p>}

      <form className="crud-form" onSubmit={manejarSubmit}>
        <h2>{idEditando ? 'Editar dueño' : 'Nuevo dueño'}</h2>

        <div className="crud-form-grid">
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
            <input
              name="Cedula"
              value={form.Cedula}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Teléfono
            <input
              name="Telefono"
              value={form.Telefono}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              name="CorreoElectronico"
              value={form.CorreoElectronico}
              onChange={manejarCambio}
              required
            />
          </label>
        </div>

        <div className="crud-form-botones">
          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : idEditando ? 'Guardar cambios' : 'Crear dueño'}
          </button>
          {idEditando && (
            <button type="button" className="btn-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <form className="crud-busqueda" onSubmit={buscar}>
        <input
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="submit">Buscar</button>
        {busqueda && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => {
              setBusqueda('');
              cargarClientes();
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : clientes.length === 0 ? (
        <p>No hay dueños registrados todavía.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.IdCliente}>
                <td>{cliente.NombreCompleto}</td>
                <td>{cliente.Cedula}</td>
                <td>{cliente.Telefono}</td>
                <td>{cliente.CorreoElectronico}</td>
                <td className="crud-tabla-acciones">
                  <button className="btn-secundario" onClick={() => empezarEdicion(cliente)}>
                    Editar
                  </button>
                  <button className="btn-peligro" onClick={() => eliminar(cliente)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

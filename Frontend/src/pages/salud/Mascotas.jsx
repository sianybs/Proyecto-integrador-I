import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const FORM_VACIO = {
  Nombre: '',
  Especie: '',
  Raza: '',
  EdadAnimal: '',
  IdCliente: '',
};

export default function Mascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [idEditando, setIdEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setCargando(true);
    setError('');
    try {
      const [resMascotas, resClientes] = await Promise.all([
        axiosClient.get('/mascotas'),
        axiosClient.get('/clientes'),
      ]);
      setMascotas(resMascotas.data);
      setClientes(resClientes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las mascotas');
    } finally {
      setCargando(false);
    }
  }

  async function buscar(e) {
    e.preventDefault();
    if (!busqueda.trim()) {
      cargarTodo();
      return;
    }
    setCargando(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/mascotas/buscar', { params: { nombre: busqueda } });
      setMascotas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo buscar');
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function empezarEdicion(mascota) {
    setIdEditando(mascota.IdMascota);
    setForm({
      Nombre: mascota.Nombre,
      Especie: mascota.Especie,
      Raza: mascota.Raza,
      EdadAnimal: mascota.EdadAnimal,
      IdCliente: mascota.IdCliente,
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
      const payload = { ...form, IdCliente: Number(form.IdCliente) };
      if (idEditando) {
        await axiosClient.put(`/mascotas/${idEditando}`, payload);
      } else {
        await axiosClient.post('/mascotas', payload);
      }
      setForm(FORM_VACIO);
      setIdEditando(null);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la mascota');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(mascota) {
    const confirmar = window.confirm(`¿Seguro que querés eliminar a ${mascota.Nombre}?`);
    if (!confirmar) return;

    setError('');
    try {
      await axiosClient.delete(`/mascotas/${mascota.IdMascota}`);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la mascota');
    }
  }

  function nombreDueno(idCliente) {
    const cliente = clientes.find((c) => c.IdCliente === idCliente);
    return cliente ? cliente.NombreCompleto : `#${idCliente}`;
  }

  return (
    <div className="crud-pagina">
      <h1>Mascotas</h1>

      {error && <p className="mensaje-error">{error}</p>}

      <form className="crud-form" onSubmit={manejarSubmit}>
        <h2>{idEditando ? 'Editar mascota' : 'Nueva mascota'}</h2>

        <div className="crud-form-grid">
          <label>
            Nombre
            <input name="Nombre" value={form.Nombre} onChange={manejarCambio} required />
          </label>

          <label>
            Especie
            <input name="Especie" value={form.Especie} onChange={manejarCambio} required />
          </label>

          <label>
            Raza
            <input name="Raza" value={form.Raza} onChange={manejarCambio} required />
          </label>

          <label>
            Edad
            <input name="EdadAnimal" value={form.EdadAnimal} onChange={manejarCambio} required />
          </label>

          <label>
            Dueño
            <select name="IdCliente" value={form.IdCliente} onChange={manejarCambio} required>
              <option value="">Seleccioná un dueño...</option>
              {clientes.map((c) => (
                <option key={c.IdCliente} value={c.IdCliente}>
                  {c.NombreCompleto}
                </option>
              ))}
            </select>
          </label>
        </div>

        {clientes.length === 0 && !cargando && (
          <p className="mensaje-aviso">
            Todavía no hay dueños registrados — creá uno primero en la pantalla de Dueños.
          </p>
        )}

        <div className="crud-form-botones">
          <button type="submit" disabled={guardando || clientes.length === 0}>
            {guardando ? 'Guardando...' : idEditando ? 'Guardar cambios' : 'Crear mascota'}
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
              cargarTodo();
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : mascotas.length === 0 ? (
        <p>No hay mascotas registradas todavía.</p>
      ) : (
        <table className="crud-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Raza</th>
              <th>Edad</th>
              <th>Dueño</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mascotas.map((mascota) => (
              <tr key={mascota.IdMascota}>
                <td>{mascota.Nombre}</td>
                <td>{mascota.Especie}</td>
                <td>{mascota.Raza}</td>
                <td>{mascota.EdadAnimal}</td>
                <td>{nombreDueno(mascota.IdCliente)}</td>
                <td className="crud-tabla-acciones">
                  <button className="btn-secundario" onClick={() => empezarEdicion(mascota)}>
                    Editar
                  </button>
                  <button className="btn-peligro" onClick={() => eliminar(mascota)}>
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

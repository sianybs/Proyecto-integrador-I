import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const FORM_VACIO = {
  Nombre: '',
  Especie: '',
  Edad: '',
  Historia: '',
  Personalidad: '',
  HistorialSalud: '',
  Disponible: true,
};

export default function Animales() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [idEditando, setIdEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarAnimales();
  }, []);

  async function cargarAnimales() {
    setCargando(true);
    setError('');

    try {
      const { data } = await axiosClient.get('/refugio');
      setAnimales(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron cargar los animales del refugio'
      );
    } finally {
      setCargando(false);
    }
  }

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  }

  function empezarEdicion(animal) {
    setIdEditando(animal.IdAnimalRefugio);

    setForm({
      Nombre: animal.Nombre || '',
      Especie: animal.Especie || '',
      Edad: animal.Edad || '',
      Historia: animal.Historia || '',
      Personalidad: animal.Personalidad || '',
      HistorialSalud: animal.HistorialSalud || '',
      Disponible: Boolean(animal.Disponible),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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
      const payload = {
        ...form,
        Disponible: form.Disponible,
      };

      if (idEditando) {
        await axiosClient.put(
          `/refugio/${idEditando}`,
          payload
        );
      } else {
        await axiosClient.post(
          '/refugio',
          payload
        );
      }

      setForm(FORM_VACIO);
      setIdEditando(null);

      await cargarAnimales();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo guardar el animal'
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(animal) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar a ${animal.Nombre}?`
    );

    if (!confirmar) return;

    setError('');

    try {
      await axiosClient.delete(
        `/refugio/${animal.IdAnimalRefugio}`
      );

      await cargarAnimales();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo eliminar el animal'
      );
    }
  }

  const animalesFiltrados = animales.filter((animal) => {
    const texto = busqueda.toLowerCase();

    return (
      animal.Nombre?.toLowerCase().includes(texto) ||
      animal.Especie?.toLowerCase().includes(texto) ||
      animal.Personalidad?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="crud-pagina">
      <h1>Animales del Refugio</h1>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      <form
        className="crud-form"
        onSubmit={manejarSubmit}
      >
        <h2>
          {idEditando
            ? 'Editar animal'
            : 'Nuevo animal'}
        </h2>

        <div className="crud-form-grid">

          <label>
            Nombre
            <input
              name="Nombre"
              value={form.Nombre}
              onChange={manejarCambio}
              maxLength={30}
              required
            />
          </label>

          <label>
            Especie
            <select
              name="Especie"
              value={form.Especie}
              onChange={manejarCambio}
              required
            >
              <option value="">
                Seleccioná una especie...
              </option>

              <option value="Perro">
                Perro
              </option>

              <option value="Gato">
                Gato
              </option>

              <option value="Conejo">
                Conejo
              </option>

              <option value="Roedor">
                Roedor
              </option>

              <option value="Loro">
                Loro
              </option>

            </select>
          </label>

          <label>
            Edad
            <input
              name="Edad"
              value={form.Edad}
              onChange={manejarCambio}
              placeholder="Ej. 3 años"
              maxLength={25}
            />
          </label>

          <label>
            Personalidad
            <input
              name="Personalidad"
              value={form.Personalidad}
              onChange={manejarCambio}
              placeholder="Ej. Tranquilo y juguetón"
              maxLength={50}
            />
          </label>

          <label>
            Historia
            <textarea
              name="Historia"
              value={form.Historia}
              onChange={manejarCambio}
              placeholder="Historia del animal..."
              maxLength={100}
            />
          </label>

          <label>
            Historial de salud
            <textarea
              name="HistorialSalud"
              value={form.HistorialSalud}
              onChange={manejarCambio}
              placeholder="Información médica relevante..."
              maxLength={100}
            />
          </label>

          <label>
            Disponible para adopción

            <input
              type="checkbox"
              name="Disponible"
              checked={form.Disponible}
              onChange={manejarCambio}
            />
          </label>

        </div>

        <div className="crud-form-botones">

          <button
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : idEditando
                ? 'Guardar cambios'
                : 'Crear animal'}
          </button>

          {idEditando && (
            <button
              type="button"
              className="btn-secundario"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          )}

        </div>
      </form>

      <div className="crud-busqueda">

        <input
          placeholder="Buscar por nombre, especie o personalidad..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        {busqueda && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setBusqueda('')}
          >
            Limpiar
          </button>
        )}

      </div>

      {cargando ? (

        <p>Cargando...</p>

      ) : animalesFiltrados.length === 0 ? (

        <p>
          No hay animales registrados todavía.
        </p>

      ) : (

        <table className="crud-tabla">

          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Edad</th>
              <th>Personalidad</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {animalesFiltrados.map((animal) => (

              <tr key={animal.IdAnimalRefugio}>

                <td>
                  {animal.Nombre}
                </td>

                <td>
                  {animal.Especie}
                </td>

                <td>
                  {animal.Edad || '-'}
                </td>

                <td>
                  {animal.Personalidad || '-'}
                </td>

                <td>
                  {animal.Disponible
                    ? 'Disponible'
                    : 'No disponible'}
                </td>

                <td className="crud-tabla-acciones">

                  <button
                    className="btn-secundario"
                    onClick={() =>
                      empezarEdicion(animal)
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="btn-peligro"
                    onClick={() =>
                      eliminar(animal)
                    }
                  >
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
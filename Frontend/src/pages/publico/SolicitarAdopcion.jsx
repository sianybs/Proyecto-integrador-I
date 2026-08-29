import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function SolicitarAdopcion() {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();

  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [idAnimal, setIdAnimal] = useState(searchParams.get('animal') || '');
  const [condicionVivienda, setCondicionVivienda] = useState('');
  const [tieneMascotas, setTieneMascotas] = useState('no');
  const [motivo, setMotivo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  const animalSeleccionado = animales.find(
    (animal) => String(animal.IdAnimalRefugio) === String(idAnimal)
  );

  function obtenerFoto(animal) {
    if (animal?.Imagen) return `http://localhost:4000${animal.Imagen}`;
    return animal?.Especie === 'Gato'
      ? '/imagenes/refugio-gato.webp'
      : '/imagenes/refugio-perro.jpg';
  }

  const hoy = new Date();
  const fechaMaximaNacimiento = `${hoy.getFullYear() - 18}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    axiosClient
      .get('/refugio/disponibles')
      .then(({ data }) => {
        setAnimales(data);
        if (!idAnimal && data.length > 0) {
          setIdAnimal(String(data[0].IdAnimalRefugio));
        }
      })
      .catch(() => setError('No se pudo cargar el catálogo de animales'))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!fechaNacimiento || fechaNacimiento > fechaMaximaNacimiento) {
      setError('Debes ser mayor de 18 años para solicitar una adopción');
      return;
    }

    setGuardando(true);

    try {
      await axiosClient.post('/adopciones', {
        CondicionVivienda: condicionVivienda,
        TieneMascotas: tieneMascotas === 'si',
        MotivoAdopcion: motivo,
        FechaNacimiento: fechaNacimiento,
        IdCliente: usuario.id,
        IdAnimalRefugio: idAnimal,
      });

      setExito('¡Solicitud enviada! El refugio va a revisarla y contactarte.');
      setCondicionVivienda('');
      setMotivo('');
      setTieneMascotas('no');
      setFechaNacimiento('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="solicitud-adopcion-pagina">
      <header className="solicitud-adopcion-hero">
        <span>Un nuevo comienzo</span>
        <h1>Solicitud de adopción</h1>
        <p>Ayudanos a conocerte y encontrar el hogar ideal para cada mascota.</p>
      </header>

      <section className="solicitud-adopcion-contenido">
        <aside className="solicitud-adopcion-resumen">
          {animalSeleccionado ? (
            <>
              <img
                src={obtenerFoto(animalSeleccionado)}
                alt={`Mascota ${animalSeleccionado.Nombre}`}
              />
              <div>
                <span>Quieres adoptar a</span>
                <h2>{animalSeleccionado.Nombre}</h2>
                <p>
                  {animalSeleccionado.Especie}
                  {animalSeleccionado.Edad ? ` · ${animalSeleccionado.Edad}` : ''}
                </p>
                {animalSeleccionado.Personalidad && (
                  <small>{animalSeleccionado.Personalidad}</small>
                )}
              </div>
            </>
          ) : (
            <div className="solicitud-adopcion-sin-seleccion">
              <span>🐾</span>
              <h2>Selecciona una mascota</h2>
              <p>Aquí podrás ver los datos de tu futura compañera o compañero.</p>
            </div>
          )}

          <div className="solicitud-adopcion-aviso">
            <strong>¿Qué sucede después?</strong>
            <p>El equipo del refugio revisará tu solicitud y se pondrá en contacto contigo.</p>
          </div>
        </aside>

        <form className="solicitud-adopcion-formulario" onSubmit={manejarSubmit}>
          <div className="solicitud-adopcion-form-header">
            <span>Paso 1 de 1</span>
            <h2>Cuéntanos sobre tu hogar</h2>
            <p>Todos los campos son importantes para evaluar la solicitud.</p>
          </div>

          {error && <p className="mensaje-error">{error}</p>}
          {exito && <p className="mensaje-exito">{exito}</p>}

          <div className="solicitud-adopcion-campo">
            <label htmlFor="animal-adopcion">Mascota que quieres adoptar</label>
            {cargando ? (
              <p className="solicitud-adopcion-cargando">Cargando catálogo...</p>
            ) : (
              <select
                id="animal-adopcion"
                value={idAnimal}
                onChange={(e) => setIdAnimal(e.target.value)}
                required
              >
                {animales.length === 0 && <option value="">No hay animales disponibles</option>}
                {animales.map((animal) => (
                  <option key={animal.IdAnimalRefugio} value={animal.IdAnimalRefugio}>
                    {animal.Nombre} · {animal.Especie}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="solicitud-adopcion-campo">
            <label htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
            <input
              id="fecha-nacimiento"
              type="date"
              value={fechaNacimiento}
              max={fechaMaximaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
            <small>Debes tener al menos 18 años para adoptar.</small>
          </div>

          <div className="solicitud-adopcion-campo">
            <label htmlFor="condicion-vivienda">¿Cómo es el lugar donde vivirá?</label>
            <textarea
              id="condicion-vivienda"
              value={condicionVivienda}
              onChange={(e) => setCondicionVivienda(e.target.value)}
              placeholder="Ejemplo: casa con patio cercado, apartamento amplio..."
              maxLength={75}
              required
            />
            <small>{condicionVivienda.length}/75 caracteres</small>
          </div>

          <fieldset className="solicitud-adopcion-opciones">
            <legend>¿Actualmente tienes otras mascotas?</legend>
            <label className={tieneMascotas === 'no' ? 'seleccionada' : ''}>
              <input
                type="radio"
                name="tieneMascotas"
                value="no"
                checked={tieneMascotas === 'no'}
                onChange={(e) => setTieneMascotas(e.target.value)}
              />
              <span>No tengo mascotas</span>
            </label>
            <label className={tieneMascotas === 'si' ? 'seleccionada' : ''}>
              <input
                type="radio"
                name="tieneMascotas"
                value="si"
                checked={tieneMascotas === 'si'}
                onChange={(e) => setTieneMascotas(e.target.value)}
              />
              <span>Sí, tengo mascotas</span>
            </label>
          </fieldset>

          <div className="solicitud-adopcion-campo">
            <label htmlFor="motivo-adopcion">¿Por qué deseas adoptar?</label>
            <textarea
              id="motivo-adopcion"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Cuéntanos qué te motivó a darle un hogar..."
              maxLength={75}
              required
            />
            <small>{motivo.length}/75 caracteres</small>
          </div>

          <button
            type="submit"
            className="solicitud-adopcion-boton"
            disabled={guardando || animales.length === 0}
          >
            {guardando ? 'Enviando solicitud...' : 'Enviar solicitud de adopción'}
          </button>
          <p className="solicitud-adopcion-privacidad">
            Tus datos serán utilizados únicamente para gestionar esta solicitud.
          </p>
        </form>
      </section>
    </main>
  );
}

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

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

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
    setGuardando(true);

    try {
      await axiosClient.post('/adopciones', {
        CondicionVivienda: condicionVivienda,
        TieneMascotas: tieneMascotas === 'si',
        MotivoAdopcion: motivo,
        IdCliente: usuario.id,
        IdAnimalRefugio: idAnimal,
      });

      setExito('¡Solicitud enviada! El refugio va a revisarla y contactarte.');
      setCondicionVivienda('');
      setMotivo('');
      setTieneMascotas('no');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina-publica-ancho">
      <form className="form-publico" onSubmit={manejarSubmit}>
        <h1>Solicitar adopción</h1>
        <p className="subtitulo">Contanos un poco sobre vos para poder evaluar la solicitud.</p>

        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <label>
          Animal que querés adoptar
          {cargando ? (
            <span>Cargando catálogo...</span>
          ) : (
            <select value={idAnimal} onChange={(e) => setIdAnimal(e.target.value)} required>
              {animales.length === 0 && <option value="">No hay animales disponibles</option>}
              {animales.map((a) => (
                <option key={a.IdAnimalRefugio} value={a.IdAnimalRefugio}>
                  {a.Nombre} ({a.Especie})
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="ancho-completo">
          Condición de tu vivienda
          <textarea
            value={condicionVivienda}
            onChange={(e) => setCondicionVivienda(e.target.value)}
            placeholder="Ej. Casa con patio cercado, apartamento, etc."
            maxLength={75}
            required
          />
        </label>

        <label>
          ¿Tenés otras mascotas?
          <select value={tieneMascotas} onChange={(e) => setTieneMascotas(e.target.value)}>
            <option value="no">No</option>
            <option value="si">Sí</option>
          </select>
        </label>

        <label className="ancho-completo">
          ¿Por qué querés adoptar?
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={75}
            required
          />
        </label>

        <div className="form-botones">
          <button type="submit" className="btn btn-azul" disabled={guardando || animales.length === 0}>
            {guardando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}

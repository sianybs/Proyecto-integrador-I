import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function Donar() {
  const { usuario } = useAuth();

  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [destino, setDestino] = useState('Refugio');

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setGuardando(true);

    try {
      await axiosClient.post('/donaciones', {
        Fecha: new Date().toISOString().split('T')[0],
        Monto: monto,
        MetodoPago: metodoPago,
        DestinoDonacion: destino,
        IdCliente: usuario.id,
      });

      setExito('¡Gracias por tu donación! Quedó registrada para su aprobación.');
      setMonto('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la donación');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina-publica-ancho">
      <form className="form-publico" onSubmit={manejarSubmit}>
        <h1>Quiero donar</h1>
        <p className="subtitulo">Cada aporte ayuda a mantener el refugio y la atención veterinaria.</p>

        {error && <p className="mensaje-error">{error}</p>}
        {exito && <p className="mensaje-exito">{exito}</p>}

        <div className="form-grid">
          <label>
            Monto (₡)
            <input
              type="number"
              min="1"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </label>

          <label>
            Método de pago
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Sinpe Movil">Sinpe Móvil</option>
            </select>
          </label>

          <label className="ancho-completo">
            Destino de la donación
            <select value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="Refugio">Refugio (alimento y cuidado)</option>
              <option value="Atencion veterinaria">Atención veterinaria</option>
              <option value="Instalaciones">Mejora de instalaciones</option>
            </select>
          </label>
        </div>

        <div className="form-botones">
          <button type="submit" className="btn btn-azul" disabled={guardando}>
            {guardando ? 'Procesando...' : 'Donar'}
          </button>
        </div>
      </form>
    </div>
  );
}

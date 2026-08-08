const { sql, getPool } = require('../config/db');

// GET /api/donaciones  (Consulta "Buscar donaciones", usa vw_Donaciones)
async function getDonaciones(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarDonaciones');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/donaciones/periodo?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
async function getDonacionesPorPeriodo(req, res) {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Debes enviar ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Desde', sql.Date, desde)
      .input('Hasta', sql.Date, hasta)
      .query('SELECT * FROM vw_Donaciones WHERE Fecha BETWEEN @Desde AND @Hasta');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/donaciones/reporte  (Reporte "Donaciones recibidas": total aprobado + por destino)
async function getReporteDonaciones(req, res) {
  try {
    const pool = await getPool();
    const total = await pool.request()
      .query("SELECT ISNULL(SUM(Monto), 0) AS TotalDonaciones FROM Donacion WHERE Estado = 'Aprobada'");
    const porDestino = await pool.request()
      .query(`
        SELECT DestinoDonacion, SUM(Monto) AS TotalDonado
        FROM Donacion
        WHERE Estado = 'Aprobada'
        GROUP BY DestinoDonacion
      `);
    res.json({
      totalGeneral: total.recordset[0].TotalDonaciones,
      porDestino: porDestino.recordset,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/donaciones  (Registrar donación)
async function crearDonacion(req, res) {
  const { Fecha, Monto, MetodoPago, DestinoDonacion, IdCliente } = req.body;

  if (!Fecha || !Monto || !MetodoPago || !DestinoDonacion || !IdCliente) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Monto', sql.Decimal(10, 2), Monto)
      .input('Metodo', sql.VarChar(20), MetodoPago)
      .input('Destino', sql.VarChar(100), DestinoDonacion)
      .input('IdCliente', sql.Int, IdCliente)
      .execute('sp_CrearDonacion');

    res.status(201).json({ message: 'Donación registrada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('mayor que cero')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/donaciones/:id/aprobar
async function aprobarDonacion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdDonacion', sql.Int, req.params.id)
      .execute('sp_AprobarDonacion');

    res.json({ message: 'Donación aprobada' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('procesada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/donaciones/:id/rechazar
async function rechazarDonacion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdDonacion', sql.Int, req.params.id)
      .execute('sp_RechazarDonacion');

    res.json({ message: 'Donación rechazada' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('procesada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/donaciones/:id
async function eliminarDonacion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdDonacion', sql.Int, req.params.id)
      .execute('sp_EliminarDonacion');

    res.json({ message: 'Donación eliminada' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getDonaciones,
  getDonacionesPorPeriodo,
  getReporteDonaciones,
  crearDonacion,
  aprobarDonacion,
  rechazarDonacion,
  eliminarDonacion,
};
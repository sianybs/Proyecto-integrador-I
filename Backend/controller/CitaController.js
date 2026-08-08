const { sql, getPool } = require('../config/db');

// GET /api/citas  (incluye nombre de mascota y dueño)
async function getCitas(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarCitas');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/citas/:id
async function getCitaPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .query(`
        SELECT ci.*, m.Nombre AS NombreMascota, c.NombreCompleto AS NombreDueno
        FROM Cita ci
        INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE ci.IdCita = @IdCita
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/citas/fecha/:fecha  (reporte "Citas por fecha", formato YYYY-MM-DD)
async function getCitasPorFecha(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Fecha', sql.Date, req.params.fecha)
      .query(`
        SELECT ci.*, m.Nombre AS NombreMascota, c.NombreCompleto AS NombreDueno
        FROM Cita ci
        INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE ci.Fecha = @Fecha
        ORDER BY ci.Hora
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/citas  (Agendar cita)
async function crearCita(req, res) {
  const { Fecha, Hora, Motivo, IdMascota } = req.body;

  if (!Fecha || !Hora || !Motivo || !IdMascota) {
    return res.status(400).json({ message: 'Fecha, Hora, Motivo e IdMascota son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('IdMascota', sql.Int, IdMascota)
      .execute('sp_CrearCita');

    res.status(201).json({ message: 'Cita agendada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('pasadas')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/citas/:id  (modificar cita completa)
async function actualizarCita(req, res) {
  const { Fecha, Hora, Motivo, Estado, IdMascota } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('Estado', sql.VarChar(15), Estado)
      .input('IdMascota', sql.Int, IdMascota)
      .execute('sp_ActualizarCita');

    res.json({ message: 'Cita actualizada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('válido') || err.message.includes('pasadas')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/citas/:id/estado  (cancelar / reprogramar rápido)
async function cambiarEstadoCita(req, res) {
  const { Estado } = req.body;
  const estadosValidos = ['Pendiente', 'Atendida', 'Reprogramada', 'Cancelada'];

  if (!estadosValidos.includes(Estado)) {
    return res.status(400).json({ message: `Estado inválido. Usa uno de: ${estadosValidos.join(', ')}` });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .input('Estado', sql.VarChar(15), Estado)
      .query(`
        UPDATE Cita SET Estado = @Estado
        OUTPUT INSERTED.*
        WHERE IdCita = @IdCita
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/citas/:id
async function eliminarCita(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .execute('sp_EliminarCita');

    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'No se pudo eliminar (puede tener una atención veterinaria asociada)', detalle: err.message });
  }
}

module.exports = {
  getCitas,
  getCitaPorId,
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita,
};
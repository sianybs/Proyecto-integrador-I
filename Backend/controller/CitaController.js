const { sql, getPool } = require('../config/db');

// GET /api/citas  (incluye nombre de mascota y dueño)
async function getCitas(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT ci.*, m.Nombre AS NombreMascota, c.NombreCompleto AS NombreDueno
      FROM Cita ci
      INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
      INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
      ORDER BY ci.Fecha, ci.Hora
    `);
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

    const mascota = await pool.request()
      .input('IdMascota', sql.Int, IdMascota)
      .query('SELECT IdMascota FROM Mascota WHERE IdMascota = @IdMascota');

    if (mascota.recordset.length === 0) {
      return res.status(400).json({ message: 'La mascota (IdMascota) no existe' });
    }

    const result = await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        INSERT INTO Cita (Fecha, Hora, Motivo, Estado, IdMascota)
        OUTPUT INSERTED.*
        VALUES (@Fecha, @Hora, @Motivo, 'Pendiente', @IdMascota)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/citas/:id  (modificar cita completa)
async function actualizarCita(req, res) {
  const { Fecha, Hora, Motivo, Estado, IdMascota } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('Estado', sql.VarChar(15), Estado)
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        UPDATE Cita
        SET Fecha = @Fecha,
            Hora = @Hora,
            Motivo = @Motivo,
            Estado = @Estado,
            IdMascota = @IdMascota
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
    const result = await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .query('DELETE FROM Cita WHERE IdCita = @IdCita');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
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
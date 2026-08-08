const { sql, getPool } = require('../config/db');

// GET /api/atenciones
async function getAtenciones(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT av.*, ci.Fecha AS FechaCita, m.Nombre AS NombreMascota
      FROM AtencionVeterinaria av
      INNER JOIN Cita ci ON av.IdCita = ci.IdCita
      INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
      ORDER BY av.Fecha DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/atenciones/:id
async function getAtencionPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdAtencion', sql.Int, req.params.id)
      .query(`
        SELECT av.*, ci.Fecha AS FechaCita, m.Nombre AS NombreMascota
        FROM AtencionVeterinaria av
        INNER JOIN Cita ci ON av.IdCita = ci.IdCita
        INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
        WHERE av.IdAtencion = @IdAtencion
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Atención no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/atenciones/mascota/:idMascota  (Consulta "Historial médico")
async function getHistorialMedico(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdMascota', sql.Int, req.params.idMascota)
      .query(`
        SELECT av.*, ci.Fecha AS FechaCita, ci.Motivo
        FROM AtencionVeterinaria av
        INNER JOIN Cita ci ON av.IdCita = ci.IdCita
        WHERE ci.IdMascota = @IdMascota
        ORDER BY av.Fecha DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/atenciones  (Registrar atención veterinaria)
async function crearAtencion(req, res) {
  const { Fecha, Diagnostico, Tratamiento, Observaciones, IdCita } = req.body;

  if (!Fecha || !Diagnostico || !Tratamiento || !Observaciones || !IdCita) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Diagnostico', sql.VarChar(100), Diagnostico)
      .input('Tratamiento', sql.VarChar(100), Tratamiento)
      .input('Observaciones', sql.VarChar(100), Observaciones)
      .input('IdCita', sql.Int, IdCita)
      .execute('sp_RegistrarAtencionVeterinaria'); // también marca la cita como Atendida

    res.status(201).json({ message: 'Atención registrada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('atendida')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/atenciones/:id
async function actualizarAtencion(req, res) {
  const { Fecha, Diagnostico, Tratamiento, Observaciones } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdAtencion', sql.Int, req.params.id)
      .input('Fecha', sql.Date, Fecha)
      .input('Diagnostico', sql.VarChar(100), Diagnostico)
      .input('Tratamiento', sql.VarChar(100), Tratamiento)
      .input('Observaciones', sql.VarChar(100), Observaciones)
      .query(`
        UPDATE AtencionVeterinaria
        SET Fecha = @Fecha,
            Diagnostico = @Diagnostico,
            Tratamiento = @Tratamiento,
            Observaciones = @Observaciones
        OUTPUT INSERTED.*
        WHERE IdAtencion = @IdAtencion
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Atención no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/atenciones/:id
async function eliminarAtencion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdAtencion', sql.Int, req.params.id)
      .execute('sp_EliminarAtencionVeterinaria');

    res.json({ message: 'Atención eliminada' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// GET /api/atenciones/reporte  (Reporte "Pacientes atendidos")
async function getReporteAtenciones(req, res) {
  try {
    const pool = await getPool();

    // Cantidad total de pacientes (mascotas) atendidas al menos una vez
    const totalPacientes = await pool.request().query(`
      SELECT COUNT(DISTINCT ci.IdMascota) AS TotalPacientesAtendidos
      FROM AtencionVeterinaria av
      INNER JOIN Cita ci ON av.IdCita = ci.IdCita
    `);

    // Detalle: mascota, dueño y cuántas veces fue atendida
    const detalle = await pool.request().query(`
      SELECT m.IdMascota, m.Nombre AS NombreMascota, c.NombreCompleto AS NombreDueno,
             COUNT(av.IdAtencion) AS CantidadAtenciones
      FROM AtencionVeterinaria av
      INNER JOIN Cita ci ON av.IdCita = ci.IdCita
      INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
      INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
      GROUP BY m.IdMascota, m.Nombre, c.NombreCompleto
      ORDER BY CantidadAtenciones DESC
    `);

    res.json({
      totalPacientesAtendidos: totalPacientes.recordset[0].TotalPacientesAtendidos,
      detalle: detalle.recordset,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAtenciones,
  getAtencionPorId,
  getHistorialMedico,
  getReporteAtenciones,
  crearAtencion,
  actualizarAtencion,
  eliminarAtencion,
};
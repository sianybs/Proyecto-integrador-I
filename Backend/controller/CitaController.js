const { sql, getPool } = require('../config/db');
const { enviarCorreo } = require('../utils/mailer');

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

  const fechaHoraCita = new Date(`${Fecha}T${Hora}:00`);

if (Number.isNaN(fechaHoraCita.getTime())) {
  return res.status(400).json({
    message: 'La fecha o la hora de la cita no es válida.',
  });
}

if (fechaHoraCita <= new Date()) {
  return res.status(400).json({
    message: 'No se puede agendar una cita en una fecha u hora que ya pasó.',
  });
}

  // Validar horario de atención (8:00am - 4:00pm) directo en Node
  if (Hora < '08:00' || Hora > '16:00') {
    return res.status(400).json({ message: 'Las citas solo se pueden agendar entre las 8:00 a.m. y las 4:00 p.m.' });
  }

  try {
    const pool = await getPool();

    // Validar que la mascota exista
    const mascota = await pool.request()
      .input('IdMascota', sql.Int, IdMascota)
      .query('SELECT 1 FROM Mascota WHERE IdMascota = @IdMascota');

    if (mascota.recordset.length === 0) {
      return res.status(400).json({ message: 'La mascota no existe.' });
    }

    console.log('>>> Insertando cita:', { Fecha, Hora, Motivo, IdMascota });

    // El índice único UX_Cita_HorarioActivo es quien garantiza que no
    // se dupliquen horarios (mismo Fecha+Hora con Estado <> 'Cancelada').
    await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        INSERT INTO Cita (Fecha, Hora, Motivo, IdMascota)
        VALUES (@Fecha, @Hora, @Motivo, @IdMascota)
      `);

    console.log('>>> Cita insertada correctamente, sin error');

    // Avisar por correo al dueño de la mascota
    const dueno = await pool.request()
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        SELECT c.CorreoElectronico, c.NombreCompleto, m.Nombre AS NombreMascota
        FROM Mascota m
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE m.IdMascota = @IdMascota
      `);

    if (dueno.recordset.length > 0) {
      const { CorreoElectronico, NombreCompleto, NombreMascota } = dueno.recordset[0];

      enviarCorreo(
        CorreoElectronico,
        'Cita agendada con éxito',
        `<p>Hola ${NombreCompleto},</p>
         <p>Tu cita para <strong>${NombreMascota}</strong> fue agendada con éxito.</p>
         <p><strong>Fecha:</strong> ${Fecha}<br><strong>Hora:</strong> ${Hora}<br><strong>Motivo:</strong> ${Motivo}</p>
         <p>Gracias por confiar en nosotros.</p>`
      );
    }

    res.status(201).json({ message: 'Cita agendada correctamente' });
  } catch (err) {
    console.log('>>> crearCita tiró error. Numero:', err.number, '| Mensaje:', err.message);
    if (err.number === 2601 || err.number === 2627) {
      return res.status(409).json({ message: 'Ese horario ya está ocupado, por favor elija otra hora.' });
    }
    res.status(500).json({ message: err.message });
  }
}


// POST /api/citas  (Agendar cita)
async function crearCita(req, res) {
  const { Fecha, Hora, Motivo, IdMascota } = req.body;

  if (!Fecha || !Hora || !Motivo || !IdMascota) {
    return res.status(400).json({ message: 'Fecha, Hora, Motivo e IdMascota son obligatorios' });
  }

  // Validar horario de atención (8:00am - 4:00pm) directo en Node
  if (Hora < '08:00' || Hora > '16:00') {
    return res.status(400).json({ message: 'Las citas solo se pueden agendar entre las 8:00 a.m. y las 4:00 p.m.' });
  }

  try {
    const pool = await getPool();

    // Validar que la mascota exista
    const mascota = await pool.request()
      .input('IdMascota', sql.Int, IdMascota)
      .query('SELECT 1 FROM Mascota WHERE IdMascota = @IdMascota');

    if (mascota.recordset.length === 0) {
      return res.status(400).json({ message: 'La mascota no existe.' });
    }

    console.log('>>> Insertando cita:', { Fecha, Hora, Motivo, IdMascota });

    // El índice único UX_Cita_HorarioActivo es quien garantiza que no
    // se dupliquen horarios (mismo Fecha+Hora con Estado <> 'Cancelada').
    await pool.request()
      .input('Fecha', sql.Date, Fecha)
      .input('Hora', sql.VarChar(8), Hora)
      .input('Motivo', sql.VarChar(125), Motivo)
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        INSERT INTO Cita (Fecha, Hora, Motivo, IdMascota)
        VALUES (@Fecha, @Hora, @Motivo, @IdMascota)
      `);

    console.log('>>> Cita insertada correctamente, sin error');

    // Avisar por correo al dueño de la mascota
    const dueno = await pool.request()
      .input('IdMascota', sql.Int, IdMascota)
      .query(`
        SELECT c.CorreoElectronico, c.NombreCompleto, m.Nombre AS NombreMascota
        FROM Mascota m
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE m.IdMascota = @IdMascota
      `);

    if (dueno.recordset.length > 0) {
      const { CorreoElectronico, NombreCompleto, NombreMascota } = dueno.recordset[0];

      enviarCorreo(
        CorreoElectronico,
        'Cita agendada con éxito',
        `<p>Hola ${NombreCompleto},</p>
         <p>Tu cita para <strong>${NombreMascota}</strong> fue agendada con éxito.</p>
         <p><strong>Fecha:</strong> ${Fecha}<br><strong>Hora:</strong> ${Hora}<br><strong>Motivo:</strong> ${Motivo}</p>
         <p>Gracias por confiar en nosotros.</p>`
      );
    }

    res.status(201).json({ message: 'Cita agendada correctamente' });
  } catch (err) {
    console.log('>>> crearCita tiró error. Numero:', err.number, '| Mensaje:', err.message);
    if (err.number === 2601 || err.number === 2627) {
      return res.status(409).json({ message: 'Ese horario ya está ocupado, por favor elija otra hora.' });
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

// PATCH /api/citas/:id/cancelar  (con regla de 1 hora de anticipación)
async function cancelarCita(req, res) {
  try {
    const pool = await getPool();

    const datosCita = await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .query(`
        SELECT ci.Fecha, ci.Hora, ci.Motivo, c.NombreCompleto, m.Nombre AS NombreMascota
        FROM Cita ci
        INNER JOIN Mascota m ON ci.IdMascota = m.IdMascota
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE ci.IdCita = @IdCita
      `);

    await pool.request()
      .input('IdCita', sql.Int, req.params.id)
      .execute('sp_CancelarCita');

    if (datosCita.recordset.length > 0) {
      const { Fecha, Hora, Motivo, NombreCompleto, NombreMascota } = datosCita.recordset[0];

      enviarCorreo(
        process.env.EMAIL_USER,
        'Cita cancelada por el cliente',
        `<p>Se canceló una cita.</p>
         <p><strong>Cliente:</strong> ${NombreCompleto}<br>
         <strong>Mascota:</strong> ${NombreMascota}<br>
         <strong>Fecha:</strong> ${Fecha}<br><strong>Hora:</strong> ${Hora}<br>
         <strong>Motivo original:</strong> ${Motivo}</p>
         <p>Ese horario ya quedó libre para otra persona.</p>`
      );
    }

    res.json({ message: 'Cita cancelada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('cancelar')) {
      return res.status(400).json({ message: err.message });
    }
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
    console.log('>>> sp_AgendarCita tiró error:', err.message);
    if (err.message.includes('no existe') || err.message.includes('pasadas')) {
      return res.status(400).json({ message: err.message });
    }
    if (err.message.includes('duplicate key') || err.message.includes('UX_Cita_HorarioActivo')) {
      return res.status(409).json({ message: 'Ese horario ya está ocupado, por favor elija otra hora.' });
    }
    res.status(500).json({ message: err.message });
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
  cancelarCita,
};
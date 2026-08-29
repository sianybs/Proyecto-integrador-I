const { sql, getPool } = require('../config/db');

// GET /api/adopciones  (Consulta "Buscar adopciones", usa vw_SolicitudesAdopcion)
async function getSolicitudes(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarSolicitudesAdopcion');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/adopciones/pendientes
async function getSolicitudesPendientes(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query("SELECT * FROM vw_SolicitudesAdopcion WHERE Estado = 'Pendiente'");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/adopciones/mis-adopciones
// Devuelve solamente las solicitudes del cliente autenticado.
async function getMisAdopciones(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT
          SA.IdSolicitud,
          SA.CondicionVivienda,
          SA.TieneMascotas,
          SA.MotivoAdopcion,
          SA.Estado,
          A.IdAnimalRefugio,
          A.Nombre AS NombreAnimal,
          A.Especie,
          A.Edad,
          A.Personalidad,
          A.Imagen
        FROM SolicitudAdopcion SA
        INNER JOIN AnimalDelRefugio A
          ON A.IdAnimalRefugio = SA.IdAnimalRefugio
        WHERE SA.IdCliente = @IdCliente
          AND SA.Estado <> 'Devuelta'
        ORDER BY SA.IdSolicitud DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/adopciones  (Registrar adopción / solicitud)
async function crearSolicitud(req, res) {
  const { CondicionVivienda, TieneMascotas, MotivoAdopcion, FechaNacimiento, IdAnimalRefugio } = req.body;
  const IdCliente = req.usuario.id;

  if (!CondicionVivienda || TieneMascotas === undefined || !MotivoAdopcion || !FechaNacimiento || !IdCliente || !IdAnimalRefugio) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const nacimiento = new Date(`${FechaNacimiento}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumplio = hoy.getMonth() < nacimiento.getMonth()
    || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumplio) edad -= 1;

  if (Number.isNaN(nacimiento.getTime()) || edad < 18) {
    return res.status(400).json({
      message: 'Debes ser mayor de 18 años para solicitar una adopción'
    });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Condicion', sql.VarChar(75), CondicionVivienda)
      .input('TieneMascotas', sql.Bit, TieneMascotas)
      .input('Motivo', sql.VarChar(75), MotivoAdopcion)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('IdCliente', sql.Int, IdCliente)
      .input('IdAnimal', sql.Int, IdAnimalRefugio)
      .execute('sp_CrearSolicitudAdopcion');

    res.status(201).json({ message: 'Solicitud de adopción registrada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('mayor de 18')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/adopciones/:id/aprobar
async function aprobarSolicitud(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .execute('sp_AprobarAdopcion');

    res.json({ message: 'Solicitud aprobada. El animal ya no está disponible.' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('procesada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/adopciones/:id/rechazar
async function rechazarSolicitud(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .execute('sp_RechazarAdopcion');

    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('procesada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/adopciones/:id
async function eliminarSolicitud(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .execute('sp_EliminarSolicitudAdopcion');

    res.json({ message: 'Solicitud eliminada' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// GET /api/adopciones/reporte  (Reporte "Adopciones realizadas")
async function getReporteAdopciones(req, res) {
  try {
    const pool = await getPool();

    const total = await pool.request().query(`
      SELECT COUNT(*) AS TotalAdopcionesRealizadas
      FROM SolicitudAdopcion
      WHERE Estado = 'Aprobada'
    `);

    const detalle = await pool.request().query(`
      SELECT * FROM vw_SolicitudesAdopcion WHERE Estado = 'Aprobada'
    `);

    const porEspecie = await pool.request().query(`
      SELECT a.Especie, COUNT(*) AS Cantidad
      FROM SolicitudAdopcion sa
      INNER JOIN AnimalDelRefugio a ON sa.IdAnimalRefugio = a.IdAnimalRefugio
      WHERE sa.Estado = 'Aprobada'
      GROUP BY a.Especie
    `);

    res.json({
      totalAdopcionesRealizadas: total.recordset[0].TotalAdopcionesRealizadas,
      porEspecie: porEspecie.recordset,
      detalle: detalle.recordset,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/adopciones/:id/cancelar  (el cliente cancela mientras está Pendiente)
async function cancelarSolicitud(req, res) {
  try {
    const pool = await getPool();

    const solicitud = await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT IdSolicitud
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud AND IdCliente = @IdCliente
      `);

    if (solicitud.recordset.length === 0) {
      return res.status(404).json({ message: 'La solicitud no existe o no pertenece a tu cuenta' });
    }

    await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .execute('sp_CancelarSolicitudAdopcion');

    res.json({ message: 'Solicitud cancelada' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('pendiente')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/adopciones/:id/devolver  (el cliente devuelve una mascota ya adoptada)
async function devolverAdopcion(req, res) {
  try {
    const pool = await getPool();

    const solicitud = await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT IdSolicitud
        FROM SolicitudAdopcion
        WHERE IdSolicitud = @IdSolicitud AND IdCliente = @IdCliente
      `);

    if (solicitud.recordset.length === 0) {
      return res.status(404).json({ message: 'La adopción no existe o no pertenece a tu cuenta' });
    }

    await pool.request()
      .input('IdSolicitud', sql.Int, req.params.id)
      .execute('sp_DevolverAdopcion');

    res.json({ message: 'Mascota devuelta. Ya está disponible para adopción nuevamente.' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('adoptada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getSolicitudes,
  getSolicitudesPendientes,
  getMisAdopciones,
  getReporteAdopciones,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  devolverAdopcion,
  eliminarSolicitud,
};

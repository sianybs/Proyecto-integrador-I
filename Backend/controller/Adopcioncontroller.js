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

// POST /api/adopciones  (Registrar adopción / solicitud)
async function crearSolicitud(req, res) {
  const { CondicionVivienda, TieneMascotas, MotivoAdopcion, IdCliente, IdAnimalRefugio } = req.body;

  if (!CondicionVivienda || TieneMascotas === undefined || !MotivoAdopcion || !IdCliente || !IdAnimalRefugio) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Condicion', sql.VarChar(75), CondicionVivienda)
      .input('TieneMascotas', sql.Bit, TieneMascotas)
      .input('Motivo', sql.VarChar(75), MotivoAdopcion)
      .input('IdCliente', sql.Int, IdCliente)
      .input('IdAnimal', sql.Int, IdAnimalRefugio)
      .execute('sp_CrearSolicitudAdopcion');

    res.status(201).json({ message: 'Solicitud de adopción registrada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe')) {
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
  getReporteAdopciones,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  devolverAdopcion,
  eliminarSolicitud,
};
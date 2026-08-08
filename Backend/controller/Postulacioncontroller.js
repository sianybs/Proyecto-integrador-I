const { sql, getPool } = require('../config/db');

// GET /api/postulaciones
async function getPostulaciones(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarPostulaciones');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/postulaciones/reporte?estado=Aceptada  (Reporte "Empleados postulados")
async function getReportePostulaciones(req, res) {
  const estado = req.query.estado; // Pendiente | Aceptada | Rechazada (opcional)

  try {
    const pool = await getPool();
    const request = pool.request();
    let query = `
      SELECT P.IdPostulacion, P.NombreCompleto, P.FechaNacimiento, P.Cedula,
             P.CorreoElectronico, P.FechaPostulacion, P.MotivoPostulacion, P.Estado,
             R.NombreRol
      FROM Postulacion P
      INNER JOIN RolEmpleado R ON P.IdRol = R.IdRol
    `;
    if (estado) {
      query += ' WHERE P.Estado = @Estado';
      request.input('Estado', sql.VarChar(15), estado);
    }
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/postulaciones  (Postulación de empleo)
async function crearPostulacion(req, res) {
  const { NombreCompleto, Cedula, FechaNacimiento, CorreoElectronico, Curriculum, MotivoPostulacion, IdRol } = req.body;

  if (!NombreCompleto || !Cedula || !FechaNacimiento || !CorreoElectronico || !MotivoPostulacion || !IdRol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios (Curriculum es opcional)' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('NombreCompleto', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('CorreoElectronico', sql.VarChar(100), CorreoElectronico)
      .input('Curriculum', sql.VarChar(255), Curriculum || null)
      .input('MotivoPostulacion', sql.VarChar(150), MotivoPostulacion)
      .input('IdRol', sql.Int, IdRol)
      .execute('sp_CrearPostulacion');

    res.status(201).json({ message: 'Postulación registrada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/postulaciones/:id/contratar
async function contratarEmpleado(req, res) {
  const { Telefono } = req.body;

  if (!Telefono) {
    return res.status(400).json({ message: 'El teléfono es obligatorio para contratar' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('IdPostulacion', sql.Int, req.params.id)
      .input('Telefono', sql.VarChar(8), Telefono)
      .execute('sp_ContratarEmpleado');

    res.json({ message: 'Empleado contratado correctamente' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('procesada') || err.message.includes('generó')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/postulaciones/:id/rechazar
async function rechazarPostulacion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdPostulacion', sql.Int, req.params.id)
      .execute('sp_RechazarPostulacion');

    res.json({ message: 'Postulación rechazada' });
  } catch (err) {
    if (err.message.includes('procesada')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/postulaciones/:id
async function eliminarPostulacion(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdPostulacion', sql.Int, req.params.id)
      .execute('sp_EliminarPostulacion');

    res.json({ message: 'Postulación eliminada' });
  } catch (err) {
    if (err.message.includes('no existe') || err.message.includes('generó')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// ---------- Empleados ----------

// GET /api/postulaciones/empleados
async function getEmpleados(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarEmpleados');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/postulaciones/empleados/veterinarios  (CRUD "Veterinarios" filtrando por rol)
async function getVeterinarios(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT E.IdEmpleado, E.NombreCompleto, E.Cedula, E.CorreoElectronico,
               E.Telefono, E.FechaContratacion, E.Activo
        FROM Empleado E
        INNER JOIN RolEmpleado R ON E.IdRol = R.IdRol
        WHERE R.NombreRol = 'Veterinario'
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getPostulaciones,
  getReportePostulaciones,
  crearPostulacion,
  contratarEmpleado,
  rechazarPostulacion,
  eliminarPostulacion,
  getEmpleados,
  getVeterinarios,
};
const { sql, getPool } = require('../config/db');

// GET /api/clientes
async function getClientes(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarClientes');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/clientes/:id
async function getClientePorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCliente', sql.Int, req.params.id)
      .query('SELECT * FROM Cliente WHERE IdCliente = @IdCliente');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/clientes
async function crearCliente(req, res) {
  const { NombreCompleto, Cedula, Telefono, CorreoElectronico } = req.body;

  if (!NombreCompleto || !Cedula || !Telefono || !CorreoElectronico) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('Telefono', sql.VarChar(8), Telefono)
      .input('Correo', sql.VarChar(100), CorreoElectronico)
      .execute('sp_CrearCliente');

    res.status(201).json({ message: 'Cliente creado correctamente' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
  return res.status(409).json({
    message: 'Ya existe un dueño con esa cédula o correo electrónico',
  });
}
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/clientes/:id
async function actualizarCliente(req, res) {
  const { NombreCompleto, Cedula, Telefono, CorreoElectronico } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('IdCliente', sql.Int, req.params.id)
      .input('Nombre', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('Telefono', sql.VarChar(8), Telefono)
      .input('Correo', sql.VarChar(100), CorreoElectronico)
      .execute('sp_ActualizarCliente');

    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/clientes/:id
async function eliminarCliente(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdCliente', sql.Int, req.params.id)
      .execute('sp_EliminarCliente');

    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
        if (err.message.includes('REFERENCE constraint') || err.number === 547) {
      return res.status(409).json({ message: 'No se puede eliminar: este cliente tiene mascotas, citas u otros registros asociados.' });
    }
    res.status(500).json({ message: err.message });
  }
}

// GET /api/clientes/buscar?nombre=Maria  (Consulta "Buscar dueño")
async function buscarCliente(req, res) {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({ message: 'Debes enviar ?nombre=texto a buscar' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Nombre', sql.VarChar(120), `%${nombre}%`)
      .query(`
        SELECT C.NombreCompleto AS NombreDueno, C.Cedula, C.Telefono, C.CorreoElectronico,
               M.IdMascota, M.Nombre AS NombreMascota, M.Especie, M.Raza, M.EdadAnimal
        FROM Cliente C
        LEFT JOIN Mascota M ON C.IdCliente = M.IdCliente
        WHERE C.NombreCompleto LIKE @Nombre
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getClientes,
  getClientePorId,
  buscarCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
const { sql, getPool } = require('../config/db');

// GET /api/clientes
async function getClientes(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Cliente');
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
    const result = await pool.request()
      .input('NombreCompleto', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('Telefono', sql.VarChar(8), Telefono)
      .input('CorreoElectronico', sql.VarChar(100), CorreoElectronico)
      .query(`
        INSERT INTO Cliente (NombreCompleto, Cedula, Telefono, CorreoElectronico)
        OUTPUT INSERTED.*
        VALUES (@NombreCompleto, @Cedula, @Telefono, @CorreoElectronico)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Ya existe un cliente con esa cédula' });
    }
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/clientes/:id
async function actualizarCliente(req, res) {
  const { NombreCompleto, Cedula, Telefono, CorreoElectronico } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCliente', sql.Int, req.params.id)
      .input('NombreCompleto', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('Telefono', sql.VarChar(8), Telefono)
      .input('CorreoElectronico', sql.VarChar(100), CorreoElectronico)
      .query(`
        UPDATE Cliente
        SET NombreCompleto = @NombreCompleto,
            Cedula = @Cedula,
            Telefono = @Telefono,
            CorreoElectronico = @CorreoElectronico
        OUTPUT INSERTED.*
        WHERE IdCliente = @IdCliente
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/clientes/:id
async function eliminarCliente(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCliente', sql.Int, req.params.id)
      .query('DELETE FROM Cliente WHERE IdCliente = @IdCliente');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    // Si tiene mascotas o citas asociadas, la FK va a bloquear el DELETE
    res.status(500).json({ message: 'No se pudo eliminar (puede tener registros asociados)', detalle: err.message });
  }
}

module.exports = {
  getClientes,
  getClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
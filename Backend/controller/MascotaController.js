const { sql, getPool } = require('../config/db');

// GET /api/mascotas  (incluye nombre del dueño)
async function getMascotas(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT m.*, c.NombreCompleto AS NombreDueno
      FROM Mascota m
      INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/mascotas/:id
async function getMascotaPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdMascota', sql.Int, req.params.id)
      .query(`
        SELECT m.*, c.NombreCompleto AS NombreDueno
        FROM Mascota m
        INNER JOIN Cliente c ON m.IdCliente = c.IdCliente
        WHERE m.IdMascota = @IdMascota
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/mascotas/cliente/:idCliente  (mascotas de un dueño específico)
async function getMascotasPorCliente(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdCliente', sql.Int, req.params.idCliente)
      .query('SELECT * FROM Mascota WHERE IdCliente = @IdCliente');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/mascotas
async function crearMascota(req, res) {
  const { Nombre, Especie, Raza, EdadAnimal, IdCliente } = req.body;

  if (!Nombre || !Especie || !IdCliente) {
    return res.status(400).json({ message: 'Nombre, Especie e IdCliente son obligatorios' });
  }

  try {
    const pool = await getPool();

    // Verificar que el dueño exista
    const cliente = await pool.request()
      .input('IdCliente', sql.Int, IdCliente)
      .query('SELECT IdCliente FROM Cliente WHERE IdCliente = @IdCliente');

    if (cliente.recordset.length === 0) {
      return res.status(400).json({ message: 'El dueño (IdCliente) no existe' });
    }

    const result = await pool.request()
      .input('Nombre', sql.VarChar(35), Nombre)
      .input('Especie', sql.VarChar(15), Especie)
      .input('Raza', sql.VarChar(25), Raza || null)
      .input('EdadAnimal', sql.VarChar(15), EdadAnimal || null)
      .input('IdCliente', sql.Int, IdCliente)
      .query(`
        INSERT INTO Mascota (Nombre, Especie, Raza, EdadAnimal, IdCliente)
        OUTPUT INSERTED.*
        VALUES (@Nombre, @Especie, @Raza, @EdadAnimal, @IdCliente)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/mascotas/:id
async function actualizarMascota(req, res) {
  const { Nombre, Especie, Raza, EdadAnimal, IdCliente } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdMascota', sql.Int, req.params.id)
      .input('Nombre', sql.VarChar(35), Nombre)
      .input('Especie', sql.VarChar(15), Especie)
      .input('Raza', sql.VarChar(25), Raza || null)
      .input('EdadAnimal', sql.VarChar(15), EdadAnimal || null)
      .input('IdCliente', sql.Int, IdCliente)
      .query(`
        UPDATE Mascota
        SET Nombre = @Nombre,
            Especie = @Especie,
            Raza = @Raza,
            EdadAnimal = @EdadAnimal,
            IdCliente = @IdCliente
        OUTPUT INSERTED.*
        WHERE IdMascota = @IdMascota
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/mascotas/:id
async function eliminarMascota(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdMascota', sql.Int, req.params.id)
      .query('DELETE FROM Mascota WHERE IdMascota = @IdMascota');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    res.json({ message: 'Mascota eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'No se pudo eliminar (puede tener citas asociadas)', detalle: err.message });
  }
}

module.exports = {
  getMascotas,
  getMascotaPorId,
  getMascotasPorCliente,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
};
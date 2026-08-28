const { sql, getPool } = require('../config/db');

// GET /api/mascotas  (incluye nombre del dueño)
async function getMascotas(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarMascotas');
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
    const result = await pool.request()
      .input('Nombre', sql.VarChar(35), Nombre)
      .input('Especie', sql.VarChar(15), Especie)
      .input('Raza', sql.VarChar(25), Raza || null)
      .input('Edad', sql.VarChar(15), EdadAnimal || null)
      .input('IdCliente', sql.Int, IdCliente)
      .execute('sp_CrearMascota');

    const idMascota = result.recordset?.[0]?.IdMascota;

    res.status(201).json({ message: 'Mascota creada correctamente', IdMascota: idMascota });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/mascotas/:id
async function actualizarMascota(req, res) {
  const { Nombre, Especie, Raza, EdadAnimal, IdCliente } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('IdMascota', sql.Int, req.params.id)
      .input('Nombre', sql.VarChar(35), Nombre)
      .input('Especie', sql.VarChar(15), Especie)
      .input('Raza', sql.VarChar(25), Raza || null)
      .input('Edad', sql.VarChar(15), EdadAnimal || null)
      .input('IdCliente', sql.Int, IdCliente)
      .execute('sp_ActualizarMascota');

    res.json({ message: 'Mascota actualizada correctamente' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/mascotas/:id
async function eliminarMascota(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdMascota', sql.Int, req.params.id)
      .execute('sp_EliminarMascota');

    res.json({ message: 'Mascota eliminada' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'No se pudo eliminar (puede tener citas asociadas)', detalle: err.message });
  }
}

// GET /api/mascotas/buscar?nombre=Cleo  (Consulta "Buscar mascota")
async function buscarMascota(req, res) {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({ message: 'Debes enviar ?nombre=texto a buscar' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Nombre', sql.VarChar(70), `%${nombre}%`)
      .query(`
        SELECT M.IdMascota, M.Nombre AS NombreMascota, M.Especie, M.Raza, M.EdadAnimal,
               C.NombreCompleto AS NombreDueno, C.Telefono, C.CorreoElectronico
        FROM Mascota M
        INNER JOIN Cliente C ON M.IdCliente = C.IdCliente
        WHERE M.Nombre LIKE @Nombre
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getMascotas,
  getMascotaPorId,
  getMascotasPorCliente,
  buscarMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
};
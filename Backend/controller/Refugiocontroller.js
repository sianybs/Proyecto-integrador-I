const { sql, getPool } = require('../config/db');

// GET /api/refugio
async function getAnimales(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ConsultarAnimalesRefugio');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/refugio/disponibles  (usa la vista vw_AnimalesDisponibles)
async function getAnimalesDisponibles(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM vw_AnimalesDisponibles');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/refugio/:id
async function getAnimalPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('IdAnimalRefugio', sql.Int, req.params.id)
      .query('SELECT * FROM AnimalDelRefugio WHERE IdAnimalRefugio = @IdAnimalRefugio');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/refugio
async function crearAnimal(req, res) {
  const { Nombre, Especie, Edad, Historia, Personalidad, HistorialSalud, Disponible } = req.body;

  if (!Nombre || !Especie) {
    return res.status(400).json({ message: 'Nombre y Especie son obligatorios' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(30), Nombre)
      .input('Especie', sql.VarChar(30), Especie)
      .input('Edad', sql.VarChar(25), Edad || null)
      .input('Historia', sql.VarChar(100), Historia || null)
      .input('Personalidad', sql.VarChar(50), Personalidad || null)
      .input('HistorialSalud', sql.VarChar(100), HistorialSalud || null)
      .input('Disponible', sql.Bit, Disponible === undefined ? 1 : Disponible)
      .execute('sp_CrearAnimalRefugio');

    res.status(201).json({ message: 'Animal registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/refugio/:id
async function actualizarAnimal(req, res) {
  const { Nombre, Especie, Edad, Historia, Personalidad, HistorialSalud, Disponible } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('IdAnimalRefugio', sql.Int, req.params.id)
      .input('Nombre', sql.VarChar(30), Nombre)
      .input('Especie', sql.VarChar(30), Especie)
      .input('Edad', sql.VarChar(25), Edad || null)
      .input('Historia', sql.VarChar(100), Historia || null)
      .input('Personalidad', sql.VarChar(50), Personalidad || null)
      .input('HistorialSalud', sql.VarChar(100), HistorialSalud || null)
      .input('Disponible', sql.Bit, Disponible)
      .execute('sp_ActualizarAnimalRefugio');

    res.json({ message: 'Animal actualizado correctamente' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/refugio/:id
async function eliminarAnimal(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input('IdAnimalRefugio', sql.Int, req.params.id)
      .execute('sp_EliminarAnimalRefugio');

    res.json({ message: 'Animal eliminado' });
  } catch (err) {
    if (err.message.includes('no existe')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'No se pudo eliminar (puede tener solicitudes de adopción asociadas)', detalle: err.message });
  }
}

module.exports = {
  getAnimales,
  getAnimalesDisponibles,
  getAnimalPorId,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
};
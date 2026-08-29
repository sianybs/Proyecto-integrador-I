const bcrypt = require('bcrypt');
const { sql, getPool } = require('../config/db');
const { enviarCorreo } = require('../utils/mailer');

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
// Contrasena es opcional: si se manda (registro de cliente desde el sitio
// publico), se guarda encriptada y ese cliente ya puede hacer login.
async function crearCliente(req, res) {
  const { NombreCompleto, Cedula, Telefono, CorreoElectronico, Contrasena } = req.body;

  if (!NombreCompleto || !Cedula || !Telefono || !CorreoElectronico) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (Contrasena && Contrasena.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const hash = Contrasena ? await bcrypt.hash(Contrasena, 10) : null;

    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(100), NombreCompleto)
      .input('Cedula', sql.VarChar(10), Cedula)
      .input('Telefono', sql.VarChar(8), Telefono)
      .input('Correo', sql.VarChar(100), CorreoElectronico)
      .input('Contrasena', sql.VarChar(255), hash)
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

// GET /api/clientes/mi-perfil
async function getMiPerfil(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT
          IdCliente,
          NombreCompleto,
          Cedula,
          Telefono,
          CorreoElectronico
        FROM Cliente
        WHERE IdCliente = @IdCliente
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}

// PUT /api/clientes/mi-perfil
async function actualizarMiPerfil(req, res) {
  const {
    NombreCompleto,
    Telefono,
    CorreoElectronico,
  } = req.body;

  if (!NombreCompleto || !Telefono || !CorreoElectronico) {
    return res.status(400).json({
      message: 'Nombre, teléfono y correo son obligatorios',
    });
  }

  try {
    const pool = await getPool();

    const clienteActual = await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT Cedula
        FROM Cliente
        WHERE IdCliente = @IdCliente
      `);

    if (clienteActual.recordset.length === 0) {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    const cedula = clienteActual.recordset[0].Cedula;

    await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .input('Nombre', sql.VarChar(100), NombreCompleto.trim())
      .input('Cedula', sql.VarChar(10), cedula)
      .input('Telefono', sql.VarChar(8), Telefono.trim())
      .input(
        'Correo',
        sql.VarChar(100),
        CorreoElectronico.trim().toLowerCase()
      )
      .execute('sp_ActualizarCliente');

    res.json({
      message: 'Información actualizada correctamente',
      usuario: {
        id: req.usuario.id,
        nombre: NombreCompleto.trim(),
        correo: CorreoElectronico.trim().toLowerCase(),
        rol: 'Cliente',
      },
    });
  } catch (err) {
    if (
      err.number === 2601 ||
      err.number === 2627 ||
      err.message.includes('UNIQUE')
    ) {
      return res.status(409).json({
        message: 'Ese correo electrónico ya está registrado',
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
}

// PATCH /api/clientes/mi-perfil/contrasena
async function cambiarMiContrasena(req, res) {
  const {
    ContrasenaActual,
    NuevaContrasena,
    ConfirmarContrasena,
  } = req.body;

  if (
    !ContrasenaActual ||
    !NuevaContrasena ||
    !ConfirmarContrasena
  ) {
    return res.status(400).json({
      message: 'Debes completar todos los campos',
    });
  }

  if (NuevaContrasena.length < 6) {
    return res.status(400).json({
      message:
        'La nueva contraseña debe tener al menos 6 caracteres',
    });
  }

  if (NuevaContrasena !== ConfirmarContrasena) {
    return res.status(400).json({
      message:
        'La nueva contraseña y su confirmación no coinciden',
    });
  }

  if (ContrasenaActual === NuevaContrasena) {
    return res.status(400).json({
      message:
        'La nueva contraseña debe ser diferente a la actual',
    });
  }

  try {
    const pool = await getPool();

    const resultadoCliente = await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .query(`
        SELECT
          IdCliente,
          NombreCompleto,
          CorreoElectronico,
          Contrasena
        FROM Cliente
        WHERE IdCliente = @IdCliente
      `);

    if (resultadoCliente.recordset.length === 0) {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    const cliente = resultadoCliente.recordset[0];

    if (!cliente.Contrasena) {
      return res.status(400).json({
        message:
          'Esta cuenta todavía no tiene una contraseña configurada',
      });
    }

    const contrasenaCorrecta = await bcrypt.compare(
      ContrasenaActual,
      cliente.Contrasena
    );

    if (!contrasenaCorrecta) {
      return res.status(400).json({
        message: 'La contraseña actual es incorrecta',
      });
    }

    const nuevaContrasenaEncriptada = await bcrypt.hash(
      NuevaContrasena,
      10
    );

    await pool.request()
      .input('IdCliente', sql.Int, req.usuario.id)
      .input(
        'Contrasena',
        sql.VarChar(255),
        nuevaContrasenaEncriptada
      )
      .query(`
        UPDATE Cliente
        SET Contrasena = @Contrasena
        WHERE IdCliente = @IdCliente
      `);

    // El cambio ya fue guardado. Si el correo falla, no se revierte
    // la contraseña ni se le informa al cliente que el cambio falló.
    try {
      await enviarCorreo(
        cliente.CorreoElectronico,
        'Tu contraseña fue actualizada',
        `
          <p>Hola ${cliente.NombreCompleto},</p>

          <p>
            La contraseña de tu cuenta de Vet-Care fue actualizada
            correctamente.
          </p>

          <p>
            Si realizaste este cambio, no necesitas hacer nada más.
          </p>

          <p>
            Si no reconoces esta actividad, comunícate cuanto antes
            con Vet-Care.
          </p>

          <p>
            Por seguridad, este correo nunca incluye tu contraseña.
          </p>
        `
      );
    } catch (errorCorreo) {
      console.error(
        'No se pudo enviar el correo de cambio de contraseña:',
        errorCorreo.message
      );
    }

    res.json({
      message:
        'Contraseña actualizada correctamente. Te enviamos una confirmación por correo.',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}

module.exports = {
  getClientes,
  getClientePorId,
  buscarCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  getMiPerfil,
  actualizarMiPerfil,
  cambiarMiContrasena,
};
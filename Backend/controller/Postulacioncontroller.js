const fs = require('fs');
const { sql, getPool } = require('../config/db');

function eliminarCurriculumTemporal(archivo) {
  if (archivo?.path && fs.existsSync(archivo.path)) {
    fs.unlinkSync(archivo.path);
  }
}
const { enviarCorreo } = require('../utils/mailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// GET /api/postulaciones
async function getPostulaciones(req, res) {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .execute('sp_ConsultarPostulaciones');

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}

// GET /api/postulaciones/reporte?estado=Aceptada
async function getReportePostulaciones(req, res) {
  const estado = req.query.estado;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        P.IdPostulacion,
        P.NombreCompleto,
        P.FechaNacimiento,
        P.Cedula,
        P.CorreoElectronico,
        P.FechaPostulacion,
        P.MotivoPostulacion,
        P.Estado,
        R.NombreRol
      FROM Postulacion P
      INNER JOIN RolEmpleado R
        ON P.IdRol = R.IdRol
    `;

    if (estado) {
      query += `
        WHERE P.Estado = @Estado
      `;

      request.input(
        'Estado',
        sql.VarChar(15),
        estado
      );
    }

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}

// GET /api/postulaciones/roles  (para el select del formulario público de empleo)
async function getRolesEmpleado(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT MIN(IdRol) AS IdRol, NombreRol
      FROM RolEmpleado
      WHERE NombreRol <> 'Administrador'
      GROUP BY NombreRol
      ORDER BY NombreRol
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}

// POST /api/postulaciones
async function crearPostulacion(req, res) {
  const {
    NombreCompleto,
    Cedula,
    FechaNacimiento,
    CorreoElectronico,
    MotivoPostulacion,
    IdRol
  } = req.body;

  if (
    !NombreCompleto ||
    !Cedula ||
    !FechaNacimiento ||
    !CorreoElectronico ||
    !MotivoPostulacion ||
    !IdRol
  ) {
    eliminarCurriculumTemporal(req.file);
    return res.status(400).json({
      message:
        'Todos los campos son obligatorios (Curriculum es opcional)'
    });
  }

  const nacimiento = new Date(`${FechaNacimiento}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (aunNoCumple) edad -= 1;

  if (Number.isNaN(nacimiento.getTime()) || edad < 18) {
    eliminarCurriculumTemporal(req.file);
    return res.status(400).json({
      message: 'Debes ser mayor de 18 años para enviar una postulación'
    });
  }

  try {
    const pool = await getPool();

    await pool.request()
      .input(
        'NombreCompleto',
        sql.VarChar(100),
        NombreCompleto
      )
      .input(
        'Cedula',
        sql.VarChar(10),
        Cedula
      )
      .input(
        'FechaNacimiento',
        sql.Date,
        FechaNacimiento
      )
      .input(
        'CorreoElectronico',
        sql.VarChar(100),
        CorreoElectronico
      )
      .input(
        'Curriculum',
        sql.VarChar(255),
        req.file ? `uploads/curriculos/${req.file.filename}` : null
      )
      .input(
        'MotivoPostulacion',
        sql.VarChar(150),
        MotivoPostulacion
      )
      .input(
        'IdRol',
        sql.Int,
        IdRol
      )
      .execute('sp_CrearPostulacion');

    res.status(201).json({
      message: 'Postulación registrada correctamente'
    });
  } catch (err) {
    eliminarCurriculumTemporal(req.file);
    if (
      err.message.includes('no existe') ||
      err.message.includes('UNIQUE')
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// Genera correo institucional tipo nombre.apellido@vetcare.com
async function generarCorreoEmpleado(
  pool,
  nombreCompleto
) {
  const partes = nombreCompleto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .split(/\s+/);

  const nombre = partes[0] || 'empleado';
  const apellido = partes[1] || '';

  const base = apellido
    ? `${nombre}.${apellido}`
    : nombre;

  let correo = `${base}@vetcare.com`;
  let contador = 1;

  while (true) {
    const existe = await pool.request()
      .input(
        'Correo',
        sql.VarChar(100),
        correo
      )
      .query(`
        SELECT 1
        FROM Empleado
        WHERE CorreoElectronico = @Correo
      `);

    if (existe.recordset.length === 0) {
      break;
    }

    contador++;

    correo = `${base}${contador}@vetcare.com`;
  }

  return correo;
}

// Genera contraseña temporal de 10 caracteres
function generarContrasenaTemporal() {
  const mayuscula =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const minuscula =
    'abcdefghijklmnopqrstuvwxyz';

  const numeros =
    '0123456789';

  const especiales =
    '!@#$%';

  const obtenerCaracter = (cadena) =>
    cadena[
      crypto.randomInt(
        0,
        cadena.length
      )
    ];

  let contrasena = '';

  contrasena += obtenerCaracter(mayuscula);
  contrasena += obtenerCaracter(minuscula);
  contrasena += obtenerCaracter(numeros);
  contrasena += obtenerCaracter(especiales);

  const todos =
    mayuscula +
    minuscula +
    numeros +
    especiales;

  while (contrasena.length < 10) {
    contrasena += obtenerCaracter(todos);
  }

  return contrasena
    .split('')
    .sort(
      () =>
        crypto.randomInt(0, 2) - 0.5
    )
    .join('');
}

// PATCH /api/postulaciones/:id/contratar
async function contratarEmpleado(req, res) {
  try {
    const pool = await getPool();

    const postulacion = await pool.request()
      .input(
        'IdPostulacion',
        sql.Int,
        req.params.id
      )
      .query(`
        SELECT
          NombreCompleto,
          CorreoElectronico
        FROM Postulacion
        WHERE IdPostulacion = @IdPostulacion
      `);

    if (
      postulacion.recordset.length === 0
    ) {
      return res.status(404).json({
        message:
          'La postulación no existe'
      });
    }

    const {
      NombreCompleto,
      CorreoElectronico:
        correoPersonal
    } =
      postulacion.recordset[0];

    const correoNuevo =
      await generarCorreoEmpleado(
        pool,
        NombreCompleto
      );

    const contrasenaTemporal =
      generarContrasenaTemporal();

    const contrasenaHash =
      await bcrypt.hash(
        contrasenaTemporal,
        10
      );

    // Contratar SIN pedir teléfono
    await pool.request()
      .input(
        'IdPostulacion',
        sql.Int,
        req.params.id
      )
      .input(
        'Telefono',
        sql.VarChar(8),
        null
      )
      .input(
        'CorreoEmpleado',
        sql.VarChar(100),
        correoNuevo
      )
      .input(
        'Contrasena',
        sql.VarChar(255),
        contrasenaHash
      )
      .execute(
        'sp_ContratarEmpleado'
      );

    enviarCorreo(
      correoPersonal,
      'Credenciales de acceso - VetCare',
      `
        <p>Hola ${NombreCompleto},</p>

        <p>
          Tu postulación fue
          <strong>aceptada</strong>
          y ya formás parte del
          equipo de VetCare.
        </p>

        <p>
          Estas son tus credenciales
          de acceso al sistema:
        </p>

        <p>
          <strong>
            Correo institucional:
          </strong>
          ${correoNuevo}
          <br>

          <strong>
            Contraseña temporal:
          </strong>
          ${contrasenaTemporal}
        </p>

        <p>
          Por seguridad, deberás
          cambiar tu contraseña
          la primera vez que ingreses.
        </p>

        <p>
          Saludos,
          <br>
          Equipo VetCare
        </p>
      `
    );

    res.json({
      message:
        'Empleado contratado correctamente y credenciales enviadas por correo',

      correoAsignado:
        correoNuevo
    });

  } catch (err) {
    console.error(
      'Error al contratar empleado:',
      err
    );

    if (
      err.message.includes(
        'no existe'
      ) ||
      err.message.includes(
        'procesada'
      ) ||
      err.message.includes(
        'generó'
      )
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// PATCH /api/postulaciones/:id/rechazar
async function rechazarPostulacion(
  req,
  res
) {
  try {
    const pool = await getPool();

    await pool.request()
      .input(
        'IdPostulacion',
        sql.Int,
        req.params.id
      )
      .execute(
        'sp_RechazarPostulacion'
      );

    res.json({
      message:
        'Postulación rechazada'
    });
  } catch (err) {
    if (
      err.message.includes(
        'procesada'
      )
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// DELETE /api/postulaciones/:id
async function eliminarPostulacion(
  req,
  res
) {
  try {
    const pool = await getPool();

    await pool.request()
      .input(
        'IdPostulacion',
        sql.Int,
        req.params.id
      )
      .execute(
        'sp_EliminarPostulacion'
      );

    res.json({
      message:
        'Postulación eliminada'
    });
  } catch (err) {
    if (
      err.message.includes(
        'no existe'
      ) ||
      err.message.includes(
        'generó'
      )
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// ---------- EMPLEADOS ----------

// GET /api/postulaciones/empleados
async function getEmpleados(req, res) {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .execute(
        'sp_ConsultarEmpleados'
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}

// GET /api/postulaciones/empleados/veterinarios
async function getVeterinarios(
  req,
  res
) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`
        SELECT
          E.IdEmpleado,
          E.NombreCompleto,
          E.Cedula,
          E.CorreoElectronico,
          E.Telefono,
          E.FechaContratacion,
          E.Activo
        FROM Empleado E
        INNER JOIN RolEmpleado R
          ON E.IdRol = R.IdRol
        WHERE
          R.NombreRol =
          'Veterinario'
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}

// POST /api/postulaciones/empleados
async function crearEmpleado(req, res) {
  const {
    NombreCompleto,
    Cedula,
    CorreoElectronico,
    Telefono,
    FechaContratacion,
    Activo,
    IdRol,
    IdPostulacion,
    contrasena
  } = req.body;

  if (
    !NombreCompleto ||
    !Cedula ||
    !IdRol ||
    !IdPostulacion ||
    !contrasena
  ) {
    return res.status(400).json({
      message:
        'NombreCompleto, Cedula, IdRol, IdPostulacion y contrasena son obligatorios'
    });
  }

  try {
    const pool = await getPool();

    const hash =
      await bcrypt.hash(
        contrasena,
        10
      );

    await pool.request()
      .input(
        'NombreCompleto',
        sql.VarChar(100),
        NombreCompleto
      )
      .input(
        'Cedula',
        sql.VarChar(10),
        Cedula
      )
      .input(
        'CorreoElectronico',
        sql.VarChar(100),
        CorreoElectronico || null
      )
      .input(
        'Telefono',
        sql.VarChar(8),
        Telefono || null
      )
      .input(
        'FechaContratacion',
        sql.Date,
        FechaContratacion ||
          new Date()
      )
      .input(
        'Activo',
        sql.Bit,
        Activo === undefined
          ? 1
          : Activo
      )
      .input(
        'IdRol',
        sql.Int,
        IdRol
      )
      .input(
        'IdPostulacion',
        sql.Int,
        IdPostulacion
      )
      .input(
        'Contrasena',
        sql.VarChar(255),
        hash
      )
      .execute(
        'sp_CrearEmpleado'
      );

    res.status(201).json({
      message:
        'Empleado creado correctamente'
    });

  } catch (err) {
    if (
      err.message.includes(
        'no existe'
      ) ||
      err.message.includes(
        'UNIQUE'
      )
    ) {
      return res.status(400).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// PUT /api/postulaciones/empleados/:id
async function actualizarEmpleado(
  req,
  res
) {
  const {
    NombreCompleto,
    Cedula,
    CorreoElectronico,
    Telefono,
    FechaContratacion,
    Activo,
    IdRol,
    IdPostulacion
  } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input(
        'IdEmpleado',
        sql.Int,
        req.params.id
      )
      .input(
        'NombreCompleto',
        sql.VarChar(100),
        NombreCompleto
      )
      .input(
        'Cedula',
        sql.VarChar(10),
        Cedula
      )
      .input(
        'CorreoElectronico',
        sql.VarChar(100),
        CorreoElectronico || null
      )
      .input(
        'Telefono',
        sql.VarChar(8),
        Telefono || null
      )
      .input(
        'FechaContratacion',
        sql.Date,
        FechaContratacion
      )
      .input(
        'Activo',
        sql.Bit,
        Activo
      )
      .input(
        'IdRol',
        sql.Int,
        IdRol
      )
      .input(
        'IdPostulacion',
        sql.Int,
        IdPostulacion
      )
      .execute(
        'sp_ActualizarEmpleado'
      );

    res.json({
      message:
        'Empleado actualizado correctamente'
    });

  } catch (err) {
    if (
      err.message.includes(
        'no existe'
      )
    ) {
      return res.status(404).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// DELETE /api/postulaciones/empleados/:id
async function eliminarEmpleado(
  req,
  res
) {
  try {
    const pool = await getPool();

    await pool.request()
      .input(
        'IdEmpleado',
        sql.Int,
        req.params.id
      )
      .execute(
        'sp_EliminarEmpleado'
      );

    res.json({
      message:
        'Empleado eliminado'
    });

  } catch (err) {
    if (
      err.message.includes(
        'no existe'
      )
    ) {
      return res.status(404).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// PATCH /api/postulaciones/empleados/:id/contrasena
async function cambiarContrasenaEmpleado(
  req,
  res
) {
  const {
    contrasena
  } = req.body;

  if (
    !contrasena ||
    contrasena.length < 6
  ) {
    return res.status(400).json({
      message:
        'La contraseña debe tener al menos 6 caracteres'
    });
  }

  try {
    const hash =
      await bcrypt.hash(
        contrasena,
        10
      );

    const pool = await getPool();

    await pool.request()
      .input(
        'IdEmpleado',
        sql.Int,
        req.params.id
      )
      .input(
        'Contrasena',
        sql.VarChar(255),
        hash
      )
      .execute(
        'sp_AsignarContrasenaEmpleado'
      );

    res.json({
      message:
        'Contraseña actualizada correctamente'
    });

  } catch (err) {
    if (
      err.message.includes(
        'no existe'
      )
    ) {
      return res.status(404).json({
        message: err.message
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
}

// PATCH /api/postulaciones/empleados/mi-contrasena-temporal
// Permite que el empleado autenticado reemplace la clave temporal recibida.
async function cambiarMiContrasenaTemporal(req, res) {
  const { contrasena, confirmarContrasena } = req.body;

  if (!contrasena || contrasena.length < 6) {
    return res.status(400).json({
      message: 'La nueva contraseña debe tener al menos 6 caracteres'
    });
  }

  if (contrasena !== confirmarContrasena) {
    return res.status(400).json({
      message: 'Las contraseñas no coinciden'
    });
  }

  try {
    const pool = await getPool();
    const empleado = await pool.request()
      .input('IdEmpleado', sql.Int, req.usuario.id)
      .query(`
        SELECT IdEmpleado, DebeCambiarContrasena
        FROM Empleado
        WHERE IdEmpleado = @IdEmpleado AND Activo = 1
      `);

    if (empleado.recordset.length === 0) {
      return res.status(404).json({ message: 'El empleado no existe o está inactivo' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    await pool.request()
      .input('IdEmpleado', sql.Int, req.usuario.id)
      .input('Contrasena', sql.VarChar(255), hash)
      .query(`
        UPDATE Empleado
        SET Contrasena = @Contrasena,
            DebeCambiarContrasena = 0
        WHERE IdEmpleado = @IdEmpleado
      `);

    return res.json({
      message: 'Tu contraseña fue establecida correctamente',
      debeCambiarContrasena: false
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getPostulaciones,
  getReportePostulaciones,
  getRolesEmpleado,
  crearPostulacion,
  contratarEmpleado,
  rechazarPostulacion,
  eliminarPostulacion,
  getEmpleados,
  getVeterinarios,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  cambiarContrasenaEmpleado,
  cambiarMiContrasenaTemporal
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
  }

  try {
    const pool = await getPool();

    // 1. Buscar en Administrador
    const admin = await pool.request()
      .input('Correo', sql.VarChar(100), correo)
      .query('SELECT * FROM Administrador WHERE Correo = @Correo');

    if (admin.recordset.length > 0) {
      return validarYResponder(res, admin.recordset[0], contrasena, {
        id: admin.recordset[0].IdAdministrador,
        nombre: 'Administrador',
        rol: 'Administrador',
        correoCampo: 'Correo',
        contrasenaCampo: 'Contrasena',
      });
    }

    // 2. Buscar en Empleado (con su rol real)
    const empleado = await pool.request()
      .input('Correo', sql.VarChar(100), correo)
      .query(`
        SELECT E.*, R.NombreRol
        FROM Empleado E
        INNER JOIN RolEmpleado R ON E.IdRol = R.IdRol
        WHERE E.CorreoElectronico = @Correo
      `);

    if (empleado.recordset.length > 0) {
      const emp = empleado.recordset[0];

      if (!emp.Activo) {
        return res.status(403).json({ message: 'Esta cuenta de empleado está inactiva' });
      }

      return validarYResponder(res, emp, contrasena, {
        id: emp.IdEmpleado,
        nombre: emp.NombreCompleto,
        rol: emp.NombreRol, // ej. "Veterinario", "Recepcionista"
        correoCampo: 'CorreoElectronico',
        contrasenaCampo: 'Contrasena',
        debeCambiarContrasena: Boolean(emp.DebeCambiarContrasena),
      });
    }

    // 3. Buscar en Cliente
    const cliente = await pool.request()
      .input('Correo', sql.VarChar(100), correo)
      .query('SELECT * FROM Cliente WHERE CorreoElectronico = @Correo');

    if (cliente.recordset.length > 0) {
      return validarYResponder(res, cliente.recordset[0], contrasena, {
        id: cliente.recordset[0].IdCliente,
        nombre: cliente.recordset[0].NombreCompleto,
        rol: 'Cliente',
        correoCampo: 'CorreoElectronico',
        contrasenaCampo: 'Contrasena',
      });
    }

    // No se encontró en ninguna tabla
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Función auxiliar: compara la contraseña y arma el token si es correcta
async function validarYResponder(res, registro, contrasenaIngresada, info) {
  const hashGuardado = registro[info.contrasenaCampo];

  if (!hashGuardado) {
    return res.status(401).json({ message: 'Esta cuenta no tiene contraseña asignada todavía' });
  }

  const coincide = await bcrypt.compare(contrasenaIngresada, hashGuardado);

  if (!coincide) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: info.id, rol: info.rol, correo: registro[info.correoCampo] },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    usuario: {
      id: info.id,
      nombre: info.nombre,
      correo: registro[info.correoCampo],
      rol: info.rol,
      debeCambiarContrasena: Boolean(info.debeCambiarContrasena),
    },
  });
}

module.exports = { login };

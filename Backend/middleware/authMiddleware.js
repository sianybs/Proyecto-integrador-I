const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Debes iniciar sesión para realizar esta acción',
    });
  }

  const token = encabezado.split(' ')[1];

  try {
    const datosToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = {
      id: datosToken.id,
      rol: datosToken.rol,
      correo: datosToken.correo,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'La sesión es inválida o ha expirado',
    });
  }
}

function permitirRoles(...rolesPermitidos) {
  return function verificarRol(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({
        message: 'Debes iniciar sesión',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: 'No tienes permiso para realizar esta acción',
      });
    }

    next();
  };
}

module.exports = {
  verificarToken,
  permitirRoles,
};
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

const carpetaCurriculos = path.join(__dirname, '..', 'uploads', 'curriculos');
fs.mkdirSync(carpetaCurriculos, { recursive: true });

const almacenamientoCurriculos = multer.diskStorage({
  destination: (req, file, callback) => callback(null, carpetaCurriculos),
  filename: (req, file, callback) => {
    const nombreSeguro = `cv-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    callback(null, nombreSeguro);
  },
});

const subirCurriculum = multer({
  storage: almacenamientoCurriculos,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return callback(new Error('El currículum debe ser un archivo PDF'));
    }
    callback(null, true);
  },
});

function procesarCurriculum(req, res, next) {
  subirCurriculum.single('Curriculum')(req, res, (err) => {
    if (!err) return next();

    const mensaje = err.code === 'LIMIT_FILE_SIZE'
      ? 'El currículum no puede superar los 5 MB'
      : err.message;

    return res.status(400).json({ message: mensaje });
  });
}

const {
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
  cambiarMiContrasenaTemporal,
} = require('../controller/PostulacionController');

router.get('/roles', getRolesEmpleado);
router.get('/reporte', getReportePostulaciones);
router.get('/empleados/veterinarios', getVeterinarios);
router.get('/empleados', getEmpleados);
router.get('/', getPostulaciones);

router.post('/empleados', crearEmpleado);
router.post('/', procesarCurriculum, crearPostulacion);

router.put('/empleados/:id', actualizarEmpleado);

router.patch(
  '/empleados/mi-contrasena-temporal',
  verificarToken,
  cambiarMiContrasenaTemporal
);

router.patch(
  '/empleados/:id/contrasena',
  cambiarContrasenaEmpleado
);
router.patch('/:id/contratar', contratarEmpleado);
router.patch('/:id/rechazar', rechazarPostulacion);

router.delete('/empleados/:id', eliminarEmpleado);
router.delete('/:id', eliminarPostulacion);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getPostulaciones,
  getReportePostulaciones,
  crearPostulacion,
  contratarEmpleado,
  rechazarPostulacion,
  eliminarPostulacion,
  getEmpleados,
  getVeterinarios,
} = require('../controller/postulacionController');

router.get('/', getPostulaciones);
router.get('/reporte', getReportePostulaciones);
router.get('/empleados', getEmpleados);
router.get('/empleados/veterinarios', getVeterinarios);
router.post('/', crearPostulacion);
router.patch('/:id/contratar', contratarEmpleado);
router.patch('/:id/rechazar', rechazarPostulacion);
router.delete('/:id', eliminarPostulacion);

module.exports = router;
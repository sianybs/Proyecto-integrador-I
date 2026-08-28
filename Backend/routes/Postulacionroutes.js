const express = require('express');
const router = express.Router();
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
} = require('../controller/PostulacionController');

router.get('/', getPostulaciones);
router.get('/reporte', getReportePostulaciones);
router.get('/roles', getRolesEmpleado);
router.get('/empleados', getEmpleados);
router.get('/empleados/veterinarios', getVeterinarios);
router.post('/empleados', crearEmpleado);
router.put('/empleados/:id', actualizarEmpleado);
router.delete('/empleados/:id', eliminarEmpleado);
router.patch('/empleados/:id/contrasena', cambiarContrasenaEmpleado);
router.post('/', crearPostulacion);
router.patch('/:id/contratar', contratarEmpleado);
router.patch('/:id/rechazar', rechazarPostulacion);
router.delete('/:id', eliminarPostulacion);

module.exports = router;
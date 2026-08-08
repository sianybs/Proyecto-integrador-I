const express = require('express');
const router = express.Router();
const {
  getSolicitudes,
  getSolicitudesPendientes,
  getReporteAdopciones,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  eliminarSolicitud,
} = require('../controller/adopcionController');

router.get('/', getSolicitudes);
router.get('/pendientes', getSolicitudesPendientes);
router.get('/reporte', getReporteAdopciones);
router.post('/', crearSolicitud);
router.patch('/:id/aprobar', aprobarSolicitud);
router.patch('/:id/rechazar', rechazarSolicitud);
router.delete('/:id', eliminarSolicitud);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getDonaciones,
  getDonacionesPorPeriodo,
  getReporteDonaciones,
  crearDonacion,
  aprobarDonacion,
  rechazarDonacion,
  eliminarDonacion,
} = require('../controller/donacionController');

router.get('/', getDonaciones);
router.get('/periodo', getDonacionesPorPeriodo);
router.get('/reporte', getReporteDonaciones);
router.post('/', crearDonacion);
router.patch('/:id/aprobar', aprobarDonacion);
router.patch('/:id/rechazar', rechazarDonacion);
router.delete('/:id', eliminarDonacion);

module.exports = router;
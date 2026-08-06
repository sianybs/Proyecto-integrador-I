const express = require('express');
const router = express.Router();
const {
  getCitas,
  getCitaPorId,
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita,
} = require('../controller/citaController');

router.get('/', getCitas);
router.get('/fecha/:fecha', getCitasPorFecha);
router.get('/:id', getCitaPorId);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.patch('/:id/estado', cambiarEstadoCita);
router.delete('/:id', eliminarCita);

module.exports = router;


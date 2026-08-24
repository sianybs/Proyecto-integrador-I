const express = require('express');
const router = express.Router();
const {
  getCitas,
  getCitaPorId,
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  cancelarCita,
  eliminarCita,
} = require('../controller/CitaController');

router.get('/', getCitas);
router.get('/fecha/:fecha', getCitasPorFecha);
router.get('/:id', getCitaPorId);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.patch('/:id/estado', cambiarEstadoCita);
router.patch('/:id/cancelar', cancelarCita);
router.delete('/:id', eliminarCita);

module.exports = router;


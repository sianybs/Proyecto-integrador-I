const express = require('express');
const router = express.Router();
const {
  getMascotas,
  getMascotaPorId,
  getMascotasPorCliente,
  buscarMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
} = require('../controller/mascotaController');

router.get('/', getMascotas);
router.get('/buscar', buscarMascota);
router.get('/cliente/:idCliente', getMascotasPorCliente);
router.get('/:id', getMascotaPorId);
router.post('/', crearMascota);
router.put('/:id', actualizarMascota);
router.delete('/:id', eliminarMascota);

module.exports = router;
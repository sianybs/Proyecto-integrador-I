const express = require('express');
const router = express.Router();
const {
  getAtenciones,
  getAtencionPorId,
  getHistorialMedico,
  crearAtencion,
  actualizarAtencion,
  eliminarAtencion,
} = require('../controller/atencionController');

router.get('/', getAtenciones);
router.get('/mascota/:idMascota', getHistorialMedico);
router.get('/:id', getAtencionPorId);
router.post('/', crearAtencion);
router.put('/:id', actualizarAtencion);
router.delete('/:id', eliminarAtencion);

module.exports = router;
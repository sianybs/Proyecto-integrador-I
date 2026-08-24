const express = require('express');
const router = express.Router();
const {
  getAnimales,
  getAnimalesDisponibles,
  getAnimalPorId,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
} = require('../controller/RefugioController');

router.get('/', getAnimales);
router.get('/disponibles', getAnimalesDisponibles);
router.get('/:id', getAnimalPorId);
router.post('/', crearAnimal);
router.put('/:id', actualizarAnimal);
router.delete('/:id', eliminarAnimal);

module.exports = router;
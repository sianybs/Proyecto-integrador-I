const express = require('express');
const router = express.Router();
const {
  getClientes,
  getClientePorId,
  buscarCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require('../controller/ClienteController');

router.get('/', getClientes);
router.get('/buscar', buscarCliente);
router.get('/:id', getClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;
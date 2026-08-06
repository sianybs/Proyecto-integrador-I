const express = require('express');
const router = express.Router();
const {
  getClientes,
  getClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require('../controller/clienteController');

router.get('/', getClientes);
router.get('/:id', getClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  getClientes,
  getClientePorId,
  buscarCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  getMiPerfil,
  actualizarMiPerfil,
  cambiarMiContrasena,
} = require('../controller/ClienteController');

const {
  verificarToken,
  permitirRoles,
} = require('../middleware/authMiddleware');

// Rutas exclusivas del cliente autenticado.
// Deben aparecer antes de /:id.
router.get(
  '/mi-perfil',
  verificarToken,
  permitirRoles('Cliente'),
  getMiPerfil
);

router.put(
  '/mi-perfil',
  verificarToken,
  permitirRoles('Cliente'),
  actualizarMiPerfil
);

router.patch(
  '/mi-perfil/contrasena',
  verificarToken,
  permitirRoles('Cliente'),
  cambiarMiContrasena
);

// Rutas existentes del CRUD interno.
router.get('/', getClientes);
router.get('/buscar', buscarCliente);
router.get('/:id', getClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;
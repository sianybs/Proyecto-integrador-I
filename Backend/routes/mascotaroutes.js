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
  actualizarMiMascota,
  desactivarMiMascota,
} = require('../controller/MascotaController');

const {
  verificarToken,
  permitirRoles,
} = require('../middleware/authMiddleware');

// Actualizar una mascota perteneciente al cliente autenticado.
router.put(
  '/mi-mascota/:id',
  verificarToken,
  permitirRoles('Cliente'),
  actualizarMiMascota
);

// Desactivar una mascota perteneciente al cliente autenticado.
router.patch(
  '/mi-mascota/:id/desactivar',
  verificarToken,
  permitirRoles('Cliente'),
  desactivarMiMascota
);

// Listar todas las mascotas.
router.get('/', getMascotas);

// Buscar mascotas por nombre.
router.get('/buscar', buscarMascota);

// Obtener las mascotas activas de un cliente.
router.get('/cliente/:idCliente', getMascotasPorCliente);

// Obtener una mascota por su ID.
router.get('/:id', getMascotaPorId);

// Crear una mascota.
router.post('/', crearMascota);

// Actualización utilizada por el panel interno.
router.put('/:id', actualizarMascota);

// Eliminación física utilizada por el panel interno.
router.delete('/:id', eliminarMascota);

module.exports = router;
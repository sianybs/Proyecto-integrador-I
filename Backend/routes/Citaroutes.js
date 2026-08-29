const express = require('express');
const router = express.Router();

const {
  getCitas,
  getCitaPorId,
  getCitasPorFecha,
  getCitasPorCliente,
  getMisCitas,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  cancelarCita,
  cancelarMiCita,
  eliminarCita,
} = require('../controller/CitaController');

const {
  verificarToken,
  permitirRoles,
} = require('../middleware/authMiddleware');

const ROLES_SALUD = [
  'Administrador',
  'Veterinario',
  'Recepcionista',
];

// Rutas exclusivas del cliente autenticado.
// Deben aparecer antes de /:id.
router.get(
  '/mis-citas',
  verificarToken,
  permitirRoles('Cliente'),
  getMisCitas
);

router.patch(
  '/mis-citas/:id/cancelar',
  verificarToken,
  permitirRoles('Cliente'),
  cancelarMiCita
);

// Rutas del panel interno.
router.get('/', getCitas);
router.get('/fecha/:fecha', getCitasPorFecha);

router.get(
  '/cliente/:idCliente',
  verificarToken,
  permitirRoles(...ROLES_SALUD),
  getCitasPorCliente
);

router.get('/:id', getCitaPorId);

router.post(
  '/',
  verificarToken,
  permitirRoles('Cliente', ...ROLES_SALUD),
  crearCita
);

router.put('/:id', actualizarCita);
router.patch('/:id/estado', cambiarEstadoCita);

router.patch(
  '/:id/cancelar',
  verificarToken,
  permitirRoles(...ROLES_SALUD),
  cancelarCita
);

router.delete('/:id', eliminarCita);

module.exports = router;
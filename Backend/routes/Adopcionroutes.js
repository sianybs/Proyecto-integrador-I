const express = require('express');
const router = express.Router();
const {
  getSolicitudes,
  getSolicitudesPendientes,
  getMisAdopciones,
  getReporteAdopciones,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  devolverAdopcion,
  eliminarSolicitud,
} = require('../controller/AdopcionController');

const {
  verificarToken,
  permitirRoles,
} = require('../middleware/authMiddleware');

const ROLES_REFUGIO = ['Administrador', 'Encargado del Refugio'];

router.get('/mis-adopciones', verificarToken, permitirRoles('Cliente'), getMisAdopciones);
router.patch('/mis-adopciones/:id/cancelar', verificarToken, permitirRoles('Cliente'), cancelarSolicitud);
router.patch('/mis-adopciones/:id/devolver', verificarToken, permitirRoles('Cliente'), devolverAdopcion);

router.get('/', verificarToken, permitirRoles(...ROLES_REFUGIO), getSolicitudes);
router.get('/pendientes', verificarToken, permitirRoles(...ROLES_REFUGIO), getSolicitudesPendientes);
router.get('/reporte', verificarToken, permitirRoles('Administrador'), getReporteAdopciones);
router.post('/', verificarToken, permitirRoles('Cliente'), crearSolicitud);
router.patch('/:id/aprobar', verificarToken, permitirRoles(...ROLES_REFUGIO), aprobarSolicitud);
router.patch('/:id/rechazar', verificarToken, permitirRoles(...ROLES_REFUGIO), rechazarSolicitud);
router.delete('/:id', verificarToken, permitirRoles(...ROLES_REFUGIO), eliminarSolicitud);

module.exports = router;

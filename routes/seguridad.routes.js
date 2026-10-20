const express = require('express');
const router = express.Router();
const seguridadController = require('../controllers/seguridad.controller');
const { verificarSesion, verificarRol, verificarEstadoActivo } = require('../middleware/auth.middleware');

const superAdminOnly = [verificarSesion, verificarRol('superadmin'), verificarEstadoActivo];

// Rutas de administración de seguridad de red (exclusivas Superadmin)
router.get('/api/seguridad/ips-bloqueadas', superAdminOnly, seguridadController.obtenerIpsBloqueadas);
router.post('/api/seguridad/ips/:ip/desbloquear', superAdminOnly, seguridadController.desbloquearIp);

module.exports = router;

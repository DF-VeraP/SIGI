const express = require('express');
const router = express.Router();
const mnvccController = require('../controllers/mnvcc.controller');
const { verificarSesion, verificarRol } = require('../middleware/auth.middleware');

// Consultas operativas y de Hoja de Servicio (accesibles para visualización en Dashboard, Admin y Reportero)
router.get('/api/mnvcc/cuadrantes', mnvccController.listarCuadrantes);
router.get('/api/mnvcc/hoja-servicio/:idCuadrante', mnvccController.obtenerHojaServicio);
router.get('/api/mnvcc/problemas', mnvccController.listarProblemas);
router.get('/api/mnvcc/tamir', mnvccController.listarTamir);

// Registro de Puntos Críticos (Análisis Causal CIEPS) y asignación de TAMIR (Admin / Superadmin)
router.post('/api/mnvcc/problemas', verificarSesion, verificarRol(['admin', 'superadmin']), mnvccController.crearProblema);
router.post('/api/mnvcc/tamir', verificarSesion, verificarRol(['admin', 'superadmin']), mnvccController.crearTamir);

// Reporte de cumplimiento de TAMIR en entrega de turno (Reportero / Patrulla o Admin)
router.patch('/api/mnvcc/tamir/:id/cumplimiento', verificarSesion, mnvccController.actualizarCumplimientoTamir);

module.exports = router;

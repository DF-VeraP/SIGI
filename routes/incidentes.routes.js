const express = require('express');
const router = express.Router();
const incidentesController = require('../controllers/incidentes.controller');
const { verificarSesion, verificarRol, verificarEstadoActivo } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Middleware combo para rutas protegidas de incidentes
const authGuard = [verificarSesion, verificarEstadoActivo];

// Ruta pública / general de consulta de incidentes con filtros
router.get('/api/incidentes', incidentesController.obtenerIncidentes);

// Mis reportes (Para vista Reportero)
router.get('/api/incidentes/mis-reportes', authGuard, incidentesController.obtenerMisReportes);

// Incidentes pendientes de validación (Para Admin y Superadmin)
router.get('/api/incidentes/pendientes', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.obtenerPendientes);

// Registrar incidente individual (con o sin foto de evidencia)
router.post('/registrarIncidente', authGuard, upload.single('foto'), incidentesController.registrarIncidente);
router.post('/api/incidentes', authGuard, upload.single('foto'), incidentesController.registrarIncidente);

// Validar y cambiar estado del incidente (Para Admin y Superadmin)
router.patch('/api/incidentes/:id/estado', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.cambiarEstadoIncidente);

// Flujo de Cola Compartida: Toma de control, liberación, aprobación y desestimación (Para Admin y Superadmin)
router.post('/api/incidentes/:id/tomar', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.tomarIncidente);
router.post('/api/incidentes/:id/liberar', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.liberarIncidente);
router.post('/api/incidentes/:id/resolver', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.resolverIncidente);
router.post('/api/incidentes/:id/cerrar', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.cerrarIncidente);

// Detalle, actualización y eliminación de incidente por ID
router.get('/incidente/:id', authGuard, incidentesController.obtenerIncidente);
router.get('/api/incidentes/:id', authGuard, incidentesController.obtenerIncidente);
router.put('/incidente/:id', authGuard, incidentesController.actualizarIncidente);
router.put('/api/incidentes/:id', authGuard, incidentesController.actualizarIncidente);
router.delete('/incidente/:id', authGuard, incidentesController.eliminarIncidente);
router.delete('/api/incidentes/:id', authGuard, incidentesController.eliminarIncidente);

// Importación masiva (Solo Admin y Superadmin)
router.post('/importar-incidentes', ...authGuard, verificarRol('superadmin', 'admin'), upload.single('archivo'), incidentesController.importarIncidentesMasivo);
router.delete('/importados/ultimo', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.deshacerUltimaImportacion);

module.exports = router;

const express = require('express');
const router = express.Router();
const incidentesController = require('../controllers/incidentes.controller');
const { verificarSesion, verificarRol, verificarEstadoActivo } = require('../middleware/auth.middleware');
const path = require('path');
const multer = require('multer');

// Configuración de subida segura para fotos de evidencia (solo imágenes JPG, PNG, WEBP)
const uploadFoto = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const mimetypesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (mimetypesPermitidos.includes(file.mimetype) && extensionesPermitidas.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no permitido. Solo se aceptan archivos JPG, PNG o WEBP.'));
    }
  }
});

// Configuración de subida segura para importación masiva (solo archivos CSV)
const uploadCsv = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const mimetypesPermitidos = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (ext === '.csv' && (mimetypesPermitidos.includes(file.mimetype) || !file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no permitido. Solo se aceptan archivos con extensión .csv'));
    }
  }
});

// Middleware combo para rutas protegidas de incidentes
const authGuard = [verificarSesion, verificarEstadoActivo];

// Ruta pública / general de consulta de incidentes con filtros
router.get('/api/incidentes', incidentesController.obtenerIncidentes);

// Mis reportes (Para vista Reportero)
router.get('/api/incidentes/mis-reportes', authGuard, incidentesController.obtenerMisReportes);

// Incidentes pendientes de validación (Para Admin y Superadmin)
router.get('/api/incidentes/pendientes', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.obtenerPendientes);

// Registrar incidente individual (con o sin foto de evidencia)
router.post('/registrarIncidente', authGuard, uploadFoto.single('foto'), incidentesController.registrarIncidente);
router.post('/api/incidentes', authGuard, uploadFoto.single('foto'), incidentesController.registrarIncidente);

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
router.put('/incidente/:id', authGuard, uploadFoto.single('foto'), incidentesController.actualizarIncidente);
router.put('/api/incidentes/:id', authGuard, uploadFoto.single('foto'), incidentesController.actualizarIncidente);
router.delete('/incidente/:id', authGuard, incidentesController.eliminarIncidente);
router.delete('/api/incidentes/:id', authGuard, incidentesController.eliminarIncidente);

// Importación masiva (Solo Admin y Superadmin)
router.post('/importar-incidentes', ...authGuard, verificarRol('superadmin', 'admin'), uploadCsv.single('archivo'), incidentesController.importarIncidentesMasivo);
router.delete('/importados/ultimo', ...authGuard, verificarRol('superadmin', 'admin'), incidentesController.deshacerUltimaImportacion);

module.exports = router;

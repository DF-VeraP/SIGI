const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogos.controller');
const { verificarSesion, verificarRol, verificarEstadoActivo } = require('../middleware/auth.middleware');

// Ruta pública / accesible para consultar catálogos del sistema
router.get('/api/catalogos', catalogosController.getCatalogos);

// Rutas de administración de Tipos de Incidentes (Exclusivas de Superadmin)
router.get('/api/catalogos/tipos', verificarSesion, verificarEstadoActivo, verificarRol('superadmin'), catalogosController.getTiposConDetalle);
router.post('/api/catalogos/tipos', verificarSesion, verificarEstadoActivo, verificarRol('superadmin'), catalogosController.crearTipo);
router.put('/api/catalogos/tipos/:id', verificarSesion, verificarEstadoActivo, verificarRol('superadmin'), catalogosController.actualizarTipo);
router.patch('/api/catalogos/tipos/:id/estado', verificarSesion, verificarEstadoActivo, verificarRol('superadmin'), catalogosController.cambiarEstadoTipo);
router.delete('/api/catalogos/tipos/:id', verificarSesion, verificarEstadoActivo, verificarRol('superadmin'), catalogosController.eliminarTipo);

module.exports = router;

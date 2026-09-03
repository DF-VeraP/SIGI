const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarSesion, verificarRol, verificarEstadoActivo } = require('../middleware/auth.middleware');

// Middleware base: requerir sesión y cuenta activa
router.use('/api/usuarios', verificarSesion, verificarEstadoActivo);

// Rutas de gestión de usuarios y auditoría (Exclusivas de Superadmin)
router.get('/api/usuarios', verificarRol('superadmin'), usuariosController.getUsuarios);
router.get('/api/usuarios/auditoria/logs', verificarRol('superadmin'), usuariosController.getAuditoriaLogs);
router.get('/api/usuarios/:id', verificarRol('superadmin'), usuariosController.getUsuarioById);

// Rutas de modificación de usuarios (Solo Superadmin)
router.post('/api/usuarios', verificarRol('superadmin'), usuariosController.crearUsuario);
router.put('/api/usuarios/:id', verificarRol('superadmin'), usuariosController.actualizarUsuario);
router.patch('/api/usuarios/:id/estado', verificarRol('superadmin'), usuariosController.cambiarEstadoUsuario);
router.delete('/api/usuarios/:id', verificarRol('superadmin'), usuariosController.eliminarUsuario);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarSesion } = require('../middleware/auth.middleware');
const { loginLimiter, recuperarPasswordLimiter } = require('../middleware/rateLimit.middleware');

router.get("/admin", verificarSesion, authController.getAdmin);
router.get("/reportero", verificarSesion, authController.getReportero);
router.get("/logout", authController.logout);
router.get("/usuario", authController.getUsuario);

// Login protegido contra ataques de fuerza bruta (máx 5 intentos en 15 min)
router.post("/login", loginLimiter, authController.login);

// Rutas de recuperación de contraseña protegidas contra abuso y DoS
router.post("/api/auth/recuperar-password", recuperarPasswordLimiter, authController.recuperarPassword);
router.get("/api/auth/validar-token-reset", authController.validarTokenReset);
router.post("/api/auth/reset-password", authController.resetPassword);
router.post("/api/auth/cambiar-password-primer-ingreso", verificarSesion, authController.cambiarPasswordPrimerIngreso);

module.exports = router;

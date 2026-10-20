/**
 * SIGI — Middleware de Limitación de Tasa (Rate Limiting)
 * Protege contra ataques de fuerza bruta, credential stuffing y DoS.
 */

const rateLimit = require('express-rate-limit');
const gestorIps = require('../utils/gestorIps');

const isTest = process.env.NODE_ENV === 'test';

// Limitador estricto para inicio de sesión: 5 intentos cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isTest ? 100 : 5, // 5 intentos en producción/dev
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    const rawIp = req.ip || req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    return gestorIps.normalizarIp(rawIp);
  },
  message: {
    mensaje: "Demasiados intentos de acceso fallidos desde esta IP. Por seguridad, el acceso ha sido bloqueado temporalmente por 15 minutos."
  },
  handler: (req, res, next, options) => {
    const rawIp = req.ip || req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const nuevoBloqueo = gestorIps.registrarBloqueo(rawIp, 'Exceso de intentos de acceso fallidos en inicio de sesión (5 intentos)');

    try {
      const io = req.app && req.app.get('io');
      if (io) {
        io.emit('ip_bloqueada', nuevoBloqueo);
      }
    } catch (wsErr) {
      // Ignorar si socket.io no está listo
    }

    res.status(options.statusCode).json(options.message);
  }
});

gestorIps.setLoginLimiter(loginLimiter);

// Limitador para recuperación de contraseñas: 3 solicitudes cada 15 minutos
const recuperarPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Has alcanzado el límite de solicitudes de recuperación de contraseña. Por favor espera 15 minutos antes de intentar de nuevo."
  }
});

// Limitador general para la API pública: 300 peticiones cada 15 minutos
const apiGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Demasiadas peticiones al servidor. Por favor reduce la frecuencia de consultas."
  }
});

module.exports = {
  loginLimiter,
  recuperarPasswordLimiter,
  apiGeneralLimiter
};

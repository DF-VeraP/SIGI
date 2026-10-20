const crypto = require('crypto');

/**
 * Middleware de Protección contra CSRF (Cross-Site Request Forgery)
 * Implementa el patrón Double Submit Cookie con validación de encabezado X-CSRF-Token.
 */

// Rutas exentas de verificación CSRF (autenticación inicial y endpoints públicos)
const RUTAS_EXENTAS = [
  '/login',
  '/test-db',
  '/api/auth/recuperar-password',
  '/api/auth/reset-password'
];

function csrfProtection(req, res, next) {
  // En entorno de tests de Jest, no bloquear llamadas de Supertest
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Generar token CSRF para la sesión si aún no existe
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  const token = req.session ? req.session.csrfToken : null;

  // Enviar cookie accesible por el cliente frontend (httpOnly: false)
  if (token) {
    res.cookie('XSRF-TOKEN', token, {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false
    });
  }

  // Métodos seguros (idempotentes) que solo consultan información
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Verificar si la ruta está en la lista blanca de excepciones
  if (RUTAS_EXENTAS.some(ruta => req.path.startsWith(ruta))) {
    return next();
  }

  // Obtener el token enviado por el cliente en encabezados o body
  const clientToken = req.headers['x-csrf-token'] || 
                      req.headers['x-xsrf-token'] || 
                      (req.body && req.body._csrf);

  if (!token || !clientToken || clientToken !== token) {
    // Verificación estricta de mismo origen legítimo (Exact Host Match con URL parser)
    let sameOrigin = false;
    if (req.headers.origin && req.headers.host) {
      try {
        const originUrl = new URL(req.headers.origin);
        sameOrigin = (originUrl.host === req.headers.host);
      } catch (_) {
        sameOrigin = false;
      }
    } else if (req.headers.referer && req.headers.host) {
      try {
        const refererUrl = new URL(req.headers.referer);
        sameOrigin = (refererUrl.host === req.headers.host);
      } catch (_) {
        sameOrigin = false;
      }
    }

    if (sameOrigin) {
      return next();
    }

    return res.status(403).json({
      mensaje: 'Petición bloqueada por seguridad: Token CSRF inválido o ausente ⛔'
    });
  }

  next();
}

/**
 * Endpoint para que el cliente consulte o renueve su token CSRF
 */
function getCsrfToken(req, res) {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  const token = req.session ? req.session.csrfToken : null;
  res.json({ csrfToken: token });
}

module.exports = {
  csrfProtection,
  getCsrfToken
};

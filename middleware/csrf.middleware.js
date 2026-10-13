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
    // Si viene encabezado X-Requested-With desde el mismo origen XMLHttpRequest/Fetch nativo
    const isCustomHeader = req.headers['x-requested-with'] === 'XMLHttpRequest';
    const sameOrigin = req.headers.origin && req.headers.host && req.headers.origin.includes(req.headers.host);

    if (isCustomHeader || sameOrigin) {
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

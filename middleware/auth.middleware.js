/**
 * Middleware de Autenticación y Control de Acceso Basado en Roles (RBAC) - SIGI
 */

// Verificar que exista una sesión activa
const verificarSesion = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.status(401).json({ mensaje: "No autorizado 🚫" });
  }
};

// Verificar que el usuario tenga un rol autorizado (Superadmin, Admin, Reportero)
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ mensaje: "No autenticado 🚫" });
    }

    const rolUsuario = req.session.rol || 'reportero';

    // El superadmin tiene acceso global por defecto
    if (rolUsuario === 'superadmin' || rolesPermitidos.includes(rolUsuario)) {
      return next();
    }

    return res.status(403).json({ 
      mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: [${rolesPermitidos.join(', ')}] ⛔` 
    });
  };
};

// Verificar que el estado del usuario sea activo
const verificarEstadoActivo = (req, res, next) => {
  if (req.session && req.session.estado && req.session.estado !== 'activo') {
    return res.status(403).json({ 
      mensaje: `Cuenta de usuario ${req.session.estado}. Acceso restringido. ⛔` 
    });
  }
  next();
};

module.exports = {
  verificarSesion,
  verificarRol,
  verificarEstadoActivo
};

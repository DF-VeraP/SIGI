const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { registrarLogActividad } = require('../utils/logger');
const { enviarEmailRecuperacion } = require('../utils/mailer');

// Validación de complejidad de contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número)
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validarSeguridadPassword(password) {
  if (!password || password.length < 8) {
    return { valido: false, mensaje: 'La nueva contraseña debe tener al menos 8 caracteres ⚠️' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos una letra mayúscula ⚠️' };
  }
  if (!/[a-z]/.test(password)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos una letra minúscula ⚠️' };
  }
  if (!/\d/.test(password)) {
    return { valido: false, mensaje: 'La contraseña debe incluir al menos un número ⚠️' };
  }
  return { valido: true };
}

const getAdmin = (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.session.rol === 'reportero') {
    return res.redirect('/reportero');
  }
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
};

const getReportero = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "../public/reportero/index.html"));
};

const logout = async (req, res) => {
  if (req.session && req.session.idusuario) {
    const motivo = req.query.motivo === 'inactividad' ? 'Cierre de sesión automático por inactividad' : 'Cierre de sesión manual';
    await registrarLogActividad(req.session.idusuario, 'LOGOUT', 'usuario', req.session.idusuario, motivo, req);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid");
    const motivoParam = req.query.motivo ? `?motivo=${encodeURIComponent(req.query.motivo)}` : '';
    res.redirect(`/login/index.html${motivoParam}`);
  });
};

const getUsuario = (req, res) => {
  if (req.session && req.session.usuario) {
    res.json({
      usuario: req.session.usuario,
      idusuario: req.session.idusuario,
      rol: req.session.rol || 'reportero',
      estado: req.session.estado || 'activo',
      dependencia: req.session.dependencia || '',
      email: req.session.email || '',
      debe_cambiar_password: req.session.debe_cambiar_password || false
    });
  } else {
    res.status(401).json({ mensaje: "No autenticado" });
  }
};

const login = async (req, res) => {
  const { usuario, contrasenia } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM usuario WHERE nombreusuario = $1 OR email = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      await registrarLogActividad(null, 'LOGIN_FALLIDO', 'usuario', null, `Intento fallido de login con usuario/correo: ${usuario}`, req);
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (user.estado && user.estado !== 'activo') {
      await registrarLogActividad(user.idusuario, 'LOGIN_BLOQUEADO', 'usuario', user.idusuario, `Intento de acceso a cuenta con estado: ${user.estado}`, req);
      return res.status(403).json({ mensaje: `Cuenta de usuario ${user.estado}. Contacte al administrador. ⛔` });
    }

    const match = await bcrypt.compare(contrasenia, user.contraseniausuario);

    if (!match) {
      await registrarLogActividad(user.idusuario, 'LOGIN_FALLIDO', 'usuario', user.idusuario, `Contraseña incorrecta para el usuario ${user.nombreusuario}`, req);
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    // Configurar sesión de usuario protegida contra fijación de sesión (Session Fixation)
    const setupSession = async () => {
      req.session.usuario = user.nombreusuario;
      req.session.idusuario = user.idusuario;
      req.session.rol = user.rol || 'reportero';
      req.session.estado = user.estado || 'activo';
      req.session.dependencia = user.dependencia || user.entidadusuario || '';
      req.session.email = user.email || '';
      req.session.debe_cambiar_password = user.debe_cambiar_password === true;

      // Actualizar fecha de último acceso
      await pool.query(
        "UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE idusuario = $1",
        [user.idusuario]
      );

      // Registrar en auditoría
      await registrarLogActividad(user.idusuario, 'LOGIN', 'usuario', user.idusuario, 'Inicio de sesión exitoso', req);

      res.json({
        mensaje: "Login correcto ✅",
        rol: req.session.rol,
        usuario: req.session.usuario,
        debe_cambiar_password: req.session.debe_cambiar_password
      });
    };

    // Regenerar session ID para neutralizar Session Fixation
    if (typeof req.session.regenerate === 'function') {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Error regenerando sesión:', err);
          return res.status(500).json({ mensaje: "Error en el servidor" });
        }
        setupSession();
      });
    } else {
      await setupSession();
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

/**
 * Solicitar restablecimiento de contraseña vía correo
 */
const recuperarPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ mensaje: 'Debes proporcionar un correo electrónico válido ⚠️' });
  }

  try {
    const userResult = await pool.query(
      'SELECT idusuario, nombreusuario, email FROM usuario WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    // Por seguridad, damos la misma respuesta genérica aunque el correo no exista
    if (userResult.rows.length === 0) {
      return res.json({
        mensaje: 'Si el correo electrónico se encuentra registrado en el sistema, recibirás un enlace para restablecer tu contraseña en breve ✉️'
      });
    }

    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');

    // Expiración en 1 hora
    const expiracion = new Date(Date.now() + 60 * 60 * 1000);

    // Inactivar tokens de reset anteriores no usados para este usuario
    await pool.query(
      "UPDATE token SET usado = true WHERE id_usuario = $1 AND tipo = 'reset_password' AND usado = false",
      [user.idusuario]
    );

    // Guardar nuevo token
    await pool.query(`
      INSERT INTO token (id_usuario, token, tipo, expiracion, usado)
      VALUES ($1, $2, 'reset_password', $3, false)
    `, [user.idusuario, token, expiracion]);

    // Enviar correo
    await enviarEmailRecuperacion(user.email, user.nombreusuario, token, req);

    await registrarLogActividad(
      user.idusuario,
      'SOLICITUD_RESET_PASSWORD',
      'token',
      null,
      `Solicitud de recuperación de contraseña enviada a ${user.email}`,
      req
    );

    res.json({
      mensaje: 'Si el correo electrónico se encuentra registrado en el sistema, recibirás un enlace para restablecer tu contraseña en breve ✉️'
    });

  } catch (error) {
    console.error('Error en recuperarPassword:', error);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud de recuperación' });
  }
};

/**
 * Validar si un token de reset es válido y vigente
 */
const validarTokenReset = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ valido: false, mensaje: 'Token no proporcionado' });
  }

  try {
    const result = await pool.query(`
      SELECT t.id_token, t.expiracion, t.usado, u.nombreusuario, u.email
      FROM token t
      JOIN usuario u ON t.id_usuario = u.idusuario
      WHERE t.token = $1 AND t.tipo = 'reset_password'
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ valido: false, mensaje: 'El enlace de recuperación es inválido ❌' });
    }

    const tokenData = result.rows[0];

    if (tokenData.usado) {
      return res.status(400).json({ valido: false, mensaje: 'Este enlace de recuperación ya fue utilizado previamente ⚠️' });
    }

    if (new Date() > new Date(tokenData.expiracion)) {
      return res.status(400).json({ valido: false, mensaje: 'Este enlace de recuperación ha expirado. Por favor solicita uno nuevo ⏳' });
    }

    res.json({
      valido: true,
      usuario: tokenData.nombreusuario,
      email: tokenData.email
    });

  } catch (error) {
    console.error('Error en validarTokenReset:', error);
    res.status(500).json({ valido: false, mensaje: 'Error al validar token' });
  }
};

/**
 * Ejecutar restablecimiento de contraseña usando el token
 */
const resetPassword = async (req, res) => {
  const { token, nuevaContrasenia } = req.body;

  if (!token || !nuevaContrasenia) {
    return res.status(400).json({ mensaje: 'El token y la nueva contraseña son obligatorios ⚠️' });
  }

  // Validación de complejidad de contraseña
  const checkSeguridad = validarSeguridadPassword(nuevaContrasenia);
  if (!checkSeguridad.valido) {
    return res.status(400).json({ mensaje: checkSeguridad.mensaje });
  }

  try {
    const result = await pool.query(`
      SELECT t.id_token, t.id_usuario, t.expiracion, t.usado, u.nombreusuario
      FROM token t
      JOIN usuario u ON t.id_usuario = u.idusuario
      WHERE t.token = $1 AND t.tipo = 'reset_password'
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'El enlace de recuperación es inválido ❌' });
    }

    const tokenData = result.rows[0];

    if (tokenData.usado) {
      return res.status(400).json({ mensaje: 'Este enlace de recuperación ya fue utilizado previamente ⚠️' });
    }

    if (new Date() > new Date(tokenData.expiracion)) {
      return res.status(400).json({ mensaje: 'Este enlace de recuperación ha expirado. Solicita uno nuevo ⏳' });
    }

    // Hashear la nueva contraseña con 10 rondas de salt
    const hashedPassword = await bcrypt.hash(nuevaContrasenia, 10);

    // Actualizar usuario y marcar token como usado
    await pool.query(`
      UPDATE usuario 
      SET contraseniausuario = $1, debe_cambiar_password = false, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $2
    `, [hashedPassword, tokenData.id_usuario]);

    await pool.query('UPDATE token SET usado = true WHERE id_token = $1', [tokenData.id_token]);

    await registrarLogActividad(
      tokenData.id_usuario,
      'RESET_PASSWORD_EXITOSO',
      'usuario',
      tokenData.id_usuario,
      `Contraseña restablecida exitosamente para ${tokenData.nombreusuario}`,
      req
    );

    res.json({
      mensaje: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave ✅'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ mensaje: 'Error al restablecer contraseña en el servidor' });
  }
};

/**
 * Cambio de contraseña obligatorio en el primer ingreso
 */
const cambiarPasswordPrimerIngreso = async (req, res) => {
  if (!req.session || !req.session.idusuario) {
    return res.status(401).json({ mensaje: 'No autenticado 🚫' });
  }

  const { contraseniaActual, nuevaContrasenia } = req.body;

  if (!contraseniaActual || !nuevaContrasenia) {
    return res.status(400).json({ mensaje: 'La contraseña actual y la nueva son obligatorias ⚠️' });
  }

  // Validación de complejidad de contraseña
  const checkSeguridad = validarSeguridadPassword(nuevaContrasenia);
  if (!checkSeguridad.valido) {
    return res.status(400).json({ mensaje: checkSeguridad.mensaje });
  }

  if (contraseniaActual === nuevaContrasenia) {
    return res.status(400).json({ mensaje: 'La nueva contraseña no puede ser igual a la anterior ⚠️' });
  }

  try {
    const userResult = await pool.query(
      'SELECT idusuario, nombreusuario, contraseniausuario FROM usuario WHERE idusuario = $1',
      [req.session.idusuario]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado ❌' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(contraseniaActual, user.contraseniausuario);

    if (!match) {
      return res.status(400).json({ mensaje: 'La contraseña temporal ingresada no es correcta ❌' });
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasenia, 10);

    await pool.query(`
      UPDATE usuario
      SET contraseniausuario = $1, debe_cambiar_password = false, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE idusuario = $2
    `, [hashedPassword, user.idusuario]);

    req.session.debe_cambiar_password = false;

    await registrarLogActividad(
      user.idusuario,
      'CAMBIO_PASSWORD_PRIMER_INGRESO',
      'usuario',
      user.idusuario,
      `Contraseña personal actualizada en primer ingreso para ${user.nombreusuario}`,
      req
    );

    res.json({
      mensaje: 'Contraseña actualizada exitosamente. Bienvenido/a a SIGI ✅',
      rol: req.session.rol
    });

  } catch (error) {
    console.error('Error en cambiarPasswordPrimerIngreso:', error);
    res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
  }
};

module.exports = {
  getAdmin,
  getReportero,
  logout,
  getUsuario,
  login,
  recuperarPassword,
  validarTokenReset,
  resetPassword,
  cambiarPasswordPrimerIngreso
};

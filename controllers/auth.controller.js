const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { registrarLogActividad } = require('../utils/logger');

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
    await registrarLogActividad(req.session.idusuario, 'LOGOUT', 'usuario', req.session.idusuario, 'Cierre de sesión', req);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login/index.html");
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
      email: req.session.email || ''
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
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (user.estado && user.estado !== 'activo') {
      return res.status(403).json({ mensaje: `Cuenta de usuario ${user.estado}. Contacte al administrador. ⛔` });
    }

    const match = await bcrypt.compare(contrasenia, user.contraseniausuario);

    if (!match) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    // Configurar sesión de usuario
    req.session.usuario = user.nombreusuario;
    req.session.idusuario = user.idusuario;
    req.session.rol = user.rol || 'reportero';
    req.session.estado = user.estado || 'activo';
    req.session.dependencia = user.dependencia || user.entidadusuario || '';
    req.session.email = user.email || '';

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
      usuario: req.session.usuario
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  getAdmin,
  getReportero,
  logout,
  getUsuario,
  login
};

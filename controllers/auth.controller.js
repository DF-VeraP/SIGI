const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../db');

const getAdmin = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error al cerrar sesión");
    }
    // eliminamos cookie
    res.clearCookie("connect.sid");
    // redirigimos al login
    res.redirect("/login/index.html");
  });
};

const getUsuario = (req, res) => {
  if (req.session.usuario) {
    res.json({ usuario: req.session.usuario });
  } else {
    res.status(401).json({ mensaje: "No autenticado" });
  }
};

const login = async (req, res) => {
  const { usuario, contrasenia } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM usuario WHERE nombreusuario = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(contrasenia, user.contraseniausuario);

    if (!match) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos ❌" });
    }

    req.session.usuario = user.nombreusuario;
    req.session.idusuario = user.idusuario;
    res.json({ mensaje: "Login correcto ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  getAdmin,
  logout,
  getUsuario,
  login
};

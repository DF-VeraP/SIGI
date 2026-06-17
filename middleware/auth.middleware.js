const verificarSesion = (req, res, next) => {
  if (req.session.usuario) {
    next();
  } else {
    res.status(401).send("No autorizado 🚫");
  }
};

module.exports = {
  verificarSesion
};

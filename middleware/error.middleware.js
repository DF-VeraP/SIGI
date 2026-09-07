const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({ 
    mensaje: "Error interno en el servidor",
    ...(isDev ? { detalle: err.message } : {})
  });
};

module.exports = {
  errorHandler
};

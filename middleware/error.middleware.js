const errorHandler = (err, req, res, next) => {
  // Manejo de errores de subida de archivos (Multer o filtros de extensión)
  if (err && (err.name === 'MulterError' || (err.message && (err.message.includes('Solo se aceptan') || err.message.includes('permitido'))))) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ mensaje: "El archivo supera el tamaño máximo permitido." });
    }
    return res.status(400).json({ mensaje: err.message || "Error al procesar el archivo subido." });
  }

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

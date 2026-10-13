const CatalogosModel = require('../models/catalogos.model');

/**
 * Obtener todos los catálogos del sistema para poblar selects y formularios frontend
 */
const getCatalogos = async (req, res) => {
  try {
    const catalogos = await CatalogosModel.obtenerTodos();
    res.json(catalogos);
  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({ mensaje: 'Error al obtener catálogos del sistema' });
  }
};

module.exports = {
  getCatalogos
};

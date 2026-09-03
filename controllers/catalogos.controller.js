const pool = require('../db');

/**
 * Obtener todos los catálogos del sistema para poblar selects y formularios frontend
 */
const getCatalogos = async (req, res) => {
  try {
    const [categorias, tipos, estados, gravedades, modalidades, factores] = await Promise.all([
      pool.query('SELECT * FROM categoria_incidente ORDER BY id_categoria ASC'),
      pool.query('SELECT t.*, c.nombre as categoria_nombre FROM tipo_incidente t LEFT JOIN categoria_incidente c ON t.id_categoria = c.id_categoria ORDER BY t.idtipoincidente ASC'),
      pool.query('SELECT * FROM estado_incidente ORDER BY orden ASC'),
      pool.query('SELECT * FROM gravedad_incidente ORDER BY nivel ASC'),
      pool.query('SELECT * FROM modalidad_incidente ORDER BY id_modalidad ASC'),
      pool.query('SELECT * FROM factores_incidente ORDER BY id_factor ASC')
    ]);

    res.json({
      categorias: categorias.rows,
      tipos: tipos.rows,
      estados: estados.rows,
      gravedades: gravedades.rows,
      modalidades: modalidades.rows,
      factores: factores.rows
    });
  } catch (error) {
    console.error('Error al obtener catálogos:', error);
    res.status(500).json({ mensaje: 'Error al obtener catálogos del sistema' });
  }
};

module.exports = {
  getCatalogos
};

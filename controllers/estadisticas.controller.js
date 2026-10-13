const EstadisticasModel = require('../models/estadisticas.model');

const getConteoIncidente = async (req, res) => {
  try {
    const result = await EstadisticasModel.obtenerConteoTotal();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getConteoPorTipo = async (req, res) => {
  try {
    const result = await EstadisticasModel.obtenerConteoPorTipo();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getResumen = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    const result = await EstadisticasModel.obtenerResumen(fechaDesde, fechaHasta);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en resumen" });
  }
};

const getTopZonas = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    const zonas = await EstadisticasModel.obtenerTopZonas(fechaDesde, fechaHasta);
    res.json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en top zonas" });
  }
};

const getTopIncidentes = async (req, res) => {
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    const result = await EstadisticasModel.obtenerTopIncidentes(fechaDesde, fechaHasta);

    // Asignamos colores representativos por tipo
    const colores = {
      "Robo": "#e74c3c",
      "Agresiones/Amenazas": "#f1c40f",
      "Piques": "#9b59b6",
      "Accidentes de transito": "#2ecc71"
    };

    const data = result.rows.map(r => ({
      tipo: r.tipo,
      cantidad: parseInt(r.cantidad),
      color: colores[r.tipo] || "#3498db"
    }));

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en top incidentes" });
  }
};

const getUltimaActualizacion = async (req, res) => {
  try {
    const result = await EstadisticasModel.obtenerUltimaActualizacion();
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en última actualización" });
  }
};

module.exports = {
  getConteoIncidente,
  getConteoPorTipo,
  getResumen,
  getTopZonas,
  getTopIncidentes,
  getUltimaActualizacion
};

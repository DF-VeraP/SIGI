const GeografiaModel = require('../models/geografia.model');

const getIncidentes = async (req, res) => {
  const nombre = req.query.lugar || req.query.barrio;
  const tipoLugar = req.query.tipoLugar; // 'Barrio' or 'Vereda'
  const tipos = req.query.tipos;
  const fechaDesde = req.query.fechaDesde;
  const fechaHasta = req.query.fechaHasta;
  try {
    const result = await GeografiaModel.obtenerIncidentes({
      nombre,
      tipoLugar,
      tipos,
      fechaDesde,
      fechaHasta
    });
    res.json(result.rows);
  } catch (error) {
    console.error("Error en getIncidentes:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const getPoligonoBarrio = async (req, res) => {
  const nombre = req.query.nombre;
  try {
    const result = await GeografiaModel.obtenerPoligonoBarrio(nombre);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en getPoligonoBarrio:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const buscarBarrioPorCoordenada = async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const ubicacion = await GeografiaModel.buscarPorCoordenada(lat, lng);
    res.json(ubicacion);
  } catch (error) {
    console.error("Error en buscarBarrioPorCoordenada:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
};

const getPoligonoVereda = async (req, res) => {
  const nombre = req.query.nombre;
  try {
    const result = await GeografiaModel.obtenerPoligonoVereda(nombre);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en getPoligonoVereda:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = {
  getIncidentes,
  getPoligonoBarrio,
  buscarBarrioPorCoordenada,
  getPoligonoVereda
};

const IncidenteModel = require('../models/incidente.model');
const { error: logError } = require('../utils/logger');

const getIncidentesTabla = async (req, res) => {
  try {
    const usuarioLogueado = req.session.usuario;
    if (!usuarioLogueado) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const result = await IncidenteModel.obtenerIncidentesTablaUsuario(usuarioLogueado);
    res.json(result.rows);
  } catch (error) {
    logError("Error al consultar incidentes para tabla:", { error: error.message });
    res.status(500).json({
      error: "Error en el servidor"
    });
  }
};


const getIncidentesFiltroAdmin = async (req, res) => {
  try {
    const usuarioLogueado = req.session.usuario;
    const rolLogueado = req.session.rol || 'reportero';
    if (!usuarioLogueado) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { idtipoincidente, fechaincidente, fechaDesde, fechaHasta, id_estado } = req.query;

    const result = await IncidenteModel.obtenerIncidentesFiltroAdmin({
      usuarioLogueado,
      rolLogueado,
      idtipoincidente,
      fechaincidente,
      fechaDesde,
      fechaHasta,
      id_estado
    });

    res.json(result.rows);

  } catch (error) {
    logError("Error al filtrar incidentes para tabla admin:", { error: error.message });
    res.status(500).json({ error: "Error en servidor" });
  }
};

module.exports = {
  getIncidentesTabla,
  getIncidentesFiltroAdmin
};

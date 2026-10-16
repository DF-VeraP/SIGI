const CatalogosModel = require('../models/catalogos.model');
const { registrarLogActividad } = require('../utils/logger');

/**
 * Normaliza una cadena de texto para comparaciones estrictas anti-duplicados:
 * convierte a minúsculas, remueve acentos/diacríticos y compacta espacios en blanco.
 */
function normalizarTexto(txt) {
  if (!txt || typeof txt !== 'string') return '';
  return txt
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Convierte un código hexadecimal (#RGB o #RRGGBB) a valores numéricos RGB
 */
function hexToRgb(hex) {
  let c = (hex || '').replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calcula la distancia perceptual de color usando la aproximación Redmean (ponderada)
 * Rango: 0 (colores idénticos) a ~765 (colores opuestos absolutos).
 * Una distancia < 85 se considera visualmente confusa o casi igual a simple vista.
 */
function calcularDistanciaColor(hex1, hex2) {
  if (!hex1 || !hex2) return 999;
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const rMean = (rgb1.r + rgb2.r) / 2;
  const deltaR = rgb1.r - rgb2.r;
  const deltaG = rgb1.g - rgb2.g;
  const deltaB = rgb1.b - rgb2.b;
  return Math.sqrt(
    (2 + rMean / 256) * deltaR * deltaR +
    4 * deltaG * deltaG +
    (2 + (255 - rMean) / 256) * deltaB * deltaB
  );
}

/**
 * Valida los parámetros del tipo de incidente para evitar redundancia y colisión de colores
 */
async function validarTipoIncidente(datos, idActual = null) {
  const { nametipoincidente, color, id_categoria, nivel_riesgo_base } = datos;

  // 1. Validación de nombre
  if (!nametipoincidente || typeof nametipoincidente !== 'string' || nametipoincidente.trim().length < 3) {
    throw new Error('El nombre del tipo de incidente debe tener al menos 3 caracteres.');
  }
  if (nametipoincidente.trim().length > 80) {
    throw new Error('El nombre del tipo de incidente no puede exceder los 80 caracteres.');
  }

  // 2. Validación de color hex
  const hexRegex = /^#([0-9a-fA-F]{6})$/;
  if (!color || !hexRegex.test(color.trim())) {
    throw new Error('El color debe tener un formato hexadecimal válido de 6 caracteres (ejemplo: #ef4444).');
  }
  const colorNormalizado = color.trim().toLowerCase();

  // 3. Validación de nivel de riesgo
  const nivelesPermitidos = ['baja', 'media', 'alta', 'critica'];
  if (nivel_riesgo_base && !nivelesPermitidos.includes(nivel_riesgo_base.toLowerCase())) {
    throw new Error('El nivel de riesgo debe ser uno de los siguientes: baja, media, alta o critica.');
  }

  // 4. Consultar tipos existentes para control estricto de redundancia
  const tiposExistentes = await CatalogosModel.obtenerTiposConDetalle();
  const nombreNorm = normalizarTexto(nametipoincidente);

  for (const t of tiposExistentes) {
    if (idActual && t.idtipoincidente === parseInt(idActual)) {
      continue; // Ignorar el mismo registro en caso de edición
    }

    // A. Control de redundancia por nombre
    const nombreExistenteNorm = normalizarTexto(t.nametipoincidente);
    if (nombreNorm === nombreExistenteNorm) {
      throw new Error(`Ya existe un tipo de incidente registrado con el nombre "${t.nametipoincidente}". Por favor use un nombre diferente para evitar duplicidad.`);
    }

    // B. Control de redundancia y similitud por color (con tipos activos)
    if (t.activo && t.color) {
      const dist = calcularDistanciaColor(colorNormalizado, t.color.toLowerCase());
      if (dist < 85) {
        throw new Error(`El color elegido (${color.toUpperCase()}) es visualmente casi idéntico al del tipo existente "${t.nametipoincidente}" (${t.color.toUpperCase()}). Seleccione un tono con mayor contraste para que no se confundan los puntos en el mapa cartográfico.`);
      }
    }
  }

  return {
    nametipoincidente: nametipoincidente.trim(),
    color: colorNormalizado,
    id_categoria: id_categoria ? parseInt(id_categoria) : null,
    nivel_riesgo_base: nivel_riesgo_base ? nivel_riesgo_base.toLowerCase() : 'media',
    descripcion: datos.descripcion ? datos.descripcion.trim() : null
  };
}

/**
 * GET /api/catalogos
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

/**
 * GET /api/catalogos/tipos
 * Obtiene la lista completa de tipos de incidentes con su categoría y total de incidentes vinculados
 * (Exclusivo Superadmin)
 */
const getTiposConDetalle = async (req, res) => {
  try {
    const tipos = await CatalogosModel.obtenerTiposConDetalle();
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de incidentes con detalle:', error);
    res.status(500).json({ mensaje: 'Error al obtener lista de tipos de incidentes' });
  }
};

/**
 * POST /api/catalogos/tipos
 * Crear un nuevo tipo de incidente con control de redundancia (nombre y color)
 * (Exclusivo Superadmin)
 */
const crearTipo = async (req, res) => {
  try {
    const datosValidados = await validarTipoIncidente(req.body);
    const nuevoTipo = await CatalogosModel.crearTipo(datosValidados);

    // Auditoría
    await registrarLogActividad(
      req.session.idusuario,
      'CREAR_TIPO_INCIDENTE',
      'tipo_incidente',
      nuevoTipo.idtipoincidente,
      `Superadmin ${req.session.usuario || ''} creó el tipo de incidente "${nuevoTipo.nametipoincidente}" (${nuevoTipo.color})`,
      req
    );

    res.status(201).json({
      mensaje: 'Tipo de incidente registrado exitosamente',
      tipo: nuevoTipo
    });
  } catch (error) {
    console.warn('Validación al crear tipo de incidente:', error.message);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * PUT /api/catalogos/tipos/:id
 * Actualizar los datos de un tipo de incidente existente
 * (Exclusivo Superadmin)
 */
const actualizarTipo = async (req, res) => {
  const { id } = req.params;
  try {
    const tipoExistente = await CatalogosModel.obtenerTipoPorId(id);
    if (!tipoExistente) {
      return res.status(404).json({ mensaje: 'El tipo de incidente no fue encontrado' });
    }

    const datosValidados = await validarTipoIncidente(req.body, id);
    const tipoActualizado = await CatalogosModel.actualizarTipo(id, datosValidados);

    // Auditoría
    await registrarLogActividad(
      req.session.idusuario,
      'ACTUALIZAR_TIPO_INCIDENTE',
      'tipo_incidente',
      id,
      `Superadmin ${req.session.usuario || ''} actualizó el tipo de incidente "${tipoActualizado.nametipoincidente}"`,
      req
    );

    res.json({
      mensaje: 'Tipo de incidente actualizado exitosamente',
      tipo: tipoActualizado
    });
  } catch (error) {
    console.warn('Validación al actualizar tipo de incidente:', error.message);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * PATCH /api/catalogos/tipos/:id/estado
 * Activa o desactiva un tipo de incidente
 * (Exclusivo Superadmin)
 */
const cambiarEstadoTipo = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ mensaje: 'El parámetro "activo" debe ser booleano (true o false)' });
  }

  try {
    const tipoExistente = await CatalogosModel.obtenerTipoPorId(id);
    if (!tipoExistente) {
      return res.status(404).json({ mensaje: 'El tipo de incidente no fue encontrado' });
    }

    const tipoModificado = await CatalogosModel.cambiarEstadoTipo(id, activo);

    // Auditoría
    const accionTxt = activo ? 'activó' : 'desactivó';
    await registrarLogActividad(
      req.session.idusuario,
      'ESTADO_TIPO_INCIDENTE',
      'tipo_incidente',
      id,
      `Superadmin ${req.session.usuario || ''} ${accionTxt} el tipo de incidente "${tipoModificado.nametipoincidente}"`,
      req
    );

    res.json({
      mensaje: `Tipo de incidente ${accionTxt} exitosamente`,
      tipo: tipoModificado
    });
  } catch (error) {
    console.error('Error al cambiar estado de tipo de incidente:', error);
    res.status(500).json({ mensaje: 'Error al cambiar estado del tipo de incidente' });
  }
};

/**
 * DELETE /api/catalogos/tipos/:id
 * Elimina físicamente un tipo de incidente solo si no tiene incidentes asociados en el historial
 * (Exclusivo Superadmin)
 */
const eliminarTipo = async (req, res) => {
  const { id } = req.params;
  try {
    const tipoExistente = await CatalogosModel.obtenerTipoPorId(id);
    if (!tipoExistente) {
      return res.status(404).json({ mensaje: 'El tipo de incidente no fue encontrado' });
    }

    const conteo = await CatalogosModel.contarIncidentesPorTipo(id);
    if (conteo > 0) {
      return res.status(400).json({
        mensaje: `No se puede eliminar el tipo "${tipoExistente.nametipoincidente}" porque existen ${conteo} incidente(s) asociados en el historial. Puede desactivarlo para que no aparezca en nuevos formularios de reporte sin afectar los datos históricos.`
      });
    }

    await CatalogosModel.eliminarTipo(id);

    // Auditoría
    await registrarLogActividad(
      req.session.idusuario,
      'ELIMINAR_TIPO_INCIDENTE',
      'tipo_incidente',
      id,
      `Superadmin ${req.session.usuario || ''} eliminó el tipo de incidente "${tipoExistente.nametipoincidente}"`,
      req
    );

    res.json({
      mensaje: `Tipo de incidente "${tipoExistente.nametipoincidente}" eliminado exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar tipo de incidente:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el tipo de incidente' });
  }
};

module.exports = {
  getCatalogos,
  getTiposConDetalle,
  crearTipo,
  actualizarTipo,
  cambiarEstadoTipo,
  eliminarTipo,
  calcularDistanciaColor,
  normalizarTexto
};

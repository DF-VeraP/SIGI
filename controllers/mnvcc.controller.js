const MnvccModel = require('../models/mnvcc.model');
const logger = require('../utils/logger');

/**
 * Controlador del Modelo Nacional de Vigilancia Comunitaria por Cuadrantes (MNVCC - Tomo 2.2)
 * Gestiona Cuadrantes, Hoja de Servicio (HS), Puntos Críticos (Análisis Causal 5 Porqués) y TAMIR.
 */
class MnvccController {
  /**
   * GET /api/mnvcc/cuadrantes
   */
  async listarCuadrantes(req, res, next) {
    try {
      const { tipo } = req.query;
      const cuadrantes = await MnvccModel.obtenerResumenCuadrantes(tipo || null);
      return res.status(200).json({
        status: 'success',
        total: cuadrantes.length,
        data: cuadrantes
      });
    } catch (error) {
      logger.error('Error en listarCuadrantes MNVCC:', error);
      next(error);
    }
  }

  /**
   * GET /api/mnvcc/hoja-servicio/:idCuadrante
   */
  async obtenerHojaServicio(req, res, next) {
    try {
      const idCuadrante = parseInt(req.params.idCuadrante, 10);
      if (isNaN(idCuadrante) || idCuadrante <= 0) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'ID de cuadrante inválido'
        });
      }

      const hojaServicio = await MnvccModel.obtenerHojaServicio(idCuadrante);
      if (!hojaServicio) {
        return res.status(404).json({
          status: 'error',
          mensaje: 'Cuadrante no encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: hojaServicio
      });
    } catch (error) {
      logger.error('Error en obtenerHojaServicio MNVCC:', error);
      next(error);
    }
  }

  /**
   * GET /api/mnvcc/problemas
   */
  async listarProblemas(req, res, next) {
    try {
      const { id_cuadrante, estado } = req.query;
      const problemas = await MnvccModel.obtenerProblemas({
        idCuadrante: id_cuadrante || null,
        estado: estado || null
      });
      return res.status(200).json({
        status: 'success',
        total: problemas.length,
        data: problemas
      });
    } catch (error) {
      logger.error('Error en listarProblemas MNVCC:', error);
      next(error);
    }
  }

  /**
   * POST /api/mnvcc/problemas
   * Caracterizar un Punto Crítico con Análisis Causal (5 Porqués / Ishikawa)
   */
  async crearProblema(req, res, next) {
    try {
      const { titulo, tipologia_punto_critico } = req.body;
      if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 4) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'El título de la problemática o punto crítico es obligatorio'
        });
      }

      const tipologiasValidas = ['generador_oportunidad', 'atractor_infractores', 'facilitador_infracciones'];
      if (tipologia_punto_critico && !tipologiasValidas.includes(tipologia_punto_critico)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Tipología de punto crítico inválida según el Tomo 2.2 MNVCC'
        });
      }

      const nuevo = await MnvccModel.crearProblema({
        ...req.body,
        id_usuario_analista: req.session?.idusuario || null
      });

      return res.status(201).json({
        status: 'success',
        mensaje: 'Punto crítico y análisis causal registrados en el CIEPS',
        data: nuevo
      });
    } catch (error) {
      logger.error('Error en crearProblema MNVCC:', error);
      next(error);
    }
  }

  /**
   * GET /api/mnvcc/tamir
   */
  async listarTamir(req, res, next) {
    try {
      const { id_cuadrante, estado, mis_asignaciones } = req.query;
      const idPatrullero = mis_asignaciones === 'true' ? (req.session?.idusuario || null) : null;

      const actividades = await MnvccModel.obtenerActividadesTamir({
        idCuadrante: id_cuadrante || null,
        idPatrullero,
        estado: estado || null
      });

      return res.status(200).json({
        status: 'success',
        total: actividades.length,
        data: actividades
      });
    } catch (error) {
      logger.error('Error en listarTamir MNVCC:', error);
      next(error);
    }
  }

  /**
   * POST /api/mnvcc/tamir
   */
  async crearTamir(req, res, next) {
    try {
      const { id_cuadrante, lugar_especifico, problematica_priorizada, actividad_preventiva } = req.body;
      if (!id_cuadrante || !lugar_especifico || !problematica_priorizada || !actividad_preventiva) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Cuadrante, lugar específico, problemática priorizada y actividad preventiva son obligatorios en la TAMIR'
        });
      }

      const nueva = await MnvccModel.crearActividadTamir({
        ...req.body,
        id_usuario_creador: req.session?.idusuario || null
      });

      return res.status(201).json({
        status: 'success',
        mensaje: 'Actividad preventiva registrada en la TAMIR del cuadrante',
        data: nueva
      });
    } catch (error) {
      logger.error('Error en crearTamir MNVCC:', error);
      next(error);
    }
  }

  /**
   * PATCH /api/mnvcc/tamir/:id/cumplimiento
   */
  async actualizarCumplimientoTamir(req, res, next) {
    try {
      const idTamir = parseInt(req.params.id, 10);
      const { estado_cumplimiento, observacion_turno, evidencia_url } = req.body;

      const estadosValidos = ['pendiente', 'en_ejecucion', 'cumplida', 'reprogramada'];
      if (estado_cumplimiento && !estadosValidos.includes(estado_cumplimiento)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Estado de cumplimiento TAMIR no válido'
        });
      }

      const actualizada = await MnvccModel.actualizarCumplimientoTamir(idTamir, {
        estado_cumplimiento,
        observacion_turno,
        evidencia_url
      });

      if (!actualizada) {
        return res.status(404).json({
          status: 'error',
          mensaje: 'Actividad TAMIR no encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        mensaje: 'Cumplimiento de TAMIR actualizado en entrega de turno',
        data: actualizada
      });
    } catch (error) {
      logger.error('Error en actualizarCumplimientoTamir MNVCC:', error);
      next(error);
    }
  }
}

module.exports = new MnvccController();

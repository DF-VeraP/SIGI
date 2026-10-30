const pool = require('../db');

/**
 * Modelo del Modelo Nacional de Vigilancia Comunitaria por Cuadrantes (MNVCC - Tomo 2.2, Cap. 5 y 6)
 * Gestiona la capa de cuadrantes, Hoja de Servicio (HS), Puntos Críticos (Análisis Causal) y TAMIR.
 */
class MnvccModel {
  /**
   * Obtener listado de todos los cuadrantes con métricas operativas y porcentaje de aporte a la estación
   */
  static async obtenerResumenCuadrantes(tipo = null) {
    const params = [];
    let filtroTipo = '';
    if (tipo && ['urbano', 'rural', 'vial', 'fluvial'].includes(tipo)) {
      params.push(tipo);
      filtroTipo = `WHERE c.tipo = $1`;
    }

    const query = `
      WITH total_est AS (
        SELECT GREATEST(COUNT(*), 1) AS total_global FROM public.incidente
      )
      SELECT
        c.id_cuadrante,
        c.codigo_cuadrante,
        c.nombre,
        c.tipo,
        c.unidad_base,
        c.telefono_contacto,
        c.color,
        c.sectores_barrios,
        COUNT(DISTINCT i.idincidente)::int AS total_incidentes,
        ROUND((COUNT(DISTINCT i.idincidente)::numeric / (SELECT total_global FROM total_est)) * 100, 1)::float AS aporte_estacion_pct,
        COUNT(DISTINCT p.id_problema) FILTER (WHERE p.estado <> 'mitigado')::int AS puntos_criticos_activos,
        COUNT(DISTINCT t.id_tamir)::int AS total_tamir,
        COUNT(DISTINCT t.id_tamir) FILTER (WHERE t.estado_cumplimiento = 'cumplida')::int AS tamir_cumplidas
      FROM public.cuadrante c
      LEFT JOIN public.incidente i ON i.id_cuadrante = c.id_cuadrante
      LEFT JOIN public.problema_cuadrante p ON p.id_cuadrante = c.id_cuadrante
      LEFT JOIN public.tamir_actividad t ON t.id_cuadrante = c.id_cuadrante
      ${filtroTipo}
      GROUP BY c.id_cuadrante
      ORDER BY c.id_cuadrante ASC
    `;

    const res = await pool.query(query, params);
    return res.rows;
  }

  /**
   * Generar los datos completos de la Hoja de Servicio (HS) de un cuadrante (Formato oficial pág. 51 Tomo 2.2)
   * Incluye:
   *  1. Metadatos del cuadrante y aporte porcentual a la estación
   *  2. Comportamiento en los últimos 4 periodos/semanas con incidentes registrados
   *  3. Matriz de delitos por día de la semana (Lunes a Domingo)
   *  4. Matriz de delitos por las 6 franjas horarias de 4 horas (00:00-03:59 a 20:00-23:59)
   *  5. Puntos críticos caracterizados (5 Porqués / Ishikawa) y actividades TAMIR asignadas
   */
  static async obtenerHojaServicio(idCuadrante) {
    const cuadRes = await pool.query(`
      SELECT
        c.id_cuadrante,
        c.codigo_cuadrante,
        c.nombre,
        c.tipo,
        c.unidad_base,
        c.telefono_contacto,
        c.color,
        c.sectores_barrios,
        ST_AsGeoJSON(c.geom) AS geom
      FROM public.cuadrante c
      WHERE c.id_cuadrante = $1
    `, [idCuadrante]);

    if (cuadRes.rows.length === 0) {
      return null;
    }

    const cuadrante = cuadRes.rows[0];

    // 1. Estadística comparativa y aporte a la estación por delito (pág. 51 y 61 del Tomo 2.2)
    const aportePorDelitoRes = await pool.query(`
      WITH est AS (
        SELECT idtipoincidente, COUNT(*)::int AS total_estacion
        FROM public.incidente
        GROUP BY idtipoincidente
      ),
      ultimas_semanas AS (
        SELECT DISTINCT TO_CHAR(DATE_TRUNC('week', fechaincidente), 'IYYY-"S"IW') AS semana_iso,
               DATE_TRUNC('week', fechaincidente) AS inicio_sem
        FROM public.incidente
        WHERE id_cuadrante = $1 AND fechaincidente IS NOT NULL
        ORDER BY inicio_sem DESC
        LIMIT 4
      ),
      sem_enumeradas AS (
        SELECT semana_iso, ROW_NUMBER() OVER (ORDER BY inicio_sem ASC) AS num_col
        FROM ultimas_semanas
      )
      SELECT
        tp.idtipoincidente,
        tp.nametipoincidente AS delito,
        COUNT(i.idincidente) FILTER (WHERE se.num_col = 1)::int AS sem_1,
        COUNT(i.idincidente) FILTER (WHERE se.num_col = 2)::int AS sem_2,
        COUNT(i.idincidente) FILTER (WHERE se.num_col = 3)::int AS sem_3,
        COUNT(i.idincidente) FILTER (WHERE se.num_col = 4)::int AS sem_4,
        COUNT(i.idincidente)::int AS total_cuadrante,
        COALESCE(est.total_estacion, 0)::int AS total_estacion,
        CASE
          WHEN COALESCE(est.total_estacion, 0) > 0
          THEN ROUND((COUNT(i.idincidente)::numeric / est.total_estacion) * 100, 1)::float
          ELSE 0
        END AS aporte_estacion_pct
      FROM public.tipo_incidente tp
      LEFT JOIN public.incidente i
        ON i.idtipoincidente = tp.idtipoincidente AND i.id_cuadrante = $1
      LEFT JOIN sem_enumeradas se
        ON TO_CHAR(DATE_TRUNC('week', i.fechaincidente), 'IYYY-"S"IW') = se.semana_iso
      LEFT JOIN est ON est.idtipoincidente = tp.idtipoincidente
      GROUP BY tp.idtipoincidente, tp.nametipoincidente, est.total_estacion
      HAVING COUNT(i.idincidente) > 0 OR COALESCE(est.total_estacion, 0) > 0
      ORDER BY total_cuadrante DESC, tp.idtipoincidente ASC
    `, [idCuadrante]);

    // 2. Análisis estadístico delincuencial por días de la semana (Lunes=1 .. Domingo=7 en ISODOW)
    const porDiasRes = await pool.query(`
      SELECT
        tp.nametipoincidente AS delito,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 1)::int AS lunes,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 2)::int AS martes,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 3)::int AS miercoles,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 4)::int AS jueves,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 5)::int AS viernes,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 6)::int AS sabado,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(ISODOW FROM i.fechaincidente) = 7)::int AS domingo,
        COUNT(i.idincidente)::int AS total
      FROM public.tipo_incidente tp
      LEFT JOIN public.incidente i
        ON i.idtipoincidente = tp.idtipoincidente AND i.id_cuadrante = $1
      GROUP BY tp.idtipoincidente, tp.nametipoincidente
      HAVING COUNT(i.idincidente) > 0
      ORDER BY total DESC
    `, [idCuadrante]);

    // 3. Análisis estadístico delincuencial por franjas horarias de 4 horas (pág. 51 del Tomo 2.2)
    const porFranjasRes = await pool.query(`
      SELECT
        tp.nametipoincidente AS delito,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 0 AND 3)::int AS f_00_03,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 4 AND 7)::int AS f_04_07,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 8 AND 11)::int AS f_08_11,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 12 AND 15)::int AS f_12_15,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 16 AND 19)::int AS f_16_19,
        COUNT(i.idincidente) FILTER (WHERE EXTRACT(HOUR FROM i.horaincidente) BETWEEN 20 AND 23)::int AS f_20_23,
        COUNT(i.idincidente)::int AS total
      FROM public.tipo_incidente tp
      LEFT JOIN public.incidente i
        ON i.idtipoincidente = tp.idtipoincidente AND i.id_cuadrante = $1
      GROUP BY tp.idtipoincidente, tp.nametipoincidente
      HAVING COUNT(i.idincidente) > 0
      ORDER BY total DESC
    `, [idCuadrante]);

    // 4. Puntos críticos y análisis causal del cuadrante
    const problemas = await this.obtenerProblemas({ idCuadrante });

    // 5. Actividades de la TAMIR del cuadrante
    const tamir = await this.obtenerActividadesTamir({ idCuadrante });

    return {
      cuadrante,
      estadistica_aporte: aportePorDelitoRes.rows,
      matriz_dias_semana: porDiasRes.rows,
      matriz_franjas_horarias: porFranjasRes.rows,
      puntos_criticos: problemas,
      tamir
    };
  }

  /**
   * Consultar Puntos Críticos y Análisis Causal (5 Porqués / Ishikawa)
   */
  static async obtenerProblemas({ idCuadrante = null, estado = null } = {}) {
    const params = [];
    let where = 'WHERE 1=1';

    if (idCuadrante) {
      params.push(parseInt(idCuadrante, 10));
      where += ` AND p.id_cuadrante = $${params.length}`;
    }
    if (estado) {
      params.push(estado);
      where += ` AND p.estado = $${params.length}`;
    }

    const res = await pool.query(`
      SELECT
        p.id_problema,
        p.id_cuadrante,
        c.codigo_cuadrante,
        c.nombre AS cuadrante_nombre,
        p.titulo,
        p.tipologia_punto_critico,
        p.delito_predominante,
        p.nivel_riesgo,
        p.cantidad_incidentes,
        p.radio_metros,
        p.lat::float AS lat,
        p.lng::float AS lng,
        p.porque_1,
        p.porque_2,
        p.porque_3,
        p.porque_4,
        p.porque_5,
        p.causa_raiz,
        p.factores_ishikawa,
        p.actores_corresponsables,
        p.estado,
        p.fecha_creacion
      FROM public.problema_cuadrante p
      LEFT JOIN public.cuadrante c ON p.id_cuadrante = c.id_cuadrante
      ${where}
      ORDER BY p.id_problema DESC
    `, params);

    return res.rows;
  }

  /**
   * Registrar un nuevo Punto Crítico caracterizado con Análisis Causal (5 Porqués + Ishikawa)
   */
  static async crearProblema(datos) {
    const {
      id_cuadrante,
      titulo,
      tipologia_punto_critico = 'facilitador_infracciones',
      delito_predominante = 'Hurto / Convivencia',
      nivel_riesgo = 'ALTO',
      cantidad_incidentes = 1,
      radio_metros = 200,
      lat,
      lng,
      porque_1 = '',
      porque_2 = '',
      porque_3 = '',
      porque_4 = '',
      porque_5 = '',
      causa_raiz = '',
      factores_ishikawa = {},
      actores_corresponsables = 'Policía Nacional (DECAQ), Alcaldía de Florencia',
      id_usuario_analista = null
    } = datos;

    let cuadranteFinal = id_cuadrante ? parseInt(id_cuadrante, 10) : null;
    if (!cuadranteFinal && lat && lng) {
      const cRes = await pool.query(`
        SELECT id_cuadrante FROM public.cuadrante
        WHERE geom IS NOT NULL
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1::float8, $2::float8), 4326) ASC
        LIMIT 1
      `, [parseFloat(lng), parseFloat(lat)]);
      cuadranteFinal = cRes.rows[0]?.id_cuadrante || 1;
    }

    const res = await pool.query(`
      INSERT INTO public.problema_cuadrante (
        id_cuadrante, titulo, tipologia_punto_critico, delito_predominante,
        nivel_riesgo, cantidad_incidentes, radio_metros, lat, lng, geom,
        porque_1, porque_2, porque_3, porque_4, porque_5, causa_raiz,
        factores_ishikawa, actores_corresponsables, id_usuario_analista
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8::numeric, $9::numeric,
        CASE WHEN $8 IS NOT NULL AND $9 IS NOT NULL THEN ST_SetSRID(ST_MakePoint($9::float8, $8::float8), 4326) ELSE NULL END,
        $10, $11, $12, $13, $14, $15,
        $16::jsonb, $17, $18
      )
      RETURNING *
    `, [
      cuadranteFinal,
      titulo,
      tipologia_punto_critico,
      delito_predominante,
      nivel_riesgo,
      parseInt(cantidad_incidentes, 10) || 1,
      parseInt(radio_metros, 10) || 200,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      porque_1,
      porque_2,
      porque_3,
      porque_4,
      porque_5,
      causa_raiz,
      JSON.stringify(factores_ishikawa || {}),
      actores_corresponsables,
      id_usuario_analista
    ]);

    return res.rows[0];
  }

  /**
   * Obtener actividades de la TAMIR (Tabla de Acciones Mínimas Requeridas)
   */
  static async obtenerActividadesTamir({ idCuadrante = null, idPatrullero = null, estado = null } = {}) {
    const params = [];
    let where = 'WHERE 1=1';

    if (idCuadrante) {
      params.push(parseInt(idCuadrante, 10));
      where += ` AND t.id_cuadrante = $${params.length}`;
    }
    if (idPatrullero) {
      params.push(parseInt(idPatrullero, 10));
      where += ` AND (t.id_patrullero_asignado = $${params.length} OR t.id_patrullero_asignado IS NULL)`;
    }
    if (estado) {
      params.push(estado);
      where += ` AND t.estado_cumplimiento = $${params.length}`;
    }

    const res = await pool.query(`
      SELECT
        t.id_tamir,
        t.id_cuadrante,
        c.codigo_cuadrante,
        c.nombre AS cuadrante_nombre,
        c.telefono_contacto AS cuadrante_telefono,
        t.id_problema,
        p.titulo AS problema_titulo,
        p.tipologia_punto_critico,
        t.id_patrullero_asignado,
        u.nombreusuario AS patrullero_nombre,
        t.semana_vigencia,
        t.dias_semana,
        t.franja_horaria,
        t.lugar_especifico,
        t.problematica_priorizada,
        t.actividad_preventiva,
        t.actores_apoyo,
        t.estado_cumplimiento,
        t.observacion_turno,
        t.evidencia_url,
        t.fecha_cumplimiento,
        t.fecha_creacion
      FROM public.tamir_actividad t
      JOIN public.cuadrante c ON t.id_cuadrante = c.id_cuadrante
      LEFT JOIN public.problema_cuadrante p ON t.id_problema = p.id_problema
      LEFT JOIN public.usuario u ON t.id_patrullero_asignado = u.idusuario
      ${where}
      ORDER BY
        CASE t.estado_cumplimiento
          WHEN 'pendiente' THEN 1
          WHEN 'en_ejecucion' THEN 2
          WHEN 'reprogramada' THEN 3
          WHEN 'cumplida' THEN 4
        END ASC,
        t.id_tamir DESC
    `, params);

    return res.rows;
  }

  /**
   * Crear nueva actividad preventiva en la TAMIR de un cuadrante
   */
  static async crearActividadTamir(datos) {
    const {
      id_cuadrante,
      id_problema = null,
      id_patrullero_asignado = null,
      id_usuario_creador = null,
      semana_vigencia = 'Semana Vigente',
      dias_semana = 'Lunes a Domingo',
      franja_horaria = '16:00 a 19:59',
      lugar_especifico,
      problematica_priorizada,
      actividad_preventiva,
      actores_apoyo = 'Patrulla del Cuadrante'
    } = datos;

    const res = await pool.query(`
      INSERT INTO public.tamir_actividad (
        id_cuadrante, id_problema, id_patrullero_asignado, id_usuario_creador,
        semana_vigencia, dias_semana, franja_horaria, lugar_especifico,
        problematica_priorizada, actividad_preventiva, actores_apoyo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      parseInt(id_cuadrante, 10),
      id_problema ? parseInt(id_problema, 10) : null,
      id_patrullero_asignado ? parseInt(id_patrullero_asignado, 10) : null,
      id_usuario_creador ? parseInt(id_usuario_creador, 10) : null,
      semana_vigencia,
      dias_semana,
      franja_horaria,
      lugar_especifico,
      problematica_priorizada,
      actividad_preventiva,
      actores_apoyo
    ]);

    return res.rows[0];
  }

  /**
   * Actualizar estado de cumplimiento de una actividad TAMIR (Protocolo de entrega de turno)
   */
  static async actualizarCumplimientoTamir(idTamir, { estado_cumplimiento, observacion_turno, evidencia_url }) {
    const res = await pool.query(`
      UPDATE public.tamir_actividad
      SET
        estado_cumplimiento = COALESCE($1, estado_cumplimiento),
        observacion_turno = COALESCE($2, observacion_turno),
        evidencia_url = COALESCE($3, evidencia_url),
        fecha_cumplimiento = CASE WHEN $1 = 'cumplida' THEN CURRENT_TIMESTAMP ELSE fecha_cumplimiento END
      WHERE id_tamir = $4
      RETURNING *
    `, [estado_cumplimiento, observacion_turno || null, evidencia_url || null, parseInt(idTamir, 10)]);

    return res.rows[0] || null;
  }
}

module.exports = MnvccModel;

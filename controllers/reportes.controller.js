const PDFDocument = require('pdfkit');
const pool = require('../db');
const mlService = require('../services/ml.service');

/**
 * Generador de Informes Ejecutivos en PDF con PDFKit
 * Diseñado para presentación institucional a entidades de socorro o alcaldía.
 */
const exportarInformePDF = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    const fechaActual = new Date();
    const targetAnio = parseInt(anio) || fechaActual.getFullYear();
    const targetMes = parseInt(mes) || (fechaActual.getMonth() + 1);

    // Calcular rango de fechas del mes seleccionado
    const fechaInicio = `${targetAnio}-${String(targetMes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(targetAnio, targetMes, 0).getDate();
    const fechaFin = `${targetAnio}-${String(targetMes).padStart(2, '0')}-${ultimoDia}`;

    const nombreMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const nombreMes = nombreMeses[targetMes - 1] || 'Mes actual';

    // 1. Consultar métricas del período
    const [totalesRes, tiposRes, zonasRes, estadosRes] = await Promise.all([
      // Total general del período
      pool.query(`
        SELECT COUNT(*) AS total,
               COALESCE(SUM(numero_victimas), 0) AS victimas,
               COALESCE(SUM(numero_vehiculos_afectados), 0) AS vehiculos
        FROM incidente
        WHERE fechaincidente >= $1 AND fechaincidente <= $2
      `, [fechaInicio, fechaFin]),

      // Distribución por tipos de incidente
      pool.query(`
        SELECT tp.nametipoincidente AS tipo, COUNT(*) AS cantidad
        FROM incidente i
        JOIN tipo_incidente tp ON i.idtipoincidente = tp.idtipoincidente
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY tp.nametipoincidente
        ORDER BY cantidad DESC
      `, [fechaInicio, fechaFin]),

      // Top 5 barrios con mayor incidencia
      pool.query(`
        SELECT b.namebarrio, COUNT(*) AS total
        FROM incidente i
        JOIN barrio b ON i.idbarrio = b.gid
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY b.namebarrio
        ORDER BY total DESC
        LIMIT 5
      `, [fechaInicio, fechaFin]),

      // Conteo por estado de resolución
      pool.query(`
        SELECT ei.nombre AS estado, COUNT(*) AS total
        FROM incidente i
        JOIN estado_incidente ei ON i.id_estado = ei.id_estado
        WHERE i.fechaincidente >= $1 AND i.fechaincidente <= $2
        GROUP BY ei.nombre
      `, [fechaInicio, fechaFin])
    ]);

    const totalIncidentes = parseInt(totalesRes.rows[0]?.total || 0);
    const totalVictimas = parseInt(totalesRes.rows[0]?.victimas || 0);
    const totalVehiculos = parseInt(totalesRes.rows[0]?.vehiculos || 0);

    // 2. Configurar cabeceras de respuesta HTTP para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Informe_Ejecutivo_SIGI_${nombreMes}_${targetAnio}.pdf"`
    );

    // 3. Crear documento PDF
    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    doc.pipe(res);

    // ── CABECERA INSTITUCIONAL ──
    doc.rect(40, 40, 532, 70).fill('#0f172a');

    doc.fillColor('#38bdf8').fontSize(16).font('Helvetica-Bold')
       .text('SIGI — SISTEMA DE GESTIÓN DE INCIDENTES', 55, 52);

    doc.fillColor('#f8fafc').fontSize(11).font('Helvetica')
       .text('INFORME EJECUTIVO MENSUAL DE SEGURIDAD CIUDADANA Y RIESGOS', 55, 74);

    doc.fillColor('#94a3b8').fontSize(9)
       .text(`Período de Análisis: ${nombreMes} ${targetAnio} | Generado: ${new Date().toLocaleDateString('es-CO')}`, 55, 90);

    doc.moveDown(3);

    // ── CAJAS DE INDICADORES CLAVE (KPIs) ──
    const yKpi = 130;
    const kpiWidth = 125;
    const kpiHeight = 55;

    // Caja 1: Total Incidentes
    doc.rect(40, yKpi, kpiWidth, kpiHeight).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#0369a1').fontSize(18).font('Helvetica-Bold').text(String(totalIncidentes), 45, yKpi + 10, { width: kpiWidth, align: 'center' });
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text('TOTAL REPORTES', 45, yKpi + 34, { width: kpiWidth, align: 'center' });

    // Caja 2: Víctimas
    doc.rect(175, yKpi, kpiWidth, kpiHeight).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#b91c1c').fontSize(18).font('Helvetica-Bold').text(String(totalVictimas), 175, yKpi + 10, { width: kpiWidth, align: 'center' });
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text('PERSONAS AFECTADAS', 175, yKpi + 34, { width: kpiWidth, align: 'center' });

    // Caja 3: Vehículos
    doc.rect(310, yKpi, kpiWidth, kpiHeight).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#d97706').fontSize(18).font('Helvetica-Bold').text(String(totalVehiculos), 310, yKpi + 10, { width: kpiWidth, align: 'center' });
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text('VEHÍCULOS IMPLICADOS', 310, yKpi + 34, { width: kpiWidth, align: 'center' });

    // Caja 4: Estados
    const resueltos = estadosRes.rows.find(e => e.estado.toLowerCase().includes('resuelto') || e.estado.toLowerCase().includes('aprobado'))?.total || 0;
    const tasa = totalIncidentes > 0 ? Math.round((resueltos / totalIncidentes) * 100) : 0;
    doc.rect(445, yKpi, kpiWidth + 2, kpiHeight).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#15803d').fontSize(18).font('Helvetica-Bold').text(`${tasa}%`, 445, yKpi + 10, { width: kpiWidth + 2, align: 'center' });
    doc.fillColor('#475569').fontSize(8).font('Helvetica').text('EFECTIVIDAD RESOLUCIÓN', 445, yKpi + 34, { width: kpiWidth + 2, align: 'center' });

    // ── SECCIÓN 1: DISTRIBUCIÓN POR TIPOLOGÍA ──
    doc.y = 205;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('1. Distribución por Tipología de Incidente', 40, doc.y);
    doc.moveDown(0.5);

    // Cabecera de tabla
    let tableY = doc.y;
    doc.rect(40, tableY, 532, 20).fill('#e2e8f0');
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
    doc.text('Categoría / Tipo de Incidente', 50, tableY + 5);
    doc.text('Cantidad', 350, tableY + 5, { width: 80, align: 'right' });
    doc.text('% del Total', 450, tableY + 5, { width: 100, align: 'right' });
    tableY += 20;

    doc.font('Helvetica').fontSize(9);
    if (tiposRes.rows.length === 0) {
      doc.fillColor('#64748b').text('No se registraron incidentes en el período seleccionado.', 50, tableY + 6);
      tableY += 20;
    } else {
      tiposRes.rows.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, tableY, 532, 18).fill(bg);
        doc.fillColor('#334155');
        doc.text(r.tipo, 50, tableY + 4);
        doc.text(String(r.cantidad), 350, tableY + 4, { width: 80, align: 'right' });
        const pct = totalIncidentes > 0 ? ((parseInt(r.cantidad) / totalIncidentes) * 100).toFixed(1) : '0.0';
        doc.text(`${pct}%`, 450, tableY + 4, { width: 100, align: 'right' });
        tableY += 18;
      });
    }

    // ── SECCIÓN 2: ZONAS DE MAYOR CONCENTRACIÓN ESPACIAL ──
    tableY += 15;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('2. Zonas Críticas con Mayor Concentración (Top 5 Barrios)', 40, tableY);
    tableY += 20;

    doc.rect(40, tableY, 532, 20).fill('#e2e8f0');
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
    doc.text('Barrio / Sector', 50, tableY + 5);
    doc.text('Total Casos', 350, tableY + 5, { width: 80, align: 'right' });
    doc.text('Nivel de Riesgo', 450, tableY + 5, { width: 100, align: 'right' });
    tableY += 20;

    doc.font('Helvetica').fontSize(9);
    if (zonasRes.rows.length === 0) {
      doc.fillColor('#64748b').text('Sin datos espaciales suficientes para el período.', 50, tableY + 6);
      tableY += 20;
    } else {
      zonasRes.rows.forEach((z, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, tableY, 532, 18).fill(bg);
        doc.fillColor('#334155');
        doc.text(z.namebarrio || 'Zona No Delimitada', 50, tableY + 4);
        doc.text(String(z.total), 350, tableY + 4, { width: 80, align: 'right' });
        const riesgo = idx === 0 ? 'CRÍTICO' : (idx < 3 ? 'ALTO' : 'MODERADO');
        const colorRiesgo = idx === 0 ? '#dc2626' : (idx < 3 ? '#d97706' : '#2563eb');
        doc.fillColor(colorRiesgo).font('Helvetica-Bold').text(riesgo, 450, tableY + 4, { width: 100, align: 'right' });
        doc.font('Helvetica');
        tableY += 18;
      });
    }

    // ── SECCIÓN 3: RECOMENDACIONES OPERATIVAS & FORECAST ML ──
    tableY += 15;

    // Obtener proyección de ML para el informe
    let historicoMl = [];
    try {
      const histQuery = `
        SELECT TO_CHAR(fechaincidente, 'YYYY-MM') as mes, COUNT(*)::int as total
        FROM incidente
        WHERE fechaincidente IS NOT NULL
        GROUP BY TO_CHAR(fechaincidente, 'YYYY-MM')
        ORDER BY mes ASC
        LIMIT 12
      `;
      const histRes = await pool.query(histQuery);
      historicoMl = histRes.rows || [];
    } catch (e) {}

    const forecastMl = mlService.proyectarTendencia(historicoMl, 1);
    const estimadoMes = forecastMl.proyeccion && forecastMl.proyeccion[0] ? forecastMl.proyeccion[0].cantidad_estimada : 'N/A';

    doc.rect(40, tableY, 532, 98).fillAndStroke('#eff6ff', '#bfdbfe');
    doc.fillColor('#1e40af').fontSize(9.5).font('Helvetica-Bold')
       .text('RECOMENDACIONES OPERATIVAS Y PRONÓSTICO PREDICTIVO (SIGI-ML)', 52, tableY + 8);

    doc.fillColor('#1e3a8a').fontSize(8.2).font('Helvetica')
       .text(`• Pronóstico Machine Learning: Tendencia "${forecastMl.tendencia}" | Proyección mes próximo: ~${estimadoMes} casos.`, 52, tableY + 24)
       .text('• Focalizar patrullaje motorizado en los barrios líderes de la lista durante los horarios de mayor afluencia.', 52, tableY + 39)
       .text('• Inspección de alumbrado público y cámaras de seguridad en puntos ciegos reportados con factor de infraestructura.', 52, tableY + 54)
       .text('• Disponer de ambulancia preventiva en horas pico en cercanías a corredores con mayor tasa de accidentalidad vial.', 52, tableY + 69)
       .text('• Dar prioridad en cola de validación a reportes pendientes con gravedad mayor o igual a 4.', 52, tableY + 84);

    // ── PIE DE PÁGINA INSTITUCIONAL ──
    doc.rect(40, 720, 532, 0.5).stroke('#cbd5e1');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text('SIGI — Plataforma de Gestión y Mapeo de Incidentes | Reporte Oficial Automatizado con IA', 40, 728);
    doc.text('Página 1 de 1', 40, 728, { align: 'right', width: 532 });

    doc.end();

  } catch (error) {
    console.error('Error al generar informe PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ mensaje: 'Error al generar el reporte PDF en el servidor' });
    }
  }
};

module.exports = {
  exportarInformePDF
};

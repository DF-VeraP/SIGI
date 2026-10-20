const PDFDocument = require('pdfkit');
const mlService = require('../services/ml.service');
const EstadisticasModel = require('../models/estadisticas.model');
const logger = require('../utils/logger');

/**
 * Generador de Informes Ejecutivos en PDF con PDFKit
 * Diseñado con estética minimalista, estructurada, tonos suaves y sin iconos,
 * ideal para presentación ejecutiva ante comités de seguridad o alcaldía.
 */
const exportarInformePDF = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    const fechaActual = new Date();
    const targetAnio = parseInt(anio, 10) || fechaActual.getFullYear();
    const targetMes = parseInt(mes, 10) || (fechaActual.getMonth() + 1);

    // Rango de fechas del mes seleccionado
    const fechaInicio = `${targetAnio}-${String(targetMes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(targetAnio, targetMes, 0).getDate();
    const fechaFin = `${targetAnio}-${String(targetMes).padStart(2, '0')}-${ultimoDia}`;

    const nombreMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const nombreMes = nombreMeses[targetMes - 1] || 'Mes actual';
    const fechaEmision = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // 1. Consultar métricas del período
    const {
      tiposRes,
      zonasRes,
      estadosRes,
      totalIncidentes,
      totalVictimas,
      totalVehiculos
    } = await EstadisticasModel.obtenerMetricasPeriodo(fechaInicio, fechaFin);

    // 2. Cabeceras HTTP (visualización interactiva inline o descarga)
    const isInline = req.query?.preview === '1' || req.query?.inline === '1' || req.query?.preview === 'true';
    const disposition = isInline ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="Informe_Ejecutivo_SIGI_${nombreMes}_${targetAnio}.pdf"`
    );

    // 3. Crear documento PDF (Letter: 612 x 792 pt, margen 40 pt, ancho útil: 532 pt)
    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    doc.pipe(res);

    const margenX = 40;
    const anchoUtil = 532;

    // ── CABECERA INSTITUCIONAL EJECUTIVA Y ESTRUCTURADA ──
    // Barra superior de acento neutro sobrio
    doc.rect(margenX, 40, anchoUtil, 3).fill('#334155');

    // Título institucional en negrilla con tipografía uniforme
    doc.fillColor('#0f172a').fontSize(15).font('Helvetica-Bold')
       .text('SIGI — SISTEMA DE GESTIÓN DE INCIDENTES', margenX, 52);

    // Subtítulo oficial estructurado
    doc.fillColor('#334155').fontSize(9.5).font('Helvetica-Bold')
       .text('Informe Ejecutivo Mensual de Seguridad Ciudadana y Análisis Territorial', margenX, 70);

    // Fila de metadatos del documento
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text(`Período de análisis: ${nombreMes} ${targetAnio}   |   Fecha de emisión: ${fechaEmision}   |   Documento Oficial Automatizado`, margenX, 86);

    // Línea divisoria suave
    doc.rect(margenX, 102, anchoUtil, 0.75).fill('#e2e8f0');

    // ── CAJAS DE INDICADORES CLAVE (KPIs en tonalidades suaves y uniformes) ──
    const yKpi = 114;
    const kpiWidth = 124;
    const kpiHeight = 50;
    const kpiGap = 12;

    // Caja 1: Total Incidentes
    doc.roundedRect(margenX, yKpi, kpiWidth, kpiHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold')
       .text(String(totalIncidentes), margenX, yKpi + 8, { width: kpiWidth, align: 'center' });
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold')
       .text('TOTAL INCIDENTES', margenX, yKpi + 32, { width: kpiWidth, align: 'center' });

    // Caja 2: Personas Afectadas
    const xKpi2 = margenX + kpiWidth + kpiGap;
    doc.roundedRect(xKpi2, yKpi, kpiWidth, kpiHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold')
       .text(String(totalVictimas), xKpi2, yKpi + 8, { width: kpiWidth, align: 'center' });
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold')
       .text('PERSONAS AFECTADAS', xKpi2, yKpi + 32, { width: kpiWidth, align: 'center' });

    // Caja 3: Vehículos Implicados
    const xKpi3 = xKpi2 + kpiWidth + kpiGap;
    doc.roundedRect(xKpi3, yKpi, kpiWidth, kpiHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold')
       .text(String(totalVehiculos), xKpi3, yKpi + 8, { width: kpiWidth, align: 'center' });
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold')
       .text('VEHÍCULOS IMPLICADOS', xKpi3, yKpi + 32, { width: kpiWidth, align: 'center' });

    // Caja 4: Tasa de Resolución
    const xKpi4 = xKpi3 + kpiWidth + kpiGap;
    const resueltos = estadosRes.rows.find(e => {
      const est = (e.estado || '').toLowerCase();
      return est.includes('resuelto') || est.includes('aprobado');
    })?.total || 0;
    const tasa = totalIncidentes > 0 ? Math.round((resueltos / totalIncidentes) * 100) : 0;
    doc.roundedRect(xKpi4, yKpi, kpiWidth, kpiHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold')
       .text(`${tasa}%`, xKpi4, yKpi + 8, { width: kpiWidth, align: 'center' });
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold')
       .text('TASA DE RESOLUCIÓN', xKpi4, yKpi + 32, { width: kpiWidth, align: 'center' });

    // ── SECCIÓN 1: DISTRIBUCIÓN POR TIPOLOGÍA DE INCIDENTE ──
    let tableY = 178;
    doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold')
       .text('1. DISTRIBUCIÓN POR TIPOLOGÍA DE INCIDENTE', margenX, tableY);
    tableY += 16;

    // Encabezado de la tabla de tipologías
    doc.rect(margenX, tableY, anchoUtil, 18).fillAndStroke('#f1f5f9', '#e2e8f0');
    doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold');
    doc.text('Categoría / Tipo de Incidente', margenX + 12, tableY + 5);
    doc.text('Cantidad', 350, tableY + 5, { width: 80, align: 'right' });
    doc.text('% del Total', 450, tableY + 5, { width: 95, align: 'right' });
    tableY += 18;

    if (!tiposRes || tiposRes.rows.length === 0) {
      doc.rect(margenX, tableY, anchoUtil, 18).fill('#ffffff');
      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text('No se registraron incidentes clasificados en el período.', margenX + 12, tableY + 5);
      tableY += 18;
    } else {
      const tiposMostrar = tiposRes.rows.slice(0, 6);
      tiposMostrar.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(margenX, tableY, anchoUtil, 16).fill(bg);
        doc.rect(margenX, tableY + 15.5, anchoUtil, 0.5).fill('#e2e8f0');
        
        doc.fillColor('#334155').font('Helvetica').fontSize(8);
        doc.text(r.tipo || 'Sin categoría', margenX + 12, tableY + 4);
        
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8);
        doc.text(String(r.cantidad), 350, tableY + 4, { width: 80, align: 'right' });
        
        const pct = totalIncidentes > 0 ? ((parseInt(r.cantidad, 10) / totalIncidentes) * 100).toFixed(1) : '0.0';
        doc.font('Helvetica').fillColor('#475569');
        doc.text(`${pct}%`, 450, tableY + 4, { width: 95, align: 'right' });
        tableY += 16;
      });
    }

    // ── SECCIÓN 2: ZONAS CON MAYOR CONCENTRACIÓN ESPACIAL ──
    tableY += 14;
    doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold')
       .text('2. ZONAS CON MAYOR CONCENTRACIÓN ESPACIAL (TOP 5 SECTORES)', margenX, tableY);
    tableY += 16;

    // Encabezado de la tabla de sectores
    doc.rect(margenX, tableY, anchoUtil, 18).fillAndStroke('#f1f5f9', '#e2e8f0');
    doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold');
    doc.text('Barrio / Sector Territorial', margenX + 12, tableY + 5);
    doc.text('Total Casos', 350, tableY + 5, { width: 80, align: 'right' });
    doc.text('Nivel de Riesgo', 450, tableY + 5, { width: 95, align: 'right' });
    tableY += 18;

    if (!zonasRes || zonasRes.rows.length === 0) {
      doc.rect(margenX, tableY, anchoUtil, 18).fill('#ffffff');
      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text('Sin datos espaciales registrados para el período seleccionado.', margenX + 12, tableY + 5);
      tableY += 18;
    } else {
      const zonasMostrar = zonasRes.rows.slice(0, 5);
      zonasMostrar.forEach((z, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(margenX, tableY, anchoUtil, 16).fill(bg);
        doc.rect(margenX, tableY + 15.5, anchoUtil, 0.5).fill('#e2e8f0');
        
        doc.fillColor('#334155').font('Helvetica').fontSize(8);
        doc.text(z.namebarrio || 'Sector no delimitado', margenX + 12, tableY + 4);
        
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8);
        doc.text(String(z.total), 350, tableY + 4, { width: 80, align: 'right' });

        const riesgoTexto = idx === 0 ? 'Crítico' : (idx < 3 ? 'Alto' : 'Moderado');
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(7.5)
           .text(riesgoTexto, 450, tableY + 4, { width: 95, align: 'right' });
        tableY += 16;
      });
    }

    // ── SECCIÓN 3: PRONÓSTICO ANALÍTICO Y LINEAMIENTOS OPERATIVOS (SIGI-ML) ──
    tableY += 14;

    let historicoMl = [];
    try {
      historicoMl = await EstadisticasModel.obtenerHistoricoMensualParaML(12);
    } catch (err) {
      logger.warn('No se pudo obtener histórico ML para informe PDF:', { error: err.message });
    }

    const forecastMl = mlService.proyectarTendencia(historicoMl, 1);
    const estimadoMes = forecastMl.proyeccion && forecastMl.proyeccion[0] ? forecastMl.proyeccion[0].cantidad_estimada : 'N/A';

    const cardHeight = 96;
    doc.roundedRect(margenX, tableY, anchoUtil, cardHeight, 4).fillAndStroke('#f8fafc', '#e2e8f0');

    doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
       .text('3. PRONÓSTICO ANALÍTICO Y LINEAMIENTOS OPERATIVOS (SIGI-ML)', margenX + 12, tableY + 8);

    doc.fillColor('#334155').fontSize(7.8);
    
    // Línea 1: Proyección ML
    doc.font('Helvetica-Bold').text('• Proyección analítica ML: ', margenX + 12, tableY + 23, { continued: true });
    doc.font('Helvetica').text(`Tendencia identificada "${forecastMl.tendencia}" | Estimación mes siguiente: ~${estimadoMes} incidentes.`);

    // Línea 2: Patrullaje
    doc.font('Helvetica-Bold').text('• Patrullaje preventivo: ', margenX + 12, tableY + 37, { continued: true });
    doc.font('Helvetica').text('Focalizar recorridos en los sectores de mayor concentración durante franjas de alta recurrencia.');

    // Línea 3: Infraestructura
    doc.font('Helvetica-Bold').text('• Infraestructura y entorno: ', margenX + 12, tableY + 51, { continued: true });
    doc.font('Helvetica').text('Coordinar revisión de alumbrado público, señalización y reductores en zonas de riesgo.');

    // Línea 4: Emergencias
    doc.font('Helvetica-Bold').text('• Disposición de emergencias: ', margenX + 12, tableY + 65, { continued: true });
    doc.font('Helvetica').text('Asegurar puntos estratégicos de atención prehospitalaria en corredores de accidentalidad vial.');

    // Línea 5: Validación
    doc.font('Helvetica-Bold').text('• Control y validación: ', margenX + 12, tableY + 79, { continued: true });
    doc.font('Helvetica').text('Priorizar auditoría y validación estricta de reportes en cola calificados con gravedad 4 o 5.');

    // ── PIE DE PÁGINA INSTITUCIONAL ──
    const yFooter = 736;
    doc.rect(margenX, yFooter, anchoUtil, 0.75).fill('#e2e8f0');
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
       .text('SIGI — Sistema de Información Geográfica de Incidentes | Documento Oficial Automatizado', margenX, yFooter + 6);
    doc.text('Página 1 de 1', margenX, yFooter + 6, { align: 'right', width: anchoUtil });

    doc.end();

  } catch (error) {
    logger.error('Error al generar informe PDF:', { error: error.message });
    if (!res.headersSent && typeof res.status === 'function') {
      res.status(500).json({ mensaje: 'Error al generar el reporte PDF en el servidor' });
    }
  }
};

module.exports = {
  exportarInformePDF
};

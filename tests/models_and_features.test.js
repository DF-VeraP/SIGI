const IncidenteModel = require('../models/incidente.model');
const EstadisticasModel = require('../models/estadisticas.model');
const GeografiaModel = require('../models/geografia.model');
const CatalogosModel = require('../models/catalogos.model');
const { csrfProtection, getCsrfToken } = require('../middleware/csrf.middleware');

// Mock del pool de base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');

describe('Pruebas de Nuevos Modelos y Refactorización A-G', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IncidenteModel - Paginación y Consultas', () => {
    it('debería retornar datos paginados cuando se envía page y limit', async () => {
      // Mock de conteo total
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '35' }] })
        .mockResolvedValueOnce({ rows: [{ idincidente: 1 }, { idincidente: 2 }] });

      const result = await IncidenteModel.obtenerTodosConFiltros({}, { page: 1, limit: 10 });

      expect(result.total).toBe(35);
      expect(result.rows).toHaveLength(2);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('debería retornar array directo si no se especifica paginación', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ idincidente: 1 }, { idincidente: 2 }] });

      const result = await IncidenteModel.obtenerTodosConFiltros({});

      expect(result.total).toBe(2);
      expect(result.rows).toHaveLength(2);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('EstadisticasModel - Resumen Dinámico', () => {
    it('debería consultar resumen con agregación dinámica', async () => {
      const mockRow = { total: 10, robos: 4, agresiones: 3, piques: 2, accidentes: 1 };
      pool.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await EstadisticasModel.obtenerResumen('2026-01-01', '2026-06-30');

      expect(result.rows[0].total).toBe(10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE(SUM('),
        ['2026-01-01', '2026-06-30']
      );
    });
  });

  describe('GeografiaModel - Optimización Espacial', () => {
    it('debería utilizar join optimizado por clave foránea', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ idincidente: 1, namebarrio: 'Centro' }] });

      const result = await GeografiaModel.obtenerIncidentes({ nombre: 'Centro', tipoLugar: 'Barrio' });

      expect(result.rows[0].namebarrio).toBe('Centro');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('i.idbarrio = b.gid'),
        ['%Centro%']
      );
    });
  });

  describe('CatalogosModel', () => {
    it('debería consolidar todos los catálogos en una sola llamada', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id_categoria: 1 }] })
        .mockResolvedValueOnce({ rows: [{ idtipoincidente: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id_estado: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id_gravedad: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id_modalidad: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id_factor: 1 }] });

      const catalogos = await CatalogosModel.obtenerTodos();

      expect(catalogos.categorias).toHaveLength(1);
      expect(catalogos.tipos).toHaveLength(1);
      expect(catalogos.estados).toHaveLength(1);
      expect(catalogos.gravedades).toHaveLength(1);
      expect(catalogos.modalidades).toHaveLength(1);
      expect(catalogos.factores).toHaveLength(1);
    });
  });

  describe('CSRF Middleware', () => {
    it('debería omitir validación en entorno test', () => {
      const req = { method: 'POST', path: '/api/incidentes', headers: {} };
      const res = {};
      const next = jest.fn();

      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('getCsrfToken debería generar o retornar el token de sesión', () => {
      const req = { session: {} };
      const res = { json: jest.fn() };

      getCsrfToken(req, res);

      expect(req.session.csrfToken).toBeDefined();
      expect(res.json).toHaveBeenCalledWith({ csrfToken: req.session.csrfToken });
    });
  });

  describe('Reportes Controller - PDFKit', () => {
    const reportesController = require('../controllers/reportes.controller');

    it('debería generar y transmitir un archivo PDF con cabecera application/pdf', async () => {
      // Mock de queries del reporte
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '15', victimas: '2', vehiculos: '1' }] }) // totales
        .mockResolvedValueOnce({ rows: [{ tipo: 'Robo', cantidad: '10' }] }) // tipos
        .mockResolvedValueOnce({ rows: [{ namebarrio: 'Centro', total: '8' }] }) // zonas
        .mockResolvedValueOnce({ rows: [{ estado: 'Resuelto', total: '12' }] }); // estados

      const req = {
        query: { mes: '8', anio: '2026' }
      };

      const setHeaderMock = jest.fn();
      const writeMock = jest.fn();
      const endMock = jest.fn();

      const res = {
        setHeader: setHeaderMock,
        writeHead: jest.fn(),
        write: writeMock,
        end: endMock,
        on: jest.fn(),
        emit: jest.fn(),
        once: jest.fn()
      };

      await reportesController.exportarInformePDF(req, res);

      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=')
      );
    });
  });
});


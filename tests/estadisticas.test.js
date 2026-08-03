const request = require('supertest');

// Mock del módulo de base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock de bcrypt (requerido por auth.controller)
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

const pool = require('../db');
const app = require('../server');

describe('Estadísticas Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // GET /conteoIncidente
  // ─────────────────────────────────────────────
  describe('GET /conteoIncidente', () => {

    it('debería retornar el conteo total de incidentes', async () => {
      pool.query.mockResolvedValue({ rows: [{ count: '42' }] });

      const res = await request(app).get('/conteoIncidente');

      expect(res.status).toBe(200);
      expect(res.body[0].count).toBe('42');
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/conteoIncidente');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error en servidor');
    });
  });

  // ─────────────────────────────────────────────
  // GET /conteoPorTipo
  // ─────────────────────────────────────────────
  describe('GET /conteoPorTipo', () => {

    it('debería retornar conteo agrupado por tipo', async () => {
      const mockData = [
        { idtipoincidente: 1, tipo: 'Robo', cantidad: '20' },
        { idtipoincidente: 2, tipo: 'Agresiones/Amenazas', cantidad: '10' }
      ];
      pool.query.mockResolvedValue({ rows: mockData });

      const res = await request(app).get('/conteoPorTipo');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].tipo).toBe('Robo');
    });
  });

  // ─────────────────────────────────────────────
  // GET /resumen
  // ─────────────────────────────────────────────
  describe('GET /resumen', () => {

    it('debería retornar el resumen general', async () => {
      const mockResumen = {
        total: '50',
        robos: '20',
        agresiones: '15',
        piques: '10',
        accidentes: '5'
      };
      pool.query.mockResolvedValue({ rows: [mockResumen] });

      const res = await request(app).get('/resumen');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe('50');
      expect(res.body.robos).toBe('20');
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/resumen');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error en resumen');
    });
  });

  // ─────────────────────────────────────────────
  // GET /top-zonas
  // ─────────────────────────────────────────────
  describe('GET /top-zonas', () => {

    it('debería retornar el barrio y vereda con más incidentes', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ namebarrio: 'Centro', total: '15' }] })
        .mockResolvedValueOnce({ rows: [{ nombre: 'La Esperanza', total: '8' }] });

      const res = await request(app).get('/top-zonas');

      expect(res.status).toBe(200);
      expect(res.body.barrio.namebarrio).toBe('Centro');
      expect(res.body.vereda.nombre).toBe('La Esperanza');
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/top-zonas');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error en top zonas');
    });
  });

  // ─────────────────────────────────────────────
  // GET /top-incidentes
  // ─────────────────────────────────────────────
  describe('GET /top-incidentes', () => {

    it('debería retornar tipos con colores asignados', async () => {
      const mockData = [
        { tipo: 'Robo', cantidad: '20' },
        { tipo: 'Piques', cantidad: '10' }
      ];
      pool.query.mockResolvedValue({ rows: mockData });

      const res = await request(app).get('/top-incidentes');

      expect(res.status).toBe(200);
      expect(res.body[0].color).toBe('#e74c3c'); // Color del Robo
      expect(res.body[1].color).toBe('#9b59b6'); // Color de Piques
      expect(res.body[0].cantidad).toBe(20);     // Debe ser número, no string
    });

    it('debería usar color por defecto para tipos desconocidos', async () => {
      pool.query.mockResolvedValue({
        rows: [{ tipo: 'TipoDesconocido', cantidad: '5' }]
      });

      const res = await request(app).get('/top-incidentes');

      expect(res.status).toBe(200);
      expect(res.body[0].color).toBe('#3498db'); // Color por defecto
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/top-incidentes');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error en top incidentes');
    });
  });
});

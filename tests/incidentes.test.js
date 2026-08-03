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

describe('Incidentes Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // POST /registrarIncidente
  // ─────────────────────────────────────────────
  describe('POST /registrarIncidente', () => {

    it('debería registrar un incidente correctamente', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/registrarIncidente')
        .send({
          tipo: 1,
          fecha: '2026-08-01',
          hora: '14:30',
          lat: 2.4419,
          lng: -76.6063,
          descripcion: 'Incidente de prueba'
        });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Incidente registrado ✅');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 500 si la BD falla al registrar', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/registrarIncidente')
        .send({
          tipo: 1,
          fecha: '2026-08-01',
          hora: '14:30',
          lat: 2.4419,
          lng: -76.6063,
          descripcion: 'Incidente fallido'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error en servidor');
    });
  });

  // ─────────────────────────────────────────────
  // GET /incidente/:id
  // ─────────────────────────────────────────────
  describe('GET /incidente/:id', () => {

    it('debería obtener un incidente por ID', async () => {
      const mockIncidente = {
        idincidente: 1,
        descripcionincidente: 'Robo en zona céntrica',
        idtipoincidente: 1,
        fechaincidente: '2026-08-01'
      };
      pool.query.mockResolvedValue({ rows: [mockIncidente] });

      const res = await request(app).get('/incidente/1');

      expect(res.status).toBe(200);
      expect(res.body.idincidente).toBe(1);
      expect(res.body.descripcionincidente).toBe('Robo en zona céntrica');
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/incidente/999');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error');
    });
  });

  // ─────────────────────────────────────────────
  // PUT /incidente/:id
  // ─────────────────────────────────────────────
  describe('PUT /incidente/:id', () => {

    it('debería actualizar un incidente correctamente', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const res = await request(app)
        .put('/incidente/1')
        .send({
          fechaincidente: '2026-08-02',
          horaincidente: '16:00',
          descripcionincidente: 'Descripción actualizada'
        });

      expect(res.status).toBe(200);
    });

    it('debería retornar 500 si la actualización falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .put('/incidente/1')
        .send({
          fechaincidente: '2026-08-02',
          horaincidente: '16:00',
          descripcionincidente: 'Falla'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error actualizando');
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /incidente/:id
  // ─────────────────────────────────────────────
  describe('DELETE /incidente/:id', () => {

    it('debería eliminar un incidente correctamente', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const res = await request(app).delete('/incidente/1');

      expect(res.status).toBe(200);
    });

    it('debería retornar 500 si la eliminación falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).delete('/incidente/999');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error eliminando');
    });
  });
});

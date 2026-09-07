const request = require('supertest');

// Mock del módulo de base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock de bcrypt (requerido por auth.controller)
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2b$10$hashed')
}));

// Mock de Cloudinary
jest.mock('../utils/cloudinary', () => ({
  subirImagenCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image.png')
}));

// Mock de autenticacion para tests
jest.mock('../middleware/auth.middleware', () => ({
  verificarSesion: (req, res, next) => {
    req.session.usuario = 'Daniel';
    req.session.idusuario = 1;
    req.session.rol = 'reportero';
    req.session.estado = 'activo';
    next();
  },
  verificarRol: () => (req, res, next) => next(),
  verificarEstadoActivo: (req, res, next) => next()
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
      pool.query
        .mockResolvedValueOnce({ rows: [{ gid: 1 }] }) // barrio lookup
        .mockResolvedValueOnce({ rows: [] }) // vereda lookup
        .mockResolvedValueOnce({ rows: [{ idincidente: 1, codigoincidente: 'INC-100001' }] }) // insert
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

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

      expect(res.status).toBe(201);
      expect(res.body.mensaje).toBe('Incidente registrado exitosamente ✅');
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
      expect(res.body.mensaje).toContain('Error');
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
        fechaincidente: '2026-08-01',
        idusuario: 1
      };
      pool.query.mockResolvedValueOnce({ rows: [mockIncidente] });

      const res = await request(app).get('/incidente/1');

      expect(res.status).toBe(200);
      expect(res.body.idincidente).toBe(1);
      expect(res.body.descripcionincidente).toBe('Robo en zona céntrica');
    });

    it('debería retornar 404 si el incidente no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/incidente/999');

      expect(res.status).toBe(404);
      expect(res.body.mensaje).toMatch(/no encontrado/i);
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/incidente/999');

      expect(res.status).toBe(500);
      expect(res.body.mensaje).toContain('Error');
    });
  });

  // ─────────────────────────────────────────────
  // PUT /incidente/:id
  // ─────────────────────────────────────────────
  describe('PUT /incidente/:id', () => {

    it('debería actualizar un incidente correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ idusuario: 1, id_usuario_creador: 1, id_estado: 1 }] }) // check owner y estado
        .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE query
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

      const res = await request(app)
        .put('/incidente/1')
        .send({
          fechaincidente: '2026-08-02',
          horaincidente: '16:00',
          descripcionincidente: 'Descripción actualizada'
        });

      expect(res.status).toBe(200);
    });

    it('debería retornar 403 si el incidente no pertenece al usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ idusuario: 99, id_usuario_creador: 99, id_estado: 1 }] });

      const res = await request(app)
        .put('/incidente/1')
        .send({
          fechaincidente: '2026-08-02',
          horaincidente: '16:00',
          descripcionincidente: 'Falla'
        });

      expect(res.status).toBe(403);
    });

    it('debería retornar 500 si la actualización falla', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ idusuario: 1, id_usuario_creador: 1, id_estado: 1 }] })
        .mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app)
        .put('/incidente/1')
        .send({
          fechaincidente: '2026-08-02',
          horaincidente: '16:00',
          descripcionincidente: 'Falla'
        });

      expect(res.status).toBe(500);
      expect(res.body.mensaje).toContain('Error');
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /incidente/:id
  // ─────────────────────────────────────────────
  describe('DELETE /incidente/:id', () => {

    it('debería eliminar un incidente correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ idusuario: 1, id_usuario_creador: 1 }] }) // check ownership
        .mockResolvedValueOnce({ rowCount: 1 }) // DELETE query
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

      const res = await request(app).delete('/incidente/1');

      expect(res.status).toBe(200);
    });

    it('debería retornar 403 si el incidente no pertenece al usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ idusuario: 99, id_usuario_creador: 99 }] });

      const res = await request(app).delete('/incidente/5');

      expect(res.status).toBe(403);
    });

    it('debería retornar 500 si la eliminación falla', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ idusuario: 1, id_usuario_creador: 1 }] })
        .mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).delete('/incidente/999');

      expect(res.status).toBe(500);
      expect(res.body.mensaje).toContain('Error');
    });
  });
});

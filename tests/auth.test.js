const request = require('supertest');

// Mock del módulo de base de datos
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

const pool = require('../db');
const bcrypt = require('bcrypt');
const app = require('../server');

describe('Auth Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // POST /login
  // ─────────────────────────────────────────────
  describe('POST /login', () => {

    it('debería retornar 200 con credenciales correctas', async () => {
      pool.query.mockResolvedValue({
        rows: [{
          idusuario: 1,
          nombreusuario: 'admin',
          contraseniausuario: '$2b$10$hashedpassword'
        }]
      });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/login')
        .send({ usuario: 'admin', contrasenia: 'miPassword123' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toBe('Login correcto ✅');
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM usuario WHERE nombreusuario = $1',
        ['admin']
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('miPassword123', '$2b$10$hashedpassword');
    });

    it('debería retornar 401 con contraseña incorrecta', async () => {
      pool.query.mockResolvedValue({
        rows: [{
          idusuario: 1,
          nombreusuario: 'admin',
          contraseniausuario: '$2b$10$hashedpassword'
        }]
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/login')
        .send({ usuario: 'admin', contrasenia: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.mensaje).toBe('Usuario o contraseña incorrectos ❌');
    });

    it('debería retornar 401 con usuario inexistente', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/login')
        .send({ usuario: 'noExiste', contrasenia: 'algo' });

      expect(res.status).toBe(401);
      expect(res.body.mensaje).toBe('Usuario o contraseña incorrectos ❌');
    });

    it('debería retornar 500 si la BD falla', async () => {
      pool.query.mockRejectedValue(new Error('Connection refused'));

      const res = await request(app)
        .post('/login')
        .send({ usuario: 'admin', contrasenia: 'test' });

      expect(res.status).toBe(500);
      expect(res.body.mensaje).toBe('Error en el servidor');
    });
  });

  // ─────────────────────────────────────────────
  // GET /usuario
  // ─────────────────────────────────────────────
  describe('GET /usuario', () => {

    it('debería retornar 401 si no hay sesión activa', async () => {
      const res = await request(app).get('/usuario');

      expect(res.status).toBe(401);
      expect(res.body.mensaje).toBe('No autenticado');
    });
  });

  // ─────────────────────────────────────────────
  // GET /logout
  // ─────────────────────────────────────────────
  describe('GET /logout', () => {

    it('debería redirigir al login después de cerrar sesión', async () => {
      const res = await request(app).get('/logout');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login/index.html');
    });
  });
});

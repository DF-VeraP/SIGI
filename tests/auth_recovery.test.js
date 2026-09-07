const request = require('supertest');

// Mocks
jest.mock('../db', () => ({
  query: jest.fn()
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedNewPassword'),
  compare: jest.fn()
}));

jest.mock('../utils/mailer', () => ({
  enviarEmailRecuperacion: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
  enviarEmailBienvenida: jest.fn().mockResolvedValue({ messageId: 'test-456' })
}));

const pool = require('../db');
const mailer = require('../utils/mailer');
const app = require('../server');

describe('Flujo de Recuperación de Contraseña y Control de Acceso', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/recuperar-password', () => {
    it('debería rechazar un correo inválido con 400', async () => {
      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'correo-invalido' });

      expect(res.status).toBe(400);
      expect(res.body.mensaje).toContain('correo electrónico válido');
    });

    it('debería responder con mensaje genérico si el correo no existe en la BD', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // SELECT usuario

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'no_existe@sigi.gov.co' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('recibirás un enlace');
      expect(mailer.enviarEmailRecuperacion).not.toHaveBeenCalled();
    });

    it('debería generar token y enviar correo si el usuario existe', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{ idusuario: 5, nombreusuario: 'carlos_reportero', email: 'carlos@sigi.gov.co' }]
        }) // SELECT usuario
        .mockResolvedValueOnce({ rows: [] }) // UPDATE token anteriores
        .mockResolvedValueOnce({ rows: [] }) // INSERT token
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'carlos@sigi.gov.co' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('recibirás un enlace');
      expect(mailer.enviarEmailRecuperacion).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/validar-token-reset', () => {
    it('debería rechazar si no se envía token con 400', async () => {
      const res = await request(app).get('/api/auth/validar-token-reset');
      expect(res.status).toBe(400);
      expect(res.body.valido).toBe(false);
    });

    it('debería indicar token inválido con 404 si no existe en BD', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/auth/validar-token-reset?token=tokentest123');
      expect(res.status).toBe(404);
      expect(res.body.valido).toBe(false);
    });

    it('debería aceptar un token válido y no expirado', async () => {
      const fechaFutura = new Date(Date.now() + 30 * 60 * 1000);
      pool.query.mockResolvedValueOnce({
        rows: [{
          id_token: 1,
          expiracion: fechaFutura,
          usado: false,
          nombreusuario: 'carlos_reportero',
          email: 'carlos@sigi.gov.co'
        }]
      });

      const res = await request(app).get('/api/auth/validar-token-reset?token=validtoken123');
      expect(res.status).toBe(200);
      expect(res.body.valido).toBe(true);
      expect(res.body.usuario).toBe('carlos_reportero');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('debería exigir contraseña de al menos 8 caracteres y complejidad', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'abc', nuevaContrasenia: '123' });

      expect(res.status).toBe(400);
      expect(res.body.mensaje).toContain('al menos 8 caracteres');
    });

    it('debería restablecer la contraseña si el token es válido', async () => {
      const fechaFutura = new Date(Date.now() + 30 * 60 * 1000);
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id_token: 1,
            id_usuario: 5,
            expiracion: fechaFutura,
            usado: false,
            nombreusuario: 'carlos_reportero'
          }]
        }) // SELECT token
        .mockResolvedValueOnce({ rows: [] }) // UPDATE usuario
        .mockResolvedValueOnce({ rows: [] }) // UPDATE token usado
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'validtoken123', nuevaContrasenia: 'MiNuevaClaveSegura2026' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('restablecida exitosamente');
    });
  });

  describe('POST /api/auth/cambiar-password-primer-ingreso', () => {
    it('debería rechazar con 401 si no hay sesión activa', async () => {
      const res = await request(app)
        .post('/api/auth/cambiar-password-primer-ingreso')
        .send({ contraseniaActual: 'temp123', nuevaContrasenia: 'nuevaClave2026' });

      expect(res.status).toBe(401);
    });
  });
});

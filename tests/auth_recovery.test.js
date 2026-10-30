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
const gestorRecuperacion = require('../utils/gestorRecuperacion');
const app = require('../server');

describe('Flujo de Recuperación de Contraseña y Control de Acceso', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    gestorRecuperacion.reset();
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
        .mockResolvedValueOnce({ rows: [] }) // SELECT ultimo token (cooldown)
        .mockResolvedValueOnce({ rows: [] }) // UPDATE token anteriores
        .mockResolvedValueOnce({ rows: [] }) // INSERT token
        .mockResolvedValueOnce({ rows: [] }); // log auditoria

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'carlos@sigi.gov.co' });

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('recibirás un enlace');
      expect(res.body.segundosCooldown).toBe(120);
      expect(mailer.enviarEmailRecuperacion).toHaveBeenCalled();
    });

    it('debería rechazar con 429 si se solicita nuevamente antes del tiempo de cooldown', async () => {
      // Simular que ya se envió una solicitud previa para este correo
      gestorRecuperacion.registrarEnvio('carlos@sigi.gov.co');

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'carlos@sigi.gov.co' });

      expect(res.status).toBe(429);
      expect(res.body.cooldown).toBe(true);
      expect(res.body.segundosRestantes).toBeGreaterThan(0);
      expect(mailer.enviarEmailRecuperacion).not.toHaveBeenCalled();
    });

    it('debería rechazar con 429 si el último token en BD se generó hace menos de 2 minutos', async () => {
      const fechaHaceUnMinuto = new Date(Date.now() - 60 * 1000);
      pool.query
        .mockResolvedValueOnce({
          rows: [{ idusuario: 5, nombreusuario: 'carlos_reportero', email: 'carlos@sigi.gov.co' }]
        }) // SELECT usuario
        .mockResolvedValueOnce({
          rows: [{ fecha_creacion: fechaHaceUnMinuto, expiracion: new Date(Date.now() + 3600000), usado: false }]
        }); // SELECT ultimo token reciente

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email: 'carlos@sigi.gov.co' });

      expect(res.status).toBe(429);
      expect(res.body.cooldown).toBe(true);
      expect(mailer.enviarEmailRecuperacion).not.toHaveBeenCalled();
    });

    it('debería rechazar con 429 si se superan las 3 solicitudes en 15 minutos para el mismo correo', async () => {
      const email = 'spam_test@sigi.gov.co';
      const ahora = Date.now();
      // Registrar 3 solicitudes previas (hace 10, 8 y 5 min)
      gestorRecuperacion.solicitudesPorEmail.set(email, {
        timestamps: [ahora - 10 * 60 * 1000, ahora - 8 * 60 * 1000, ahora - 5 * 60 * 1000],
        ultimoEnvio: ahora - 3 * 60 * 1000 // Cooldown de 2 min ya pasó, pero límite de 3 solicitudes sigue activo
      });

      const res = await request(app)
        .post('/api/auth/recuperar-password')
        .send({ email });

      expect(res.status).toBe(429);
      expect(res.body.limiteExcedido).toBe(true);
      expect(res.body.mensaje).toContain('límite de 3 solicitudes');
      expect(mailer.enviarEmailRecuperacion).not.toHaveBeenCalled();
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

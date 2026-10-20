const request = require('supertest');
const gestorIps = require('../utils/gestorIps');

// Mock del módulo de base de datos
jest.mock('../db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}));

// Mock de logger y auditoría
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  registrarLogActividad: jest.fn().mockResolvedValue(true)
}));

let mockRol = 'superadmin';

// Mock de autenticación para pruebas de seguridad
jest.mock('../middleware/auth.middleware', () => ({
  verificarSesion: (req, res, next) => {
    req.session.usuario = 'SuperadminTest';
    req.session.idusuario = 1;
    req.session.rol = mockRol;
    req.session.estado = 'activo';
    next();
  },
  verificarRol: (...rolesPermitidos) => (req, res, next) => {
    if (rolesPermitidos.includes(mockRol) || mockRol === 'superadmin') {
      return next();
    }
    return res.status(403).json({ mensaje: 'Acceso denegado ⛔' });
  },
  verificarEstadoActivo: (req, res, next) => next()
}));

const app = require('../server');

describe('Gestor de Direcciones IP Bloqueadas (Unitario)', () => {
  beforeEach(() => {
    // Limpiar mapa de IPs antes de cada prueba
    gestorIps.ipsBloqueadas.clear();
    gestorIps.totalHistoricoBloqueos = 0;
    gestorIps.ultimoBloqueo = null;
  });

  test('registrarBloqueo almacena la IP con ventana de 15 minutos', () => {
    gestorIps.registrarBloqueo('190.14.22.5', 'Demasiados intentos fallidos');

    const activas = gestorIps.obtenerIpsActivas();
    expect(activas.length).toBe(1);
    expect(activas[0].ip).toBe('190.14.22.5');
    expect(activas[0].motivo).toContain('Demasiados intentos fallidos');
    expect(activas[0].segundos_restantes).toBeGreaterThan(800); // ~900s (15 min)
    expect(activas[0].segundos_restantes).toBeLessThanOrEqual(900);

    const stats = gestorIps.obtenerEstadisticas();
    expect(stats.activas).toBe(1);
    expect(stats.totalHistorico).toBe(1);
  });

  test('normalizarIp limpia prefijos IPv6 como ::ffff: y maneja ::1', () => {
    expect(gestorIps.normalizarIp('::ffff:192.168.1.50')).toBe('192.168.1.50');
    expect(gestorIps.normalizarIp('::1')).toBe('127.0.0.1');
    expect(gestorIps.normalizarIp('10.0.0.1')).toBe('10.0.0.1');
  });

  test('desbloquearIp remueve la IP de la lista de activas', () => {
    gestorIps.registrarBloqueo('200.50.10.2');
    expect(gestorIps.obtenerIpsActivas().length).toBe(1);

    const fueDesbloqueada = gestorIps.desbloquearIp('200.50.10.2');
    expect(fueDesbloqueada).toBe(true);
    expect(gestorIps.obtenerIpsActivas().length).toBe(0);
  });

  test('limpiarExpiradas retira automáticamente las IPs cuyo tiempo de 15 min expiró', () => {
    gestorIps.registrarBloqueo('192.168.10.99');
    
    // Simular que el tiempo expiró en el pasado
    const registro = gestorIps.ipsBloqueadas.get('192.168.10.99');
    registro.expira_en = Date.now() - 1000;

    const activas = gestorIps.obtenerIpsActivas();
    expect(activas.length).toBe(0);
  });
});

describe('Endpoints de Seguridad de Red (Integration / API)', () => {
  beforeEach(() => {
    mockRol = 'superadmin';
    gestorIps.ipsBloqueadas.clear();
    gestorIps.totalHistoricoBloqueos = 0;
  });

  test('GET /api/seguridad/ips-bloqueadas retorna lista y estadísticas para superadmin', async () => {
    gestorIps.registrarBloqueo('186.28.100.5', '5 intentos fallidos');

    const res = await request(app).get('/api/seguridad/ips-bloqueadas');
    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.ips.length).toBe(1);
    expect(res.body.ips[0].ip).toBe('186.28.100.5');
    expect(res.body.estadisticas.activas).toBe(1);
  });

  test('POST /api/seguridad/ips/:ip/desbloquear desbloquea la IP exitosamente', async () => {
    gestorIps.registrarBloqueo('186.28.100.5');

    const res = await request(app).post('/api/seguridad/ips/186.28.100.5/desbloquear');
    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.mensaje).toContain('desbloqueada exitosamente');
    expect(gestorIps.obtenerIpsActivas().length).toBe(0);
  });

  test('rechaza acceso con 403 a usuarios con rol admin o reportero', async () => {
    mockRol = 'admin';

    const resGet = await request(app).get('/api/seguridad/ips-bloqueadas');
    expect(resGet.status).toBe(403);

    const resPost = await request(app).post('/api/seguridad/ips/127.0.0.1/desbloquear');
    expect(resPost.status).toBe(403);
  });
});

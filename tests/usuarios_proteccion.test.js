// Mock del pool de base de datos para pruebas unitarias
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');
const UsuarioModel = require('../models/usuario.model');
const {
  cambiarEstadoUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarios.controller');

describe('Protección de Integridad y Disponibilidad de Superadmin', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  describe('UsuarioModel.contarSuperadminsActivos', () => {
    it('debería contar superadmins activos sin exclusión', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ total: 2 }] });
      const total = await UsuarioModel.contarSuperadminsActivos();
      expect(total).toBe(2);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT COUNT(*)::int AS total FROM usuario WHERE rol = 'superadmin' AND estado = 'activo'")
      );
    });

    it('debería contar superadmins activos excluyendo un ID específico', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ total: 1 }] });
      const total = await UsuarioModel.contarSuperadminsActivos(5);
      expect(total).toBe(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("idusuario != $1"),
        [5]
      );
    });
  });

  describe('cambiarEstadoUsuario', () => {
    it('debería rechazar si un superadmin intenta auto-inactivarse en su propia sesión', async () => {
      const req = {
        params: { id: '1' },
        body: { estado: 'inactivo' },
        session: { idusuario: 1, usuario: 'superadmin1', rol: 'superadmin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock de obtenerPorId para id 1
      pool.query.mockResolvedValueOnce({
        rows: [{ idusuario: 1, nombreusuario: 'superadmin1', rol: 'superadmin', estado: 'activo' }]
      });

      await cambiarEstadoUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.stringContaining('no puedes inactivar o bloquear tu propia cuenta de Superadmin')
        })
      );
    });

    it('debería rechazar si se intenta inactivar al único superadmin activo en el sistema', async () => {
      const req = {
        params: { id: '2' },
        body: { estado: 'bloqueado' },
        session: { idusuario: 1, usuario: 'superadmin1', rol: 'superadmin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // 1. obtenerPorId para usuario 2 (es superadmin)
      pool.query.mockResolvedValueOnce({
        rows: [{ idusuario: 2, nombreusuario: 'otro_superadmin', rol: 'superadmin', estado: 'activo' }]
      });
      // 2. contarSuperadminsActivos excluyendo al id 2 -> retorna 0
      pool.query.mockResolvedValueOnce({
        rows: [{ total: 0 }]
      });

      await cambiarEstadoUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.stringContaining('es el único Superadmin activo en el sistema')
        })
      );
    });

    it('debería permitir inactivar a un superadmin si existe otro superadmin activo', async () => {
      const req = {
        params: { id: '2' },
        body: { estado: 'inactivo' },
        session: { idusuario: 1, usuario: 'superadmin1', rol: 'superadmin' },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // 1. obtenerPorId para usuario 2
      pool.query.mockResolvedValueOnce({
        rows: [{ idusuario: 2, nombreusuario: 'otro_superadmin', rol: 'superadmin', estado: 'activo' }]
      });
      // 2. contarSuperadminsActivos excluyendo al id 2 -> retorna 1 (superadmin1 sigue activo)
      pool.query.mockResolvedValueOnce({
        rows: [{ total: 1 }]
      });
      // 3. cambiarEstado UPDATE
      pool.query.mockResolvedValueOnce({
        rows: [{ idusuario: 2, nombreusuario: 'otro_superadmin', estado: 'inactivo' }]
      });
      // 4. registrarLogActividad INSERT
      pool.query.mockResolvedValueOnce({ rows: [] });

      await cambiarEstadoUsuario(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.stringContaining('Estado cambiado a inactivo exitosamente')
        })
      );
    });
  });

  describe('eliminarUsuario', () => {
    it('debería rechazar si se intenta eliminar al único superadmin activo en el sistema', async () => {
      const req = {
        params: { id: '2' },
        session: { idusuario: 1, usuario: 'superadmin1', rol: 'superadmin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // 1. obtenerPorId para id 2
      pool.query.mockResolvedValueOnce({
        rows: [{ idusuario: 2, nombreusuario: 'superadmin2', rol: 'superadmin', estado: 'activo' }]
      });
      // 2. contarSuperadminsActivos excluyendo id 2 -> 0
      pool.query.mockResolvedValueOnce({
        rows: [{ total: 0 }]
      });

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.stringContaining('No es posible eliminar al único Superadmin activo del sistema')
        })
      );
    });
  });
});

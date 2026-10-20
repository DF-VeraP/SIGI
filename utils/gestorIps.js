/**
 * SIGI — Gestor de Direcciones IP Bloqueadas (Seguridad y Rate Limiting)
 * Registra bloqueos temporales por ataques de fuerza bruta, expiración automática (15 min)
 * y desbloqueo manual exclusivo para Superadmin.
 */

class GestorIpsBloqueadas {
  constructor() {
    this.ipsBloqueadas = new Map(); // ipNormalizada -> { ip, rawIp, fecha_bloqueo, expira_en, motivo, intentos }
    this.totalHistoricoBloqueos = 0;
    this.ultimoBloqueo = null;
    this.loginLimiter = null;
  }

  setLoginLimiter(limiter) {
    this.loginLimiter = limiter;
  }

  normalizarIp(ip) {
    if (!ip || typeof ip !== 'string') return '127.0.0.1';
    let clean = ip.trim();
    if (clean.startsWith('::ffff:')) {
      clean = clean.replace('::ffff:', '');
    }
    if (clean === '::1') {
      clean = '127.0.0.1';
    }
    return clean;
  }

  registrarBloqueo(rawIp, motivo = 'Exceso de intentos fallidos en inicio de sesión (5 intentos)') {
    const ipNorm = this.normalizarIp(rawIp);
    const ahora = Date.now();
    const duracionMs = 15 * 60 * 1000; // 15 minutos
    const expiraEn = ahora + duracionMs;

    const registroPrevio = this.ipsBloqueadas.get(ipNorm);
    const intentos = registroPrevio ? registroPrevio.intentos + 1 : 5;

    this.ipsBloqueadas.set(ipNorm, {
      ip: ipNorm,
      rawIp: rawIp,
      fecha_bloqueo: new Date(ahora).toISOString(),
      expira_en: expiraEn,
      motivo,
      intentos
    });

    this.totalHistoricoBloqueos++;
    this.ultimoBloqueo = new Date(ahora).toISOString();

    return {
      ip: ipNorm,
      rawIp,
      fecha_bloqueo: new Date(ahora).toISOString(),
      expira_en: new Date(expiraEn).toISOString(),
      segundos_restantes: Math.ceil(duracionMs / 1000),
      minutos_restantes: 15,
      motivo,
      intentos
    };
  }

  limpiarExpiradas() {
    const ahora = Date.now();
    for (const [ip, datos] of this.ipsBloqueadas.entries()) {
      if (datos.expira_en <= ahora) {
        this.ipsBloqueadas.delete(ip);
      }
    }
  }

  obtenerIpsActivas() {
    this.limpiarExpiradas();
    const ahora = Date.now();
    const lista = [];

    for (const datos of this.ipsBloqueadas.values()) {
      const segundosRestantes = Math.max(0, Math.ceil((datos.expira_en - ahora) / 1000));
      lista.push({
        ip: datos.ip,
        fecha_bloqueo: datos.fecha_bloqueo,
        expira_en: new Date(datos.expira_en).toISOString(),
        segundos_restantes: segundosRestantes,
        minutos_restantes: Math.ceil(segundosRestantes / 60),
        motivo: datos.motivo,
        intentos: datos.intentos
      });
    }

    lista.sort((a, b) => new Date(b.fecha_bloqueo) - new Date(a.fecha_bloqueo));
    return lista;
  }

  obtenerEstadisticas() {
    this.limpiarExpiradas();
    return {
      activas: this.ipsBloqueadas.size,
      totalHistorico: this.totalHistoricoBloqueos,
      ultimoBloqueo: this.ultimoBloqueo,
      ventanaMinutos: 15
    };
  }

  desbloquearIp(rawIp) {
    const ipNorm = this.normalizarIp(rawIp);
    const registro = this.ipsBloqueadas.get(ipNorm);

    if (this.loginLimiter && typeof this.loginLimiter.resetKey === 'function') {
      try {
        const clavesAResetear = new Set([
          ipNorm,
          '127.0.0.1',
          '::1',
          '::/56',
          '::ffff:127.0.0.1'
        ]);

        if (rawIp) {
          clavesAResetear.add(rawIp);
          clavesAResetear.add(rawIp.trim());
        }

        if (registro && registro.rawIp) {
          clavesAResetear.add(registro.rawIp);
          clavesAResetear.add(registro.rawIp.trim());
        }

        for (const clave of clavesAResetear) {
          try {
            this.loginLimiter.resetKey(clave);
          } catch (_) {
            // Ignorar clave individual si no está en el store
          }
        }
      } catch (err) {
        // En algunos stores o versiones de rate-limit
      }
    }

    const eliminado = this.ipsBloqueadas.delete(ipNorm);
    return eliminado;
  }
}

const gestorIps = new GestorIpsBloqueadas();
module.exports = gestorIps;

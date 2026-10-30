/**
 * SIGI — Gestor de Tiempos y Limitación de Recuperación de Contraseña
 * Controla el enfriamiento (cooldown) y el límite de solicitudes por correo institucional
 * para mitigar ataques de saturación de buzón (Email Bombing / DoS) y enumeración.
 */

class GestorRecuperacionPassword {
  constructor() {
    this.solicitudesPorEmail = new Map(); // emailNormalizado -> { timestamps: number[], ultimoEnvio: number }
    this.COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos (120 segundos) entre solicitudes
    this.VENTANA_MS = 15 * 60 * 1000; // Ventana de 15 minutos
    this.MAX_SOLICITUDES = 3; // Máximo 3 solicitudes por ventana
  }

  normalizarEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  }

  /**
   * Verifica si el correo se encuentra dentro del período de enfriamiento (cooldown)
   * o si ha superado el límite de 3 solicitudes en 15 minutos.
   */
  verificarLimite(email) {
    const emailNorm = this.normalizarEmail(email);
    if (!emailNorm) return { permitido: true };

    const ahora = Date.now();
    const datos = this.solicitudesPorEmail.get(emailNorm);

    if (!datos) {
      return { permitido: true };
    }

    // 1. Validar Cooldown (2 minutos entre envíos)
    if (datos.ultimoEnvio) {
      const tiempoTranscurrido = ahora - datos.ultimoEnvio;
      if (tiempoTranscurrido < this.COOLDOWN_MS) {
        const segundosRestantes = Math.ceil((this.COOLDOWN_MS - tiempoTranscurrido) / 1000);
        return {
          permitido: false,
          motivo: 'cooldown',
          segundosRestantes,
          minutosRestantes: Math.ceil(segundosRestantes / 60)
        };
      }
    }

    // 2. Validar Límite Máximo en Ventana (3 solicitudes en 15 minutos)
    const timestampsRecientes = (datos.timestamps || []).filter(ts => ahora - ts < this.VENTANA_MS);
    datos.timestamps = timestampsRecientes; // Limpieza activa

    if (timestampsRecientes.length >= this.MAX_SOLICITUDES) {
      const primerIntento = timestampsRecientes[0];
      const tiempoRestanteVentana = Math.max(0, this.VENTANA_MS - (ahora - primerIntento));
      const segundosRestantes = Math.ceil(tiempoRestanteVentana / 1000);
      return {
        permitido: false,
        motivo: 'limite_excedido',
        segundosRestantes,
        minutosRestantes: Math.max(1, Math.ceil(segundosRestantes / 60))
      };
    }

    return { permitido: true };
  }

  /**
   * Registra un nuevo envío de correo de recuperación para el email dado.
   */
  registrarEnvio(email, timestamp = Date.now()) {
    const emailNorm = this.normalizarEmail(email);
    if (!emailNorm) return;

    const ahora = timestamp;
    let datos = this.solicitudesPorEmail.get(emailNorm);

    if (!datos) {
      datos = { timestamps: [], ultimoEnvio: 0 };
      this.solicitudesPorEmail.set(emailNorm, datos);
    }

    datos.timestamps.push(ahora);
    datos.ultimoEnvio = ahora;

    // Mantener sólo timestamps dentro de la ventana
    datos.timestamps = datos.timestamps.filter(ts => ahora - ts < this.VENTANA_MS);
  }

  /**
   * Sincroniza el timestamp del último envío con el valor de la base de datos si es más reciente.
   */
  sincronizarUltimoEnvio(email, timestamp) {
    const emailNorm = this.normalizarEmail(email);
    if (!emailNorm || !timestamp) return;

    let datos = this.solicitudesPorEmail.get(emailNorm);
    if (!datos) {
      datos = { timestamps: [timestamp], ultimoEnvio: timestamp };
      this.solicitudesPorEmail.set(emailNorm, datos);
    } else {
      if (!datos.ultimoEnvio || timestamp > datos.ultimoEnvio) {
        datos.ultimoEnvio = timestamp;
      }
      if (!datos.timestamps.includes(timestamp)) {
        datos.timestamps.push(timestamp);
      }
    }
  }

  /**
   * Limpia registros inactivos con más de 30 minutos de antigüedad.
   */
  limpiarExpirados() {
    const ahora = Date.now();
    for (const [email, datos] of this.solicitudesPorEmail.entries()) {
      if (ahora - datos.ultimoEnvio > 30 * 60 * 1000) {
        this.solicitudesPorEmail.delete(email);
      }
    }
  }

  /**
   * Reinicia el gestor (para suites de pruebas Jest).
   */
  reset() {
    this.solicitudesPorEmail.clear();
  }
}

const gestorRecuperacion = new GestorRecuperacionPassword();

// Limpieza periódica cada 10 minutos
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    gestorRecuperacion.limpiarExpirados();
  }, 10 * 60 * 1000).unref();
}

module.exports = gestorRecuperacion;

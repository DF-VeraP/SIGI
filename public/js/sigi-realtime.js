/**
 * SIGI — Cliente de Actualización y Notificaciones en Tiempo Real (Socket.io)
 * Maneja la conexión con el servidor, reproduce avisos audibles/visuales y
 * dispara eventos DOM para actualizar capas de Leaflet y tablas sin recargar.
 */

(function () {
  if (typeof io === 'undefined') {
    // Si la librería de socket.io no está cargada aún, reintentar en 500ms
    setTimeout(iniciarSocketIO, 500);
    return;
  }
  iniciarSocketIO();

  function iniciarSocketIO() {
    if (typeof io === 'undefined') return;

    const socket = io({
      autoConnect: navigator.onLine,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 3000
    });

    window.addEventListener('offline', () => {
      try { socket.disconnect(); } catch (_) {}
    });

    window.addEventListener('online', () => {
      try { socket.connect(); } catch (_) {}
    });

    // Contenedor flotante de Toasts
    let toastContainer = document.getElementById('sigi-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'sigi-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: calc(48px + env(safe-area-inset-top, 0px) + 16px);
        right: 16px;
        z-index: 99999999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: min(380px, calc(100vw - 32px));
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    // Generador de sonido sutil de notificación con Web Audio API (sin archivos de audio externos)
    function reproducirTonoNotificacion() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {
        // Audio bloqueado por política de autoplay hasta el primer click
      }
    }

    function mostrarToast({ titulo, subtitulo, icon = '<i class="bi bi-broadcast"></i>', color = '#ef4444' }) {
      reproducirTonoNotificacion();

      const toast = document.createElement('div');
      toast.style.cssText = `
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 0.83rem;
        pointer-events: auto;
        transform: translateX(120%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
        border: 1px solid rgba(255,255,255,0.08);
      `;

      toast.innerHTML = `
        <div style="font-size: 1.1rem; line-height: 1; flex-shrink: 0; color: ${color}; margin-top: 1px;">${icon}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; color: #fff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titulo}</div>
          <div style="font-size: 0.77rem; color: #94a3b8; line-height: 1.35; max-height: 2.8em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word;">${subtitulo}</div>
        </div>
        <button type="button" aria-label="Cerrar notificación" style="all: unset; background: transparent; border: none; color: #94a3b8; font-size: 0.8rem; cursor: pointer; padding: 2px 4px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; transition: color 0.15s ease;"><i class="bi bi-x-lg"></i></button>
      `;

      const btnCerrar = toast.querySelector('button');
      btnCerrar.onclick = () => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
      };

      toastContainer.appendChild(toast);

      // Animar entrada
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });

      // Auto-eliminar en 6 segundos
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.transform = 'translateX(120%)';
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 350);
        }
      }, 6000);
    }

    // ── 1. Evento: Nuevo Incidente Registrado ──
    socket.on('nuevo_incidente', (incidente) => {
      // Disparar evento DOM para que admin.js o dashboard.js actúen siempre
      window.dispatchEvent(new CustomEvent('sigi:nuevo_incidente', { detail: incidente }));

      // Si existe función global de recargar o agregar punto en mapa
      if (typeof window.sigiRefrescarMapa === 'function') {
        window.sigiRefrescarMapa(incidente);
      }

      // Si el usuario en esta misma pestaña acaba de registrar este incidente,
      // no mostrar toast redundante con la descripción (ya vio "Incidente registrado")
      if (window._ultimoIncidenteCreadoCodigo && window._ultimoIncidenteCreadoCodigo === incidente.codigoincidente) {
        return;
      }

      // Preparar descripción resumida para que nunca invada la pantalla
      let descBreve = (incidente.descripcion || '').trim();
      if (descBreve.length > 55) {
        descBreve = descBreve.slice(0, 52) + '...';
      }
      const subtituloTexto = descBreve
        ? `${descBreve} — ${incidente.hora || 'Ahora'}`
        : `Radicado a las ${incidente.hora || 'Ahora'}`;

      mostrarToast({
        titulo: `Nuevo Reporte: ${incidente.codigoincidente || 'Incidente'}`,
        subtitulo: subtituloTexto,
        icon: '<i class="bi bi-broadcast"></i>',
        color: '#f87171'
      });
    });

    // ── 2. Evento: Incidente Actualizado o Resuelto ──
    socket.on('incidente_actualizado', (data) => {
      mostrarToast({
        titulo: `Incidente Actualizado`,
        subtitulo: `El incidente #${data.idincidente} cambió a: "${data.estadoNombre || 'Revisado'}"`,
        icon: '<i class="bi bi-arrow-repeat"></i>',
        color: '#60a5fa'
      });

      window.dispatchEvent(new CustomEvent('sigi:incidente_actualizado', { detail: data }));
    });

    // ── 3. Eventos de Seguridad IP (Bloqueo y Desbloqueo en Vivo) ──
    socket.on('ip_bloqueada', (data) => {
      window.dispatchEvent(new CustomEvent('sigi:ip_bloqueada', { detail: data }));
    });

    socket.on('ip_desbloqueada', (data) => {
      window.dispatchEvent(new CustomEvent('sigi:ip_desbloqueada', { detail: data }));
    });
  }
})();

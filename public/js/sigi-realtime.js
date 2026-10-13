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

    const socket = io();

    // Contenedor flotante de Toasts
    let toastContainer = document.getElementById('sigi-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'sigi-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 380px;
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

    function mostrarToast({ titulo, subtitulo, icon = '🚨', color = '#ef4444' }) {
      reproducirTonoNotificacion();

      const toast = document.createElement('div');
      toast.style.cssText = `
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        padding: 14px 18px;
        border-radius: 10px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 0.85rem;
        pointer-events: auto;
        transform: translateX(120%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
        border: 1px solid rgba(255,255,255,0.08);
      `;

      toast.innerHTML = `
        <div style="font-size: 1.4rem; line-height: 1;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">${titulo}</div>
          <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.3;">${subtitulo}</div>
        </div>
        <button style="background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: 0 0 0 8px;">&times;</button>
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
      mostrarToast({
        titulo: `Nuevo Reporte: ${incidente.codigoincidente || 'Incidente'}`,
        subtitulo: `${incidente.descripcion || 'Sin descripción'} — ${incidente.hora || 'Ahora'}`,
        icon: '🚨',
        color: '#ef4444'
      });

      // Disparar evento DOM para que admin.js o dashboard.js actúen
      window.dispatchEvent(new CustomEvent('sigi:nuevo_incidente', { detail: incidente }));

      // Si existe función global de recargar o agregar punto en mapa
      if (typeof window.sigiRefrescarMapa === 'function') {
        window.sigiRefrescarMapa(incidente);
      }
    });

    // ── 2. Evento: Incidente Actualizado o Resuelto ──
    socket.on('incidente_actualizado', (data) => {
      mostrarToast({
        titulo: `Incidente Actualizado`,
        subtitulo: `El incidente #${data.idincidente} cambió a: "${data.estadoNombre || 'Revisado'}"`,
        icon: '🔄',
        color: '#3b82f6'
      });

      window.dispatchEvent(new CustomEvent('sigi:incidente_actualizado', { detail: data }));
    });
  }
})();

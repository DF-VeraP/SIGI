/**
 * SIGI — PWA y Manejador de Almacenamiento y Sincronización Offline
 * Permite a los reporteros capturar incidentes en campo sin internet
 * y los sincroniza automáticamente con el servidor al recuperar conexión.
 */

(function () {
  const CLAVE_COLA_OFFLINE = 'sigi_cola_incidentes_offline';

  // 1. Registro del Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('SIGI Service Worker registrado con éxito:', reg.scope))
        .catch((err) => console.warn('Aviso: Service Worker no se pudo registrar:', err.message));
    });
  }

  // 2. Banner de Estado de Conexión en Interfaz
  let bannerConexion = null;

  function asegurarBannerConexion() {
    if (bannerConexion) return bannerConexion;

    bannerConexion = document.createElement('div');
    bannerConexion.id = 'sigi-pwa-network-badge';
    bannerConexion.style.cssText = `
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      padding: 8px 18px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: none;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(bannerConexion);
    return bannerConexion;
  }

  function actualizarIndicadorRed() {
    const badge = asegurarBannerConexion();
    const hayRed = navigator.onLine;

    if (!hayRed) {
      badge.style.background = '#dc2626';
      badge.style.color = '#ffffff';
      badge.innerHTML = `<span>📡</span> Modo sin conexión (Los reportes se guardarán en tu teléfono/PC)`;
      badge.style.display = 'flex';
    } else {
      const pendientes = obtenerColaOffline();
      if (pendientes.length > 0) {
        badge.style.background = '#d97706';
        badge.style.color = '#ffffff';
        badge.innerHTML = `<span>⏳</span> Sincronizando ${pendientes.length} reporte(s) pendiente(s)...`;
        badge.style.display = 'flex';
        sincronizarColaOffline();
      } else {
        badge.style.display = 'none';
      }
    }
  }

  window.addEventListener('online', () => {
    actualizarIndicadorRed();
    mostrarNotificacionPWA("🟢 Conexión restablecida", "Sincronizando reportes pendientes...", "#10b981");
  });

  window.addEventListener('offline', () => {
    actualizarIndicadorRed();
    mostrarNotificacionPWA("📡 Sin conexión a Internet", "Modo offline activo. Puedes seguir reportando normalmente.", "#f59e0b");
  });

  // 3. Gestión de la Cola Local (localStorage)
  function obtenerColaOffline() {
    try {
      const data = localStorage.getItem(CLAVE_COLA_OFFLINE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarEnColaOffline(reporte) {
    const cola = obtenerColaOffline();
    reporte._id_local = `OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    reporte._fecha_captura = new Date().toISOString();
    cola.push(reporte);
    localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
    actualizarIndicadorRed();
    return reporte;
  }

  function removerDeColaOffline(idLocal) {
    let cola = obtenerColaOffline();
    cola = cola.filter((r) => r._id_local !== idLocal);
    localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
    actualizarIndicadorRed();
  }

  // 4. Sincronización Automática con el Servidor
  async function sincronizarColaOffline() {
    const cola = obtenerColaOffline();
    if (cola.length === 0) return;

    let sincronizados = 0;

    for (const item of cola) {
      try {
        const formData = new FormData();
        Object.keys(item).forEach((key) => {
          if (!key.startsWith('_')) {
            formData.append(key, item[key]);
          }
        });

        const res = await fetch('/api/incidentes', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          removerDeColaOffline(item._id_local);
          sincronizados++;
        }
      } catch (err) {
        console.warn('Fallo al sincronizar ítem offline:', err.message);
        break; // Detener bucle si se volvió a perder la conexión
      }
    }

    if (sincronizados > 0) {
      mostrarNotificacionPWA(
        "✅ Sincronización Exitosa",
        `Se enviaron al servidor ${sincronizados} reporte(s) guardado(s) en campo.`,
        "#10b981"
      );
      // Recargar lista si existe en la página
      if (typeof window.cargarMisReportes === 'function') {
        window.cargarMisReportes();
      }
    }
  }

  function mostrarNotificacionPWA(titulo, mensaje, color = '#3b82f6') {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.85rem;
      max-width: 320px;
      animation: sigiFadeIn 0.3s ease;
    `;
    notif.innerHTML = `
      <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">${titulo}</div>
      <div style="font-size: 0.78rem; color: #cbd5e1;">${mensaje}</div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
  }

  // 5. Exponer API globalmente en window.SIGI_PWA
  window.SIGI_PWA = {
    guardarEnColaOffline,
    obtenerColaOffline,
    sincronizarColaOffline,
    estaEnLinea: () => navigator.onLine
  };

  // Inicializar estado de red al cargar
  window.addEventListener('DOMContentLoaded', () => {
    actualizarIndicadorRed();
  });
})();

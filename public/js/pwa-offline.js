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
  let bannerDescartadoOffline = sessionStorage.getItem('sigi_banner_offline_descartado') === '1';

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
      padding: 6px 12px 6px 16px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.81rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      display: none;
      align-items: center;
      gap: 10px;
      transition: all 0.25s ease;
      max-width: 92vw;
      box-sizing: border-box;
    `;
    document.body.appendChild(bannerConexion);
    return bannerConexion;
  }

  function actualizarIndicadorRed() {
    const badge = asegurarBannerConexion();
    const hayRed = navigator.onLine;

    if (!hayRed) {
      if (bannerDescartadoOffline) {
        badge.style.display = 'none';
        return;
      }
      badge.style.background = '#dc2626';
      badge.style.color = '#ffffff';
      badge.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <span>📡</span> Modo sin conexión (Los reportes se guardarán en tu teléfono/PC)
        </span>
        <button type="button" id="btnCerrarBannerRed" title="Cerrar aviso de sin conexión" aria-label="Cerrar aviso de sin conexión" style="
          background: rgba(255, 255, 255, 0.22);
          border: none;
          color: #ffffff;
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          transition: background 0.18s ease;
          padding: 0;
        ">&times;</button>
      `;
      badge.style.display = 'flex';

      const btnCerrar = badge.querySelector('#btnCerrarBannerRed');
      if (btnCerrar) {
        btnCerrar.onclick = (e) => {
          e.stopPropagation();
          bannerDescartadoOffline = true;
          sessionStorage.setItem('sigi_banner_offline_descartado', '1');
          badge.style.display = 'none';
        };
        btnCerrar.onmouseenter = () => { btnCerrar.style.background = 'rgba(255, 255, 255, 0.45)'; };
        btnCerrar.onmouseleave = () => { btnCerrar.style.background = 'rgba(255, 255, 255, 0.22)'; };
      }
    } else {
      bannerDescartadoOffline = false;
      sessionStorage.removeItem('sigi_banner_offline_descartado');
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
    if (typeof window.mostrarToastReportero === 'function') {
      window.mostrarToastReportero("🟢 Conexión restablecida. Sincronizando reportes pendientes...", "success", 4000);
    } else {
      mostrarNotificacionPWA("🟢 Conexión restablecida", "Sincronizando reportes pendientes con el servidor...", "#10b981");
    }
    sincronizarColaOffline();
  });

  window.addEventListener('offline', () => {
    actualizarIndicadorRed();
    if (typeof window.mostrarToastReportero === 'function') {
      window.mostrarToastReportero("📡 Sin conexión a internet. Los reportes se guardarán en tu dispositivo.", "warning", 4500);
    } else {
      mostrarNotificacionPWA("📡 Sin conexión a Internet", "Modo offline activo. Puedes seguir reportando y se guardarán en tu dispositivo.", "#f59e0b");
    }
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
    reporte._id_local = `OFF-${Date.now().toString().slice(-6)}`;
    reporte._fecha_captura = new Date().toISOString();
    cola.push(reporte);
    try {
      localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
    } catch (storageErr) {
      console.warn("Aviso al guardar reporte offline:", storageErr);
    }
    actualizarIndicadorRed();
    return reporte;
  }

  function removerDeColaOffline(idLocal) {
    let cola = obtenerColaOffline();
    cola = cola.filter((r) => r._id_local !== idLocal);
    localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
    actualizarIndicadorRed();
  }

  function base64ToBlob(dataURI) {
    if (!dataURI || typeof dataURI !== 'string' || !dataURI.includes(',')) return null;
    try {
      const parts = dataURI.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mime });
    } catch (e) {
      console.warn("No se pudo decodificar la imagen offline a Blob:", e);
      return null;
    }
  }

  // 4. Sincronización Automática con el Servidor
  let sincronizando = false;

  async function sincronizarColaOffline() {
    if (sincronizando) return;
    const cola = obtenerColaOffline();
    if (cola.length === 0) return;

    sincronizando = true;
    let sincronizados = 0;

    for (const item of cola) {
      try {
        const formData = new FormData();
        Object.keys(item).forEach((key) => {
          if (!key.startsWith('_') && key !== 'foto_base64' && key !== 'tipo_nombre') {
            formData.append(key, item[key]);
          }
        });

        if (item.foto_base64) {
          const blob = base64ToBlob(item.foto_base64);
          if (blob) {
            formData.append('foto', blob, 'evidencia_offline.jpg');
          }
        }

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

    sincronizando = false;

    if (sincronizados > 0) {
      const mensaje = `Se sincronizaron con éxito ${sincronizados} reporte(s) guardados en campo.`;
      if (typeof window.mostrarToastReportero === 'function') {
        window.mostrarToastReportero(`✅ ${mensaje}`, "success", 4500);
      } else {
        mostrarNotificacionPWA("✅ Sincronización Exitosa", mensaje, "#10b981");
      }
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
      border-left: 4px solid ${color};
      color: #f8fafc;
      padding: 12px 14px 12px 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.85rem;
      max-width: min(340px, calc(100vw - 32px));
      box-sizing: border-box;
      animation: sigiFadeIn 0.3s ease;
    `;
    notif.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">${titulo}</div>
          <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.35;">${mensaje}</div>
        </div>
        <button type="button" aria-label="Cerrar notificación" style="
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #ffffff;
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 13px;
          font-weight: bold;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 0.15s ease;
        ">&times;</button>
      </div>
    `;

    const btnCerrar = notif.querySelector('button');
    if (btnCerrar) {
      btnCerrar.onclick = () => notif.remove();
    }

    document.body.appendChild(notif);
    setTimeout(() => {
      if (notif.parentNode) notif.remove();
    }, 6000);
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

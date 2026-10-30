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

  // 2. Notificaciones de Estado de Red (Sin banners duplicados)
  let estadoPrevioOnline = navigator.onLine;

  window.addEventListener('online', () => {
    if (!estadoPrevioOnline) {
      estadoPrevioOnline = true;
      if (typeof window.mostrarToastReportero === 'function') {
        window.mostrarToastReportero("Conexión restablecida. Sincronizando reportes pendientes...", "success", 4000);
      } else {
        mostrarNotificacionPWA("Conexión restablecida", "Sincronizando reportes pendientes con el servidor...", "success");
      }
      sincronizarColaOffline();
    }
  });

  window.addEventListener('offline', () => {
    if (estadoPrevioOnline) {
      estadoPrevioOnline = false;
      if (typeof window.mostrarToastReportero === 'function') {
        window.mostrarToastReportero("Sin conexión a internet. Los reportes se guardarán en tu dispositivo.", "warning", 4500);
      } else {
        mostrarNotificacionPWA("Sin conexión a internet", "Modo offline activo. Los reportes se guardarán localmente.", "warning");
      }
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
    return reporte;
  }

  function removerDeColaOffline(idLocal) {
    let cola = obtenerColaOffline();
    cola = cola.filter((r) => r._id_local !== idLocal);
    localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
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
        window.mostrarToastReportero(mensaje, "success", 4500);
      } else {
        mostrarNotificacionPWA("Sincronización Exitosa", mensaje, "success");
      }
      // Recargar lista si existe en la página
      if (typeof window.cargarMisReportes === 'function') {
        window.cargarMisReportes();
      }
    }
  }

  function mostrarNotificacionPWA(titulo, mensaje, tipo = 'info') {
    let colorBorde = '#60a5fa';
    let iconoHtml = '<i class="bi bi-info-circle-fill"></i>';
    if (tipo === 'success') {
      colorBorde = '#34d399';
      iconoHtml = '<i class="bi bi-check-circle-fill"></i>';
    } else if (tipo === 'warning') {
      colorBorde = '#fbbf24';
      iconoHtml = '<i class="bi bi-exclamation-triangle-fill"></i>';
    } else if (tipo === 'error') {
      colorBorde = '#f87171';
      iconoHtml = '<i class="bi bi-x-circle-fill"></i>';
    }

    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 3px solid ${colorBorde};
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      font-family: inherit;
      font-size: 0.83rem;
      max-width: min(340px, calc(100vw - 32px));
      box-sizing: border-box;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: flex-start;
      gap: 10px;
    `;
    notif.innerHTML = `
      <span style="color: ${colorBorde}; font-size: 0.95rem; margin-top: 2px;">${iconoHtml}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; color: #fff; margin-bottom: 2px;">${titulo}</div>
        <div style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.35;">${mensaje}</div>
      </div>
      <button type="button" aria-label="Cerrar notificación" style="
        all: unset;
        background: transparent !important;
        border: none !important;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 0.85rem;
        line-height: 1;
        transition: color 0.15s ease;
      "><i class="bi bi-x-lg"></i></button>
    `;

    const btnCerrar = notif.querySelector('button');
    if (btnCerrar) {
      btnCerrar.onclick = () => notif.remove();
      btnCerrar.onmouseenter = () => { btnCerrar.style.color = '#ffffff'; };
      btnCerrar.onmouseleave = () => { btnCerrar.style.color = '#94a3b8'; };
    }

    document.body.appendChild(notif);
    setTimeout(() => {
      if (notif.parentNode) notif.remove();
    }, 5500);
  }

  // 5. Exponer API globalmente en window.SIGI_PWA
  window.SIGI_PWA = {
    guardarEnColaOffline,
    obtenerColaOffline,
    sincronizarColaOffline,
    estaEnLinea: () => navigator.onLine
  };
})();

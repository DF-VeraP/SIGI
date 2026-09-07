/**
 * SIGI — Control Automático de Sesión por Inactividad
 * Cierra la sesión tras 40 minutos sin interacción del usuario.
 */

(function () {
    const TIEMPO_INACTIVIDAD_MS = 40 * 60 * 1000; // 40 minutos
    const TIEMPO_ADVERTENCIA_MS = 38 * 60 * 1000; // 38 minutos (aviso a 2 minutos del cierre)
    
    let timerInactividad = null;
    let timerAdvertencia = null;
    let advertenciaMostrada = false;

    // Crear banner o modal sutil de advertencia
    function mostrarBannerAdvertencia() {
        if (advertenciaMostrada || document.getElementById('sigi-inactivity-banner')) return;
        advertenciaMostrada = true;

        const banner = document.createElement('div');
        banner.id = 'sigi-inactivity-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #f59e0b;
            color: #fef3c7;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 0.85rem;
            max-width: 360px;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: sigiFadeIn 0.3s ease;
        `;
        banner.innerHTML = `
            <div style="font-size: 1.4rem; color: #f59e0b;">⏳</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; margin-bottom: 2px; color: #f59e0b;">Aviso de Inactividad</div>
                <div style="font-size: 0.78rem; color: #cbd5e1;">Tu sesión se cerrará automáticamente en 2 minutos por inactividad. Mueve el mouse o pulsa una tecla para continuar.</div>
            </div>
            <button id="btnContinuarSesion" style="background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">Seguir conectado</button>
        `;
        document.body.appendChild(banner);

        const btn = document.getElementById('btnContinuarSesion');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                reiniciarTemporizador();
            });
        }
    }

    function ocultarBannerAdvertencia() {
        advertenciaMostrada = false;
        const banner = document.getElementById('sigi-inactivity-banner');
        if (banner) {
            banner.remove();
        }
    }

    function cerrarSesionPorInactividad() {
        console.warn('SIGI: Sesión cerrada automáticamente por alcanzar el límite de 40 minutos de inactividad.');
        window.location.href = '/logout?motivo=inactividad';
    }

    function reiniciarTemporizador() {
        ocultarBannerAdvertencia();
        clearTimeout(timerInactividad);
        clearTimeout(timerAdvertencia);

        // Disparar advertencia 2 minutos antes
        timerAdvertencia = setTimeout(mostrarBannerAdvertencia, TIEMPO_ADVERTENCIA_MS);

        // Cierre definitivo de sesión a los 40 minutos
        timerInactividad = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
    }

    // Escuchar interacciones del usuario con throttling
    let ultimoRegistro = 0;
    function registrarActividad() {
        const ahora = Date.now();
        // Solo refrescar como máximo una vez cada 5 segundos
        if (ahora - ultimoRegistro > 5000) {
            ultimoRegistro = ahora;
            reiniciarTemporizador();
        }
    }

    const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    EVENTOS.forEach(evento => {
        window.addEventListener(evento, registrarActividad, { passive: true });
    });

    // Iniciar temporizador al cargar el script
    reiniciarTemporizador();
})();

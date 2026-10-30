// LOGICA JAVASCRIPT DE LA INTERFAZ MÓVIL REPORTERO EN TERRENO - SIGI
let mapMini = null;
let markerMini = null;
let usuarioSesion = null;
let fotoComprimida = null;
let editFotoComprimida = null;

/**
 * Comprime y redimensiona una foto tomada por la cámara móvil directamente en el navegador.
 * Reduce fotos de 10-15 MB a ~250-400 KB en milisegundos, evitando timeouts y caídas de conexión.
 */
function comprimirImagen(file, maxWidth = 1280, maxHeight = 1280, quality = 0.75) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/') || file.size < 250 * 1024) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.onerror = () => resolve(file);
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => resolve(file);
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    const cleanName = (file.name || "foto.jpg").replace(/\.[^/.]+$/, ".jpg");
                    const compressedFile = new File([blob], cleanName, {
                        type: "image/jpeg",
                        lastModified: Date.now()
                    });
                    console.log(`Foto optimizada: ${(file.size / (1024 * 1024)).toFixed(2)} MB -> ${(compressedFile.size / 1024).toFixed(1)} KB`);
                    resolve(compressedFile);
                }, "image/jpeg", quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // 0. Toggle Tema Claro / Oscuro (Tipo iPhone) — Sincronizado con Admin y Dashboard
    const btnTemaReportero = document.getElementById("btnTemaReportero");
    const temaGuardado = localStorage.getItem("tema_sigi_reportero")
                      || localStorage.getItem("tema_sigi_admin")
                      || localStorage.getItem("tema_sigi_dashboard")
                      || "oscuro";

    function aplicarTema(tema) {
        const esClaro = tema === "claro";
        document.documentElement.classList.toggle("tema-claro", esClaro);
        document.body.classList.toggle("tema-claro", esClaro);
        localStorage.setItem("tema_sigi_reportero", tema);
        localStorage.setItem("tema_sigi_admin", tema);
        localStorage.setItem("tema_sigi_dashboard", tema);
        setTimeout(() => {
            if (mapMini) mapMini.invalidateSize();
        }, 150);
    }

    aplicarTema(temaGuardado);

    if (btnTemaReportero) {
        btnTemaReportero.addEventListener("click", function (e) {
            e.stopPropagation();
            document.documentElement.classList.toggle("tema-claro");
            document.body.classList.toggle("tema-claro");
            const esClaro = document.body.classList.contains("tema-claro");
            const nuevoTema = esClaro ? "claro" : "oscuro";
            localStorage.setItem("tema_sigi_reportero", nuevoTema);
            localStorage.setItem("tema_sigi_admin", nuevoTema);
            localStorage.setItem("tema_sigi_dashboard", nuevoTema);
            setTimeout(() => {
                if (mapMini) mapMini.invalidateSize();
            }, 150);
        });
    }

    // Responsiveness automático del mapa Leaflet al redimensionar ventana
    window.addEventListener("resize", () => {
        if (mapMini) {
            mapMini.invalidateSize();
        }
    });

    // 1. Verificar sesión de usuario
    await cargarSesion();


    // 2. Cargar catálogos (tipos, modalidades, etc.)
    await cargarCatalogos();

    // 2.1 Inicializar Asistente Predictivo de Inteligencia Artificial (SIGI ML)
    if (window.SigiMLAssistant) {
        new SigiMLAssistant({
            textareaId: 'descripcion',
            tipoSelectId: 'tipoIncidente',
            gravedadSelectId: 'gravedad',
            horaInputId: 'hora',
            chkPoliciaId: 'chkPolicia',
            chkAmbulanciaId: 'chkAmbulancia',
            chkBomberosId: 'chkBomberos'
        });
    }

    // 3. Inicializar Leaflet Mini Mapa
    initMiniMapa();

    // 4. Configurar fecha y hora actuales por defecto y botón "Ahora"
    function fijarFechaHoraActual() {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");

        const elFecha = document.getElementById("fecha");
        const elHora = document.getElementById("hora");
        const hoyStr = `${anio}-${mes}-${dia}`;
        const fechaMinStr = "2000-01-01";

        if (elFecha) {
            elFecha.min = fechaMinStr;
            elFecha.max = hoyStr;
            elFecha.value = hoyStr;
        }
        if (elHora) elHora.value = `${horas}:${minutos}`;

        const editFechaRep = document.getElementById("editFechaReporte");
        if (editFechaRep) {
            editFechaRep.min = fechaMinStr;
            editFechaRep.max = hoyStr;
        }
    }
    fijarFechaHoraActual();

    let ultimoToastAhora = 0;
    const COOLDOWN_TOAST_MS = 2500; // 2.5 segundos de protección anti-spam

    const btnAhoraRep = document.getElementById("btnAhoraReportero");
    if (btnAhoraRep) {
        btnAhoraRep.addEventListener("click", () => {
            fijarFechaHoraActual();
            const ahoraMs = Date.now();
            if (ahoraMs - ultimoToastAhora >= COOLDOWN_TOAST_MS) {
                ultimoToastAhora = ahoraMs;
                mostrarToastReportero("Fecha y hora actualizadas al momento actual", "info");
            }
        });
    }

    // 5. Configurar eventos de Pestañas
    setupTabs();

    // 6. Botón GPS de 1-clic
    document.getElementById("btnGps").addEventListener("click", obtenerGpsActual);

    // Eventos para captura y vista previa de foto
    const btnTomarFoto = document.getElementById("btnTomarFoto");
    const inputFoto = document.getElementById("fotoInput");
    const previewContainer = document.getElementById("previewContainer");
    const imgPreview = document.getElementById("imgPreview");
    const btnQuitarFoto = document.getElementById("btnQuitarFoto");

    if (btnTomarFoto && inputFoto) {
        btnTomarFoto.addEventListener("click", () => inputFoto.click());
        inputFoto.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (file) {
                const spanBtn = btnTomarFoto.querySelector("span");
                if (spanBtn) spanBtn.innerText = "Optimizando foto...";
                try {
                    fotoComprimida = await comprimirImagen(file);
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        imgPreview.src = evt.target.result;
                        previewContainer.style.display = "flex";
                    };
                    reader.readAsDataURL(fotoComprimida);
                } catch (optErr) {
                    console.warn("No se pudo comprimir la foto, usando original:", optErr);
                    fotoComprimida = file;
                    imgPreview.src = URL.createObjectURL(file);
                    previewContainer.style.display = "flex";
                } finally {
                    if (spanBtn) spanBtn.innerText = "Cambiar Foto Adjunta";
                }
            }
        });
    }

    if (imgPreview) {
        imgPreview.addEventListener("click", () => {
            if (imgPreview.src) {
                abrirVisorFoto(imgPreview.src, "Previsualización", "Foto adjunta para este reporte");
            }
        });
    }

    if (btnQuitarFoto) {
        btnQuitarFoto.addEventListener("click", () => {
            inputFoto.value = "";
            fotoComprimida = null;
            imgPreview.src = "";
            previewContainer.style.display = "none";
            const spanBtn = btnTomarFoto?.querySelector("span");
            if (spanBtn) spanBtn.innerText = "Adjuntar Foto de Evidencia";
        });
    }

    // Modal de confirmación de eliminación
    const btnCerrarEliminar = document.getElementById("btnCerrarModalEliminar");
    const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
    const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
    const modalEliminar = document.getElementById("modalConfirmarEliminar");

    if (btnCerrarEliminar) btnCerrarEliminar.addEventListener("click", cerrarModalEliminarReporte);
    if (btnCancelarEliminar) btnCancelarEliminar.addEventListener("click", cerrarModalEliminarReporte);
    if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener("click", ejecutarEliminacionReporte);
    if (modalEliminar) {
        modalEliminar.addEventListener("click", (e) => {
            if (e.target === modalEliminar) cerrarModalEliminarReporte();
        });
    }

    // 7. Evento Submit del Formulario
    document.getElementById("formReporte").addEventListener("submit", enviarReporte);

    // 8. Botón Cerrar Sesión
    document.getElementById("btnLogout").addEventListener("click", () => {
        window.location.href = "/logout";
    });

    // 9. Botón Actualizar Mis Reportes
    document.getElementById("btnRefreshReports").addEventListener("click", cargarMisReportes);

    // Cargar mis reportes por primera vez
    cargarMisReportes();
});

async function cargarSesion() {
    try {
        if (!navigator.onLine) {
            const cachedSesion = localStorage.getItem("sigi_cache_usuario");
            if (cachedSesion) {
                usuarioSesion = JSON.parse(cachedSesion);
                const badge = document.getElementById("userBadge");
                if (badge) {
                    badge.innerHTML = `<span>${usuarioSesion.usuario}</span> <small style="opacity:0.75; font-size:0.75rem; font-weight:500;">(${usuarioSesion.dependencia || usuarioSesion.rol}) [Offline]</small>`;
                }
                return;
            }
        }

        const res = await fetch("/usuario");
        if (res.status === 401) {
            localStorage.removeItem("sigi_cache_usuario");
            window.location.href = "/login/index.html";
            return;
        }
        if (!res.ok) throw new Error("Error obteniendo usuario");
        const data = await res.json();
        usuarioSesion = data;
        try { localStorage.setItem("sigi_cache_usuario", JSON.stringify(data)); } catch (_) {}
        const badge = document.getElementById("userBadge");
        if (badge) {
            badge.innerHTML = `<span>${data.usuario}</span> <small style="opacity:0.75; font-size:0.75rem; font-weight:500;">(${data.dependencia || data.rol})</small>`;
        }
    } catch (e) {
        const cachedSesion = localStorage.getItem("sigi_cache_usuario");
        if (cachedSesion) {
            usuarioSesion = JSON.parse(cachedSesion);
            const badge = document.getElementById("userBadge");
            if (badge) {
                badge.innerHTML = `<span>${usuarioSesion.usuario}</span> <small style="opacity:0.75; font-size:0.75rem; font-weight:500;">(${usuarioSesion.dependencia || usuarioSesion.rol}) [Offline]</small>`;
            }
            return;
        }
        console.error("Error verificando sesión:", e);
        if (navigator.onLine) {
            window.location.href = "/login/index.html";
        }
    }
}

async function cargarCatalogos() {
    let data = null;
    try {
        if (navigator.onLine) {
            const res = await fetch("/api/catalogos");
            if (res.ok) {
                data = await res.json();
                try { localStorage.setItem("sigi_cache_catalogos", JSON.stringify(data)); } catch (_) {}
            }
        }
    } catch (_) {}

    if (!data) {
        try {
            const cached = localStorage.getItem("sigi_cache_catalogos");
            if (cached) data = JSON.parse(cached);
        } catch (_) {}
    }

    if (data && data.tipos && data.modalidades) {
        // Llenar select de tipos de incidente
        const selectTipo = document.getElementById("tipoIncidente");
        selectTipo.innerHTML = '<option value="">Seleccione el Tipo de Incidente *</option>';
        data.tipos.forEach(t => {
            selectTipo.innerHTML += `<option value="${t.idtipoincidente}">${t.nametipoincidente} (${t.categoria_nombre || 'General'})</option>`;
        });

        // Llenar select de modalidades
        const selectMod = document.getElementById("modalidad");
        selectMod.innerHTML = '<option value="">Sin especificar</option>';
        data.modalidades.forEach(m => {
            selectMod.innerHTML += `<option value="${m.id_modalidad}">${m.nombre}</option>`;
        });
    } else if (navigator.onLine) {
        console.warn("No se pudieron cargar catálogos del servidor");
        showAlert("Error cargando categorías del sistema", "error");
    }
}

function initMiniMapa() {
    // Coordenadas del centro de Florencia, Caquetá — Colombia
    const latDef = 1.6144;
    const lngDef = -75.6062;

    document.getElementById("lat").value = latDef;
    document.getElementById("lng").value = lngDef;

    mapMini = L.map("mapaMini").setView([latDef, lngDef], 15);

    const capaSatelitalReportero = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri'
    });

    const capaOscuraReportero = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    });

    // Iniciar con la vista Satelital
    capaSatelitalReportero.addTo(mapMini);

    const baseMapsReportero = {
        "Satelital": capaSatelitalReportero,
        "Modo Oscuro": capaOscuraReportero
    };

    L.control.layers(baseMapsReportero, null, { position: 'topright' }).addTo(mapMini);

    markerMini = L.marker([latDef, lngDef], { draggable: true }).addTo(mapMini);

    markerMini.on("dragend", function (e) {
        const pos = e.target.getLatLng();
        actualizarCoordenadas(pos.lat, pos.lng);
    });

    mapMini.on("click", function (e) {
        markerMini.setLatLng(e.latlng);
        actualizarCoordenadas(e.latlng.lat, e.latlng.lng);
    });

    // Detectar barrio o vereda inicial
    consultarBarrioPorCoordenada(latDef, lngDef);
}

async function consultarBarrioPorCoordenada(lat, lng) {
    const elBarrio = document.getElementById("barrio");
    if (!elBarrio) return;

    if (!navigator.onLine) {
        elBarrio.value = "Coordenadas fijadas (Modo offline)";
        return;
    }

    elBarrio.value = "Detectando zona por polígono...";
    try {
        const res = await fetch(`/buscarBarrioPorCoordenada?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error("Error en consulta espacial");
        const data = await res.json();
        let texto = "Ubicación sin asignar (Fuera de polígono)";
        if (data.barrio && data.vereda) {
            texto = `${data.barrio} - ${data.vereda}`;
        } else if (data.barrio) {
            texto = data.barrio;
        } else if (data.vereda) {
            texto = data.vereda;
        }
        elBarrio.value = texto;
    } catch (err) {
        elBarrio.value = "Coordenadas fijadas";
    }
}

function actualizarCoordenadas(lat, lng) {
    document.getElementById("lat").value = parseFloat(lat).toFixed(6);
    document.getElementById("lng").value = parseFloat(lng).toFixed(6);
    const status = document.getElementById("gpsStatus");
    if (status) {
        status.innerText = `Fijado: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }
    consultarBarrioPorCoordenada(lat, lng);
}

function obtenerGpsActual() {
    const status = document.getElementById("gpsStatus");
    if (status) status.innerText = "Obteniendo señal GPS del dispositivo...";

    if (!navigator.geolocation) {
        if (status) status.innerText = "Tu navegador no soporta geolocalización GPS.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            actualizarCoordenadas(lat, lng);
            mapMini.setView([lat, lng], 17);
            markerMini.setLatLng([lat, lng]);
            if (status) status.innerText = `Ubicación GPS obtenida (Precisión: ±${Math.round(pos.coords.accuracy)}m)`;
        },
        (err) => {
            console.error(err);
            if (status) status.innerText = "No se pudo obtener la ubicación GPS automáticamente. Puedes pulsar en el mapa.";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function setupTabs() {
    const tabCrear = document.getElementById("tabCrear");
    const tabMis = document.getElementById("tabMisReportes");
    const tabPerfil = document.getElementById("tabPerfil");
    const secCrear = document.getElementById("secNuevoReporte");
    const secMis = document.getElementById("secMisReportes");
    const secPerfil = document.getElementById("secPerfil");
    const appContainer = document.querySelector(".app-container");
    const userBadge = document.getElementById("userBadge");

    function activarTab(tabActivo, secActiva) {
        [tabCrear, tabMis, tabPerfil].forEach(t => t?.classList.remove("active"));
        [secCrear, secMis, secPerfil].forEach(s => s?.classList.remove("active"));

        tabActivo?.classList.add("active");
        secActiva?.classList.add("active");

        if (tabActivo === tabCrear) {
            if (appContainer) {
                appContainer.classList.remove("view-mis-reportes");
                appContainer.classList.remove("view-perfil");
            }
            setTimeout(() => {
                if (mapMini) mapMini.invalidateSize();
            }, 200);
        } else if (tabActivo === tabMis) {
            if (appContainer) {
                appContainer.classList.add("view-mis-reportes");
                appContainer.classList.remove("view-perfil");
            }
            cargarMisReportes();
        } else if (tabActivo === tabPerfil) {
            if (appContainer) {
                appContainer.classList.add("view-perfil");
                appContainer.classList.remove("view-mis-reportes");
            }
            cargarDatosPerfil();
        }
    }

    tabCrear?.addEventListener("click", () => activarTab(tabCrear, secCrear));
    tabMis?.addEventListener("click", () => activarTab(tabMis, secMis));
    tabPerfil?.addEventListener("click", () => activarTab(tabPerfil, secPerfil));
    userBadge?.addEventListener("click", () => activarTab(tabPerfil, secPerfil));

    // Permitir desplazamiento suave de reportes si se gira la rueda del mouse sobre el header
    const secMisHeader = document.querySelector("#secMisReportes .section-header");
    const reportsListEl = document.getElementById("reportsList");
    if (secMisHeader && reportsListEl) {
        secMisHeader.addEventListener("wheel", (e) => {
            reportsListEl.scrollTop += e.deltaY;
        }, { passive: true });
    }
}

function validarFechaHora(fechaVal, horaVal) {
    if (!fechaVal) {
        return { invalido: true, mensaje: "Debe ingresar una fecha válida para el incidente." };
    }

    const regexFecha = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = String(fechaVal).trim().match(regexFecha);
    if (!match) {
        return { invalido: true, mensaje: "Formato de fecha inválido. Debe ser AAAA-MM-DD." };
    }

    const anio = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const dia = parseInt(match[3], 10);

    const anioMinimo = 2000;
    const ahora = new Date();
    const anioActual = ahora.getFullYear();

    if (anio < anioMinimo || anio > anioActual) {
        return { invalido: true, mensaje: `El año (${anio}) no es válido. Debe estar entre ${anioMinimo} y ${anioActual}.` };
    }

    if (mes < 1 || mes > 12) {
        return { invalido: true, mensaje: `El mes (${mes}) es inválido (debe ser entre 01 y 12).` };
    }

    const diasEnMes = new Date(anio, mes, 0).getDate();
    if (dia < 1 || dia > diasEnMes) {
        return { invalido: true, mensaje: `El día (${dia}) no es válido para el mes ${mes} (máximo ${diasEnMes} días).` };
    }

    const mesActualStr = String(ahora.getMonth() + 1).padStart(2, "0");
    const diaActualStr = String(ahora.getDate()).padStart(2, "0");
    const hoyStr = `${anioActual}-${mesActualStr}-${diaActualStr}`;

    if (fechaVal.trim() > hoyStr) {
        return { invalido: true, mensaje: "La fecha del incidente no puede ser futura." };
    }

    if (horaVal) {
        const regexHora = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
        if (!regexHora.test(horaVal.trim())) {
            return { invalido: true, mensaje: "Formato de hora inválido. Ingrese HH:MM (00:00 a 23:59)." };
        }

        if (fechaVal.trim() === hoyStr) {
            const [horas, minutos] = horaVal.split(":").map(Number);
            const horaActual = ahora.getHours();
            const minActual = ahora.getMinutes();

            if (horas > horaActual || (horas === horaActual && minutos > minActual)) {
                return { invalido: true, mensaje: "Si la fecha es hoy, la hora no puede ser mayor a la hora actual." };
            }
        }
    }

    return { invalido: false };
}

async function blobABase64(blob) {
    if (!blob) return null;
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}

function limpiarFormularioReporte() {
    const form = document.getElementById("formReporte");
    if (form) form.reset();
    fotoComprimida = null;
    const prevCont = document.getElementById("previewContainer");
    if (prevCont) prevCont.style.display = "none";
    const imgPrev = document.getElementById("imgPreview");
    if (imgPrev) imgPrev.src = "";
    const mlCard = document.getElementById("mlAssistantContainer");
    if (mlCard) mlCard.style.display = "none";
    const spanBtn = document.getElementById("btnTomarFoto")?.querySelector("span");
    if (spanBtn) spanBtn.innerText = "Adjuntar Foto de Evidencia";

    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];
    const horaStr = ahora.toTimeString().split(' ')[0].slice(0, 5);
    const elFecha = document.getElementById("fecha");
    const elHora = document.getElementById("hora");
    if (elFecha) elFecha.value = hoyStr;
    if (elHora) elHora.value = horaStr;
}

async function enviarReporte(e) {
    e.preventDefault();

    const fechaVal = document.getElementById("fecha").value;
    const horaVal = document.getElementById("hora").value;

    const valTiempo = validarFechaHora(fechaVal, horaVal);
    if (valTiempo.invalido) {
        showAlert(valTiempo.mensaje, "error");
        return;
    }

    const tipoSelect = document.getElementById("tipoIncidente");
    const tipoVal = tipoSelect?.value || "";
    const tipoNombre = tipoSelect?.options[tipoSelect.selectedIndex]?.text?.split('(')[0]?.trim() || "Incidente";

    // ── FLUJO DIRECTO SIN CONEXIÓN (OFFLINE) ──
    if (!navigator.onLine) {
        if (window.SIGI_PWA) {
            let fotoBase64 = null;
            if (fotoComprimida) {
                try { fotoBase64 = await blobABase64(fotoComprimida); } catch (_) {}
            }
            const offlinePayload = {
                tipo: tipoVal,
                tipo_nombre: tipoNombre,
                fecha: fechaVal,
                hora: horaVal,
                lat: document.getElementById("lat").value,
                lng: document.getElementById("lng").value,
                id_gravedad: document.getElementById("gravedad").value,
                id_modalidad: document.getElementById("modalidad")?.value || "",
                direccion: document.getElementById("direccion").value,
                descripcion: document.getElementById("descripcion").value,
                barrio: document.getElementById("barrio")?.value || "",
                requiere_policia: document.getElementById("chkPolicia")?.checked ?? false,
                requiere_ambulancia: document.getElementById("chkAmbulancia")?.checked ?? false,
                requiere_bomberos: document.getElementById("chkBomberos")?.checked ?? false,
                foto_base64: fotoBase64
            };
            window.SIGI_PWA.guardarEnColaOffline(offlinePayload);
            showAlert("📡 Modo sin conexión: Reporte guardado localmente en tu equipo. Se sincronizará automáticamente al detectar internet.", "warning", 4500);
            limpiarFormularioReporte();
            cargarMisReportes();
            document.getElementById("tabMisReportes")?.click();
            return;
        }
    }

    const btnSubmit = document.getElementById("btnSubmit");
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `Registrando reporte...`;

    const formData = new FormData();
    formData.append("tipo", tipoVal);
    formData.append("fecha", fechaVal);
    formData.append("hora", horaVal);
    formData.append("lat", document.getElementById("lat").value);
    formData.append("lng", document.getElementById("lng").value);
    formData.append("id_gravedad", document.getElementById("gravedad").value);
    if (document.getElementById("modalidad").value) {
        formData.append("id_modalidad", document.getElementById("modalidad").value);
    }
    formData.append("direccion", document.getElementById("direccion").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("barrio", document.getElementById("barrio")?.value || "");
    formData.append("requiere_policia", document.getElementById("chkPolicia")?.checked ?? false);
    formData.append("requiere_ambulancia", document.getElementById("chkAmbulancia")?.checked ?? false);
    formData.append("requiere_bomberos", document.getElementById("chkBomberos")?.checked ?? false);

    if (fotoComprimida) {
        formData.append("foto", fotoComprimida);
    } else {
        const inputFoto = document.getElementById("fotoInput");
        if (inputFoto && inputFoto.files && inputFoto.files[0]) {
            formData.append("foto", inputFoto.files[0]);
        }
    }

    try {
        const res = await fetch("/api/incidentes", {
            method: "POST",
            body: formData
        });

        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            data = { mensaje: `Respuesta inesperada del servidor (Código ${res.status})` };
        }

        if (res.ok) {
            showAlert(`${data.mensaje} (Código: ${data.incidente.codigoincidente})`, "success");
            limpiarFormularioReporte();
            cargarMisReportes();
            document.getElementById("tabMisReportes")?.click();
        } else {
            showAlert(`${data.mensaje || "Error registrando reporte"}`, "error");
        }

    } catch (err) {
        if (window.SIGI_PWA) {
            let fotoBase64 = null;
            if (fotoComprimida) {
                try { fotoBase64 = await blobABase64(fotoComprimida); } catch (_) {}
            }
            const offlinePayload = {
                tipo: tipoVal,
                tipo_nombre: tipoNombre,
                fecha: fechaVal,
                hora: horaVal,
                lat: document.getElementById("lat").value,
                lng: document.getElementById("lng").value,
                id_gravedad: document.getElementById("gravedad").value,
                id_modalidad: document.getElementById("modalidad")?.value || "",
                direccion: document.getElementById("direccion").value,
                descripcion: document.getElementById("descripcion").value,
                barrio: document.getElementById("barrio")?.value || "",
                requiere_policia: document.getElementById("chkPolicia")?.checked ?? false,
                requiere_ambulancia: document.getElementById("chkAmbulancia")?.checked ?? false,
                requiere_bomberos: document.getElementById("chkBomberos")?.checked ?? false,
                foto_base64: fotoBase64
            };
            window.SIGI_PWA.guardarEnColaOffline(offlinePayload);
            showAlert("📡 Conexión perdida: Reporte guardado en cola local. Se subirá automáticamente cuando vuelva el internet.", "warning", 4500);
            limpiarFormularioReporte();
            cargarMisReportes();
            document.getElementById("tabMisReportes")?.click();
            return;
        }
        showAlert("Error de conexión al registrar el incidente", "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `Registrar Incidente`;
    }
}

function normalizarUrlImagen(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:image')) {
        return trimmed;
    }
    return `/uploads/incidentes/${trimmed}`;
}

async function cargarMisReportes() {
    const list = document.getElementById("reportsList");
    if (!list) return;

    list.innerHTML = '<div class="loading-spinner">Cargando mis reportes...</div>';

    // 1. Obtener reportes en cola offline local
    const colaOffline = window.SIGI_PWA ? window.SIGI_PWA.obtenerColaOffline() : [];
    let reportesServidor = [];

    // 2. Obtener reportes del servidor si hay conexión
    if (navigator.onLine) {
        try {
            const res = await fetch("/api/incidentes/mis-reportes");
            if (res.ok) {
                reportesServidor = await res.json();
                try {
                    localStorage.setItem("sigi_cache_mis_reportes", JSON.stringify(reportesServidor));
                } catch (_) {}
            } else {
                throw new Error("Respuesta no exitosa del servidor");
            }
        } catch (err) {
            // Fallback a caché si falló la red
            try {
                const cached = localStorage.getItem("sigi_cache_mis_reportes");
                if (cached) reportesServidor = JSON.parse(cached);
            } catch (_) {}
        }
    } else {
        // Sin conexión: cargar directamente de caché
        try {
            const cached = localStorage.getItem("sigi_cache_mis_reportes");
            if (cached) reportesServidor = JSON.parse(cached);
        } catch (_) {}
    }

    const totalReportes = colaOffline.length + reportesServidor.length;
    const countEl = document.getElementById("countReportes");
    if (countEl) countEl.innerText = totalReportes;

    if (totalReportes === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 24px;">No has registrado ningún reporte aún.</div>';
        return;
    }

    list.innerHTML = "";

    // Si estamos sin conexión, mostrar banner informativo superior
    if (!navigator.onLine) {
        const notice = document.createElement("div");
        notice.className = "offline-list-notice";
        notice.innerHTML = `<span>📡 <b>Modo sin conexión:</b> Mostrando ${colaOffline.length} reporte(s) en espera de sincronización y ${reportesServidor.length} en caché local.</span>`;
        list.appendChild(notice);
    }

    // ── RENDERIZAR PRIMERO LOS REPORTES EN COLA OFFLINE ──
    colaOffline.forEach(r => {
        const fechaFmt = r.fecha || new Date(r._fecha_captura).toLocaleDateString('es-ES');
        const horaFmt = r.hora ? r.hora.slice(0, 5) : '';
        const codigo = r._id_local || 'OFF-PENDIENTE';
        const tipoNombre = r.tipo_nombre || `Tipo #${r.tipo}`;
        const tieneFoto = Boolean(r.foto_base64);
        const urlFoto = r.foto_base64 || '';
        const safeDesc = (r.descripcion || '').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');

        const htmlFoto = tieneFoto
            ? `<div class="report-foto-thumb-wrap" style="margin-top: 8px;">
                   <img src="${urlFoto}"
                        class="report-foto-thumb"
                        alt="Evidencia en cola"
                        title="Haz clic para ver la imagen completa"
                        loading="lazy">
               </div>`
            : '';

        const card = document.createElement("div");
        card.className = "report-card";
        card.style.borderLeft = "4px solid #f59e0b";
        card.innerHTML = `
            <div class="report-card-head">
                <span class="report-code" style="color: #f59e0b;">${codigo}</span>
                <span class="badge-status" style="background-color: #d97706; color: #fff;">
                    ⏳ En cola (Offline)
                </span>
            </div>
            <div class="report-type">${tipoNombre}</div>
            <div class="report-desc">${r.descripcion || '<em style="opacity:0.5">Sin descripción</em>'}</div>
            ${htmlFoto}
            <div class="report-meta" style="margin-top: 8px;">
                <span>${fechaFmt} ${horaFmt}</span>
                <span>${r.barrio || 'Coordenadas fijadas'}</span>
            </div>
            <div class="report-actions-locked" style="color: #f59e0b; font-size: 0.74rem; font-weight: 600;">
                Guardado en este equipo. Se sincronizará automáticamente al detectar internet.
            </div>
        `;

        if (tieneFoto) {
            const thumbWrap = card.querySelector(".report-foto-thumb-wrap");
            if (thumbWrap) {
                thumbWrap.addEventListener("click", (e) => {
                    e.stopPropagation();
                    abrirVisorFoto(urlFoto, codigo, tipoNombre, r.descripcion || '');
                });
            }
        }

        list.appendChild(card);
    });

    // ── RENDERIZAR REPORTES DEL SERVIDOR / CACHÉ ──
    reportesServidor.forEach(r => {
        const fechaFmt = new Date(r.fechaincidente).toLocaleDateString('es-ES');
        const colorEstado = r.estado_color || '#6c757d';
        const urlFoto = normalizarUrlImagen(r.imagen_url);
        const tieneFoto = Boolean(urlFoto);
        const codigo = r.codigoincidente || ('INC-' + r.idincidente);
        const tipoNombre = r.tipo_nombre || 'Incidente general';
        const safeImg = urlFoto.replace(/'/g, "\\'");
        const safeCodigo = codigo.replace(/'/g, "\\'");
        const safeDesc = (r.descripcionincidente || '').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');

        const htmlFoto = tieneFoto
            ? `<div class="report-foto-thumb-wrap" style="margin-top: 8px;">
                   <img src="${urlFoto}"
                        class="report-foto-thumb"
                        alt="Evidencia de ${codigo}"
                        title="Haz clic para ver la imagen completa"
                        loading="lazy"
                        onerror="this.onerror=null; this.closest('.report-foto-thumb-wrap').style.display='none';">
               </div>`
            : '';

        // Botones de acción: solo si el reporte está en estado "Reportado" (id_estado = 1) y hay red
        const esPendiente = r.id_estado === 1;
        const htmlAcciones = esPendiente
            ? `<div class="report-actions">
                   <button type="button" class="btn-report-edit" onclick="event.stopPropagation(); abrirModalEditarReporte(${r.idincidente}, '${r.fechaincidente?.split('T')[0]}', '${r.horaincidente?.slice(0,5)}', ${r.id_gravedad || 3}, '${(r.direccion||'').replace(/'/g,"\\'")}', '${safeDesc}', '${safeImg}')">
                       Editar
                   </button>
                   <button type="button" class="btn-report-delete" onclick="event.stopPropagation(); confirmarEliminarReporte(${r.idincidente}, '${safeCodigo}')">
                       Eliminar
                   </button>
               </div>`
            : `<div class="report-actions-locked">En revisión — no editable</div>`;

        const card = document.createElement("div");
        card.className = "report-card";
        card.innerHTML = `
            <div class="report-card-head">
                <span class="report-code">${codigo}</span>
                <span class="badge-status" style="background-color: ${colorEstado}">
                    ${r.estado_nombre || 'Reportado'}
                </span>
            </div>
            <div class="report-type">${tipoNombre}</div>
            <div class="report-desc">${r.descripcionincidente || '<em style="opacity:0.5">Sin descripción</em>'}</div>
            ${htmlFoto}
            <div class="report-meta" style="margin-top: 8px;">
                <span>${fechaFmt} ${(r.horaincidente || '').slice(0, 5)}</span>
                <span>${r.barrio_nombre || r.vereda_nombre || 'Sin Zona'}</span>
            </div>
            ${htmlAcciones}
        `;

        if (tieneFoto) {
            const thumbWrap = card.querySelector(".report-foto-thumb-wrap");
            if (thumbWrap) {
                thumbWrap.addEventListener("click", (e) => {
                    e.stopPropagation();
                    abrirVisorFoto(urlFoto, codigo, tipoNombre, r.descripcionincidente || '');
                });
            }
        }

        list.appendChild(card);
    });
}

let timerAlerta = null;

function mostrarToastReportero(mensaje, tipo = "info", duracion = 3200) {
    showAlert(mensaje, tipo, duracion);
}

function showAlert(mensaje, tipo = "success", duracion = 3200) {
    const cont = document.getElementById("alertContainer");
    if (!cont) return;

    if (timerAlerta) {
        clearTimeout(timerAlerta);
        timerAlerta = null;
    }

    cont.innerHTML = `
        <div class="alert-box alert-${tipo}">
            <span class="alert-texto">${mensaje}</span>
            <button type="button" class="btn-cerrar-alert" title="Cerrar aviso" aria-label="Cerrar">&times;</button>
        </div>
    `;

    const btnCerrar = cont.querySelector(".btn-cerrar-alert");
    if (btnCerrar) {
        btnCerrar.onclick = () => {
            if (timerAlerta) clearTimeout(timerAlerta);
            timerAlerta = null;
            cont.innerHTML = "";
        };
    }

    timerAlerta = setTimeout(() => {
        const box = cont.querySelector(".alert-box");
        if (box) {
            box.style.opacity = "0";
            box.style.transform = "translateY(-6px)";
            box.style.transition = "opacity 0.22s ease, transform 0.22s ease";
            setTimeout(() => {
                cont.innerHTML = "";
            }, 220);
        } else {
            cont.innerHTML = "";
        }
    }, duracion);
}

/* ═══════════════════════════════════════════
   MODAL EDITAR REPORTE
   ═══════════════════════════════════════════ */
function abrirModalEditarReporte(id, fecha, hora, gravedad, direccion, descripcion, imagenUrl) {
    document.getElementById("editReporteId").value      = id;
    document.getElementById("editFechaReporte").value   = fecha || '';
    document.getElementById("editHoraReporte").value    = hora || '';
    document.getElementById("editGravedadReporte").value = gravedad || 3;
    document.getElementById("editDireccionReporte").value = direccion || '';
    document.getElementById("editDescripcionReporte").value = descripcion || '';

    // Limpiar estado de nueva foto
    editFotoComprimida = null;
    const inputFoto = document.getElementById("editFotoInput");
    if (inputFoto) inputFoto.value = "";
    const containerNueva = document.getElementById("editFotoNuevaContainer");
    if (containerNueva) containerNueva.style.display = "none";
    const imgNueva = document.getElementById("editImgNuevaPreview");
    if (imgNueva) imgNueva.src = "";

    // Foto actual (si tiene imagen registrada en Cloudinary o disco)
    const containerActual = document.getElementById("editFotoActualContainer");
    const imgActual = document.getElementById("editImgActual");
    if (imagenUrl && imagenUrl.trim() !== '') {
        const safeEditUrl = normalizarUrlImagen(imagenUrl);
        imgActual.onerror = () => {
            imgActual.onerror = null;
            containerActual.style.display = "none";
        };
        imgActual.src = safeEditUrl;
        containerActual.style.display = "block";
    } else {
        containerActual.style.display = "none";
        imgActual.src = "";
    }

    document.getElementById("modalEditarReporte").style.display = 'flex';
}

function cerrarModalEditarReporte() {
    document.getElementById("modalEditarReporte").style.display = 'none';
    editFotoComprimida = null;
    const inputFoto = document.getElementById("editFotoInput");
    if (inputFoto) inputFoto.value = "";
    const containerNueva = document.getElementById("editFotoNuevaContainer");
    if (containerNueva) containerNueva.style.display = "none";
}

async function guardarEdicionReporte() {
    const id      = document.getElementById("editReporteId").value;
    const btnSave = document.getElementById("btnGuardarEditar");

    if (!id) return;

    btnSave.disabled = true;
    btnSave.innerHTML = 'Guardando...';

    const formData = new FormData();
    const fecha = document.getElementById("editFechaReporte").value;
    const hora = document.getElementById("editHoraReporte").value;

    if (fecha || hora) {
        const valEdit = validarFechaHora(fecha, hora);
        if (valEdit.invalido) {
            mostrarToastReportero(valEdit.mensaje, "error");
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="bi bi-check2"></i> Guardar Cambios';
            return;
        }
    }

    const gravedad = document.getElementById("editGravedadReporte").value;
    const direccion = document.getElementById("editDireccionReporte").value;
    const descripcion = document.getElementById("editDescripcionReporte").value;

    if (fecha) formData.append("fechaincidente", fecha);
    if (hora) formData.append("horaincidente", hora);
    if (gravedad) formData.append("id_gravedad", gravedad);
    if (direccion) formData.append("direccion", direccion);
    formData.append("descripcionincidente", descripcion || "");

    // Si seleccionó una nueva foto, adjuntarla para reemplazo
    if (editFotoComprimida) {
        formData.append("foto", editFotoComprimida);
    } else {
        const inputFoto = document.getElementById("editFotoInput");
        if (inputFoto && inputFoto.files && inputFoto.files[0]) {
            formData.append("foto", inputFoto.files[0]);
        }
    }

    try {
        const res = await fetch(`/api/incidentes/${id}`, {
            method: 'PUT',
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            cerrarModalEditarReporte();
            showAlert('Reporte actualizado correctamente', 'success');
            cargarMisReportes();
        } else {
            showAlert(`${data.mensaje || 'Error al actualizar'}`, 'error');
        }
    } catch (err) {
        console.error('Error editando reporte:', err);
        showAlert('Error de conexión', 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = 'Guardar Cambios';
    }
}

let idReporteAEliminar = null;

function confirmarEliminarReporte(id, codigo) {
    idReporteAEliminar = id;
    const modal = document.getElementById("modalConfirmarEliminar");
    const codSpan = document.getElementById("codigoReporteEliminar");
    if (codSpan) codSpan.innerText = codigo || `INC-${id}`;
    if (modal) modal.style.display = "flex";
}

function cerrarModalEliminarReporte() {
    idReporteAEliminar = null;
    const modal = document.getElementById("modalConfirmarEliminar");
    if (modal) modal.style.display = "none";
}

async function ejecutarEliminacionReporte() {
    if (!idReporteAEliminar) return;
    const btn = document.getElementById("btnConfirmarEliminar");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Eliminando...";
    }

    try {
        const res = await fetch(`/api/incidentes/${idReporteAEliminar}`, { method: 'DELETE' });
        let data = {};
        try {
            data = await res.json();
        } catch (_) {}

        if (res.ok) {
            cerrarModalEliminarReporte();
            showAlert('Reporte eliminado correctamente', 'success');
            cargarMisReportes();
        } else {
            showAlert(`${data.mensaje || 'No se pudo eliminar'}`, 'error');
        }
    } catch (err) {
        console.error('Error eliminando reporte:', err);
        showAlert('Error de conexión', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-trash3"></i> Eliminar Reporte';
        }
        cerrarModalEliminarReporte();
    }
}

// Eventos del modal al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const btnCerrar    = document.getElementById('btnCerrarModalEditar');
    const btnCancelar  = document.getElementById('btnCancelarEditar');
    const btnGuardar   = document.getElementById('btnGuardarEditar');
    const overlay      = document.getElementById('modalEditarReporte');

    if (btnCerrar)   btnCerrar.addEventListener('click', cerrarModalEditarReporte);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModalEditarReporte);
    if (btnGuardar)  btnGuardar.addEventListener('click', guardarEdicionReporte);

    // Cerrar al hacer clic fuera de la tarjeta
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModalEditarReporte();
        });
    }

    // Manejo de la selección de foto para reemplazo en edición
    const btnEditFoto = document.getElementById('btnEditCambiarFoto');
    const editFotoInput = document.getElementById('editFotoInput');
    const editFotoNuevaContainer = document.getElementById('editFotoNuevaContainer');
    const editImgNuevaPreview = document.getElementById('editImgNuevaPreview');
    const btnEditQuitarNuevaFoto = document.getElementById('btnEditQuitarNuevaFoto');

    if (btnEditFoto && editFotoInput) {
        btnEditFoto.addEventListener('click', () => editFotoInput.click());
        editFotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    editFotoComprimida = await comprimirImagen(file);
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        editImgNuevaPreview.src = evt.target.result;
                        editFotoNuevaContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(editFotoComprimida);
                } catch (optErr) {
                    console.warn("No se pudo comprimir la foto nueva, usando original:", optErr);
                    editFotoComprimida = file;
                    editImgNuevaPreview.src = URL.createObjectURL(file);
                    editFotoNuevaContainer.style.display = 'block';
                }
            }
        });
    }

    if (btnEditQuitarNuevaFoto && editFotoInput) {
        btnEditQuitarNuevaFoto.addEventListener('click', () => {
            editFotoInput.value = '';
            editFotoComprimida = null;
            editImgNuevaPreview.src = '';
            editFotoNuevaContainer.style.display = 'none';
        });
    }
});

/* ═══════════════════════════════════════════
   MODAL VISOR DE FOTOGRAFÍA COMPLETA
   ═══════════════════════════════════════════ */
function abrirVisorFoto(url, codigo = '', tipo = '', descripcion = '') {
    const modal = document.getElementById("modalVisorFoto");
    const img = document.getElementById("imgVisorFoto");
    const titulo = document.getElementById("tituloVisorFoto");
    const subtitulo = document.getElementById("subtituloVisorFoto");
    const footer = document.getElementById("footerVisorFoto");
    const desc = document.getElementById("descVisorFoto");

    if (!modal || !img) return;

    const safeUrl = normalizarUrlImagen(url);
    if (!safeUrl) return;

    img.onerror = () => {
        img.onerror = null;
        img.src = '/uploads/incidentes/placeholder.svg';
    };
    img.src = safeUrl;
    if (titulo) titulo.innerText = codigo ? `Evidencia: ${codigo}` : "Evidencia Fotográfica";
    if (subtitulo) subtitulo.innerText = tipo ? `Tipo: ${tipo}` : "";
    if (desc) {
        if (descripcion && descripcion.trim() !== '') {
            desc.innerText = descripcion;
            if (footer) footer.style.display = "block";
        } else {
            if (footer) footer.style.display = "none";
        }
    }

    modal.style.display = "flex";
}

function cerrarVisorFoto() {
    const modal = document.getElementById("modalVisorFoto");
    const img = document.getElementById("imgVisorFoto");
    if (modal) modal.style.display = "none";
    if (img) img.src = "";
}

/* ═══════════════════════════════════════════
   GESTIÓN DE PERFIL DEL REPORTERO
   ═══════════════════════════════════════════ */
let perfilReporteroActual = null;

function formatearFechaHora(fechaStr) {
    if (!fechaStr) return 'Nunca';
    try {
        const f = new Date(fechaStr);
        if (isNaN(f.getTime())) return 'Nunca';
        return f.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return fechaStr;
    }
}

async function cargarDatosPerfil() {
    const alertaBox = document.getElementById("perfilAlertaBox");
    if (alertaBox) alertaBox.style.display = "none";

    try {
        const res = await fetch("/api/perfil");
        if (res.status === 401) {
            window.location.href = "/login/index.html";
            return;
        }
        if (!res.ok) throw new Error("Error al obtener información de tu perfil");

        const data = await res.json();
        perfilReporteroActual = data;

        // Ficha Resumen
        const resumenNombre = document.getElementById("perfilResumenNombre");
        const resumenEmail = document.getElementById("perfilResumenEmail");
        const resumenRol = document.getElementById("perfilResumenRol");
        const resumenEstado = document.getElementById("perfilResumenEstado");
        const resumenFechaReg = document.getElementById("perfilResumenFechaReg");
        const resumenUltimoAcceso = document.getElementById("perfilResumenUltimoAcceso");
        const avatarLetra = document.getElementById("perfilAvatarLetra");
        const rolTexto = document.getElementById("perfilRolTexto");

        const nombre = data.nombreusuario || "Reportero";
        if (resumenNombre) resumenNombre.innerText = nombre;
        if (avatarLetra) avatarLetra.innerText = nombre.charAt(0).toUpperCase();
        if (resumenEmail) resumenEmail.innerText = data.email || "No registrado";
        if (resumenRol) resumenRol.innerText = data.rol ? data.rol.charAt(0).toUpperCase() + data.rol.slice(1) : 'Reportero';
        if (rolTexto) rolTexto.innerText = (data.rol || 'REPORTERO').toUpperCase();
        if (resumenEstado) resumenEstado.innerText = (data.estado || 'activo').toUpperCase();
        if (resumenFechaReg) resumenFechaReg.innerText = data.fecha_registro ? formatearFechaHora(data.fecha_registro) : '--';
        if (resumenUltimoAcceso) resumenUltimoAcceso.innerText = data.ultimo_acceso ? formatearFechaHora(data.ultimo_acceso) : 'Sesión activa';

        // Llenar Formulario
        const inputEmail = document.getElementById("perfilInputEmail");
        const inputTelefono = document.getElementById("perfilInputTelefono");
        const inputDependencia = document.getElementById("perfilInputDependencia");
        const passActual = document.getElementById("perfilPasswordActual");
        const passNuevo = document.getElementById("perfilPasswordNuevo");
        const passConfirmar = document.getElementById("perfilPasswordConfirmar");

        if (inputEmail) inputEmail.value = data.email || "";
        if (inputTelefono) inputTelefono.value = data.telefono || "";
        if (inputDependencia) inputDependencia.value = data.dependencia || "";
        if (passActual) passActual.value = "";
        if (passNuevo) passNuevo.value = "";
        if (passConfirmar) passConfirmar.value = "";
    } catch (err) {
        console.error("Error al cargar perfil:", err);
        showAlert("No se pudo cargar la información del perfil", "error");
    }
}

// Inicialización de eventos para Perfil y Visor de Foto
document.addEventListener('DOMContentLoaded', () => {
    // 1. Visor de Foto
    const btnCerrarVisor = document.getElementById("btnCerrarVisorFoto");
    const overlayVisor = document.getElementById("modalVisorFoto");

    if (btnCerrarVisor) btnCerrarVisor.addEventListener("click", cerrarVisorFoto);
    if (overlayVisor) {
        overlayVisor.addEventListener("click", (e) => {
            if (e.target === overlayVisor) cerrarVisorFoto();
        });
    }

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            cerrarVisorFoto();
            cerrarModalEditarReporte();
        }
    });

    // 2. Formulario Perfil
    const formPerfil = document.getElementById("formPerfilUsuario");
    const btnResetPerfil = document.getElementById("btnRestablecerFormPerfil");

    if (btnResetPerfil) {
        btnResetPerfil.addEventListener("click", () => {
            if (perfilReporteroActual) {
                const inputEmail = document.getElementById("perfilInputEmail");
                const inputTelefono = document.getElementById("perfilInputTelefono");
                const inputDependencia = document.getElementById("perfilInputDependencia");
                const passActual = document.getElementById("perfilPasswordActual");
                const passNuevo = document.getElementById("perfilPasswordNuevo");
                const passConfirmar = document.getElementById("perfilPasswordConfirmar");
                const alertaBox = document.getElementById("perfilAlertaBox");

                if (inputEmail) inputEmail.value = perfilReporteroActual.email || "";
                if (inputTelefono) inputTelefono.value = perfilReporteroActual.telefono || "";
                if (inputDependencia) inputDependencia.value = perfilReporteroActual.dependencia || "";
                if (passActual) passActual.value = "";
                if (passNuevo) passNuevo.value = "";
                if (passConfirmar) passConfirmar.value = "";
                if (alertaBox) alertaBox.style.display = "none";
            }
        });
    }

    if (formPerfil) {
        formPerfil.addEventListener("submit", async (e) => {
            e.preventDefault();

            const alertaBox = document.getElementById("perfilAlertaBox");
            const email = document.getElementById("perfilInputEmail")?.value.trim();
            const telefono = document.getElementById("perfilInputTelefono")?.value.trim();
            const dependencia = document.getElementById("perfilInputDependencia")?.value.trim();
            const password_actual = document.getElementById("perfilPasswordActual")?.value;
            const password_nuevo = document.getElementById("perfilPasswordNuevo")?.value;
            const password_confirmar = document.getElementById("perfilPasswordConfirmar")?.value;

            if (alertaBox) {
                alertaBox.style.display = "none";
                alertaBox.className = "modal-alerta-box";
            }

            if (password_nuevo || password_confirmar) {
                if (!password_actual) {
                    if (alertaBox) {
                        alertaBox.className = "modal-alerta-box alerta-error";
                        alertaBox.innerText = "Debes ingresar tu contraseña actual para autorizar el cambio de clave.";
                        alertaBox.style.display = "block";
                    }
                    return;
                }
                if (password_nuevo !== password_confirmar) {
                    if (alertaBox) {
                        alertaBox.className = "modal-alerta-box alerta-error";
                        alertaBox.innerText = "La nueva contraseña y su confirmación no coinciden.";
                        alertaBox.style.display = "block";
                    }
                    return;
                }
                if (password_nuevo.length < 8) {
                    if (alertaBox) {
                        alertaBox.className = "modal-alerta-box alerta-error";
                        alertaBox.innerText = "La nueva contraseña debe tener al menos 8 caracteres.";
                        alertaBox.style.display = "block";
                    }
                    return;
                }
                if (!/[A-Z]/.test(password_nuevo) || !/[a-z]/.test(password_nuevo) || !/\d/.test(password_nuevo)) {
                    if (alertaBox) {
                        alertaBox.className = "modal-alerta-box alerta-error";
                        alertaBox.innerText = "La nueva contraseña debe incluir al menos una mayúscula, una minúscula y un número.";
                        alertaBox.style.display = "block";
                    }
                    return;
                }
            }

            const payload = { email, telefono, dependencia };
            if (password_nuevo) {
                payload.password_actual = password_actual;
                payload.password_nuevo = password_nuevo;
            }

            const btnSubmit = document.getElementById("btnGuardarPerfilSubmit");
            const textoOriginal = btnSubmit ? btnSubmit.innerText : "Guardar cambios";
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerText = "Guardando...";
            }

            try {
                const res = await fetch("/api/perfil", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.mensaje || "Error al actualizar el perfil");
                }

                showAlert(data.mensaje || "Perfil actualizado exitosamente", "success");
                if (alertaBox) {
                    alertaBox.className = "modal-alerta-box alerta-exito";
                    alertaBox.innerText = data.mensaje || "Perfil actualizado exitosamente.";
                    alertaBox.style.display = "block";
                }

                const passActualEl = document.getElementById("perfilPasswordActual");
                const passNuevoEl = document.getElementById("perfilPasswordNuevo");
                const passConfirmarEl = document.getElementById("perfilPasswordConfirmar");
                if (passActualEl) passActualEl.value = "";
                if (passNuevoEl) passNuevoEl.value = "";
                if (passConfirmarEl) passConfirmarEl.value = "";

                // Refrescar datos
                await cargarDatosPerfil();
                await cargarSesion();
            } catch (err) {
                console.error("Error al guardar perfil:", err);
                if (alertaBox) {
                    alertaBox.className = "modal-alerta-box alerta-error";
                    alertaBox.innerText = err.message || "Error al procesar la actualización del perfil.";
                    alertaBox.style.display = "block";
                }
                showAlert(err.message || "Error al actualizar perfil", "error");
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = textoOriginal;
                }
            }
        });
    }
});

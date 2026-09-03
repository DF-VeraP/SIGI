// LOGICA JAVASCRIPT DE LA INTERFAZ MÓVIL REPORTERO EN TERRENO - SIGI
let mapMini = null;
let markerMini = null;
let usuarioSesion = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificar sesión de usuario
    await cargarSesion();

    // 2. Cargar catálogos (tipos, modalidades, etc.)
    await cargarCatalogos();

    // 3. Inicializar Leaflet Mini Mapa
    initMiniMapa();

    // 4. Configurar fecha y hora actuales por defecto
    const hoy = new Date();
    document.getElementById("fecha").value = hoy.toISOString().split('T')[0];
    document.getElementById("hora").value = hoy.toTimeString().split(' ')[0].slice(0, 5);

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
        inputFoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    imgPreview.src = evt.target.result;
                    previewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnQuitarFoto) {
        btnQuitarFoto.addEventListener("click", () => {
            inputFoto.value = "";
            imgPreview.src = "";
            previewContainer.style.display = "none";
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
        const res = await fetch("/usuario");
        if (!res.ok) {
            window.location.href = "/login/index.html";
            return;
        }
        const data = await res.json();
        usuarioSesion = data;
        document.getElementById("userBadge").innerHTML = `<i class="bi bi-person-circle"></i> ${data.usuario} (${data.dependencia || data.rol})`;
    } catch (e) {
        console.error("Error verificando sesión:", e);
        window.location.href = "/login/index.html";
    }
}

async function cargarCatalogos() {
    try {
        const res = await fetch("/api/catalogos");
        const data = await res.json();

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

    } catch (e) {
        console.error("Error cargando catálogos:", e);
        showAlert("Error cargando categorías del sistema", "error");
    }
}

function initMiniMapa() {
    // Coordenadas iniciales por defecto (Popayán / Colombia)
    const latDef = 2.4419;
    const lngDef = -76.6063;

    document.getElementById("lat").value = latDef;
    document.getElementById("lng").value = lngDef;

    mapMini = L.map("mapaMini").setView([latDef, lngDef], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapMini);

    markerMini = L.marker([latDef, lngDef], { draggable: true }).addTo(mapMini);

    markerMini.on("dragend", function (e) {
        const pos = e.target.getLatLng();
        actualizarCoordenadas(pos.lat, pos.lng);
    });

    mapMini.on("click", function (e) {
        markerMini.setLatLng(e.latlng);
        actualizarCoordenadas(e.latlng.lat, e.latlng.lng);
    });
}

function actualizarCoordenadas(lat, lng) {
    document.getElementById("lat").value = parseFloat(lat).toFixed(6);
    document.getElementById("lng").value = parseFloat(lng).toFixed(6);
    document.getElementById("gpsStatus").innerText = `📍 Ubicación fijada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function obtenerGpsActual() {
    const status = document.getElementById("gpsStatus");
    status.innerText = "⏳ Obteniendo señal GPS del dispositivo...";

    if (!navigator.geolocation) {
        status.innerText = "❌ Tu navegador no soporta geolocalización GPS.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            actualizarCoordenadas(lat, lng);
            mapMini.setView([lat, lng], 17);
            markerMini.setLatLng([lat, lng]);
            status.innerText = `✅ Ubicación GPS obtenida (Precisión: ±${Math.round(pos.coords.accuracy)}m)`;
        },
        (err) => {
            console.error(err);
            status.innerText = "⚠️ No se pudo obtener la ubicación GPS automáticamente. Puedes tocar el mapa.";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function setupTabs() {
    const tabCrear = document.getElementById("tabCrear");
    const tabMis = document.getElementById("tabMisReportes");
    const secCrear = document.getElementById("secNuevoReporte");
    const secMis = document.getElementById("secMisReportes");

    tabCrear.addEventListener("click", () => {
        tabCrear.classList.add("active");
        tabMis.classList.remove("active");
        secCrear.classList.add("active");
        secMis.classList.remove("active");
        setTimeout(() => mapMini.invalidateSize(), 200);
    });

    tabMis.addEventListener("click", () => {
        tabMis.classList.add("active");
        tabCrear.classList.remove("active");
        secMis.classList.add("active");
        secCrear.classList.remove("active");
        cargarMisReportes();
    });
}

async function enviarReporte(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById("btnSubmit");
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="bi bi-hourglass-split"></i> Registrando...`;

    const formData = new FormData();
    formData.append("tipo", document.getElementById("tipoIncidente").value);
    formData.append("fecha", document.getElementById("fecha").value);
    formData.append("hora", document.getElementById("hora").value);
    formData.append("lat", document.getElementById("lat").value);
    formData.append("lng", document.getElementById("lng").value);
    formData.append("id_gravedad", document.getElementById("gravedad").value);
    if (document.getElementById("modalidad").value) {
        formData.append("id_modalidad", document.getElementById("modalidad").value);
    }
    formData.append("direccion", document.getElementById("direccion").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("requiere_policia", document.getElementById("chkPolicia")?.checked ?? false);
    formData.append("requiere_ambulancia", document.getElementById("chkAmbulancia")?.checked ?? false);
    formData.append("requiere_bomberos", document.getElementById("chkBomberos")?.checked ?? false);

    const inputFoto = document.getElementById("fotoInput");
    if (inputFoto && inputFoto.files && inputFoto.files[0]) {
        formData.append("foto", inputFoto.files[0]);
    }

    try {
        const res = await fetch("/api/incidentes", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            showAlert(`✅ ${data.mensaje} (Código: ${data.incidente.codigoincidente})`, "success");
            document.getElementById("formReporte").reset();
            if (document.getElementById("previewContainer")) {
                document.getElementById("previewContainer").style.display = "none";
            }

            // Restablecer fecha y hora
            const hoy = new Date();
            document.getElementById("fecha").value = hoy.toISOString().split('T')[0];
            document.getElementById("hora").value = hoy.toTimeString().split(' ')[0].slice(0, 5);

            // Cambiar a la pestaña de mis reportes
            document.getElementById("tabMisReportes").click();
        } else {
            showAlert(`❌ ${data.mensaje || "Error registrando reporte"}`, "error");
        }

    } catch (err) {
        console.error("Error al enviar reporte:", err);
        showAlert("❌ Error de conexión al registrar el incidente", "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="bi bi-send-fill"></i> Registrar Incidente`;
    }
}

async function cargarMisReportes() {
    const list = document.getElementById("reportsList");
    list.innerHTML = '<div class="loading-spinner">Cargando mis reportes...</div>';

    try {
        const res = await fetch("/api/incidentes/mis-reportes");
        if (!res.ok) throw new Error("Error en servidor");
        const reportes = await res.json();

        document.getElementById("countReportes").innerText = reportes.length;

        if (reportes.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">No has registrado ningún reporte aún.</div>';
            return;
        }

        list.innerHTML = "";
        reportes.forEach(r => {
            const fechaFmt = new Date(r.fechaincidente).toLocaleDateString('es-ES');
            const colorEstado = r.estado_color || '#6c757d';
            const htmlFoto = r.imagen_url ? `<div style="margin-top: 8px;"><img src="${r.imagen_url}" style="width: 100%; max-height: 140px; object-fit: cover; border-radius: 6px;" alt="Evidencia"></div>` : '';

            list.innerHTML += `
                <div class="report-card">
                    <div class="report-card-head">
                        <span class="report-code">${r.codigoincidente || 'INC-' + r.idincidente}</span>
                        <span class="badge-status" style="background-color: ${colorEstado}">
                            ${r.estado_nombre || 'Reportado'}
                        </span>
                    </div>
                    <div class="report-type">${r.tipo_nombre || 'Incidente general'}</div>
                    <div class="report-desc">${r.descripcionincidente || 'Sin descripción'}</div>
                    ${htmlFoto}
                    <div class="report-meta" style="margin-top: 8px;">
                        <span><i class="bi bi-calendar-event"></i> ${fechaFmt} ${r.horaincidente.slice(0, 5)}</span>
                        <span><i class="bi bi-geo-alt"></i> ${r.barrio_nombre || r.vereda_nombre || 'Sin Zona'}</span>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error cargando mis reportes:", err);
        list.innerHTML = '<div style="text-align: center; color: #dc3545; padding: 15px;">Error al cargar mis reportes.</div>';
    }
}

function showAlert(mensaje, tipo = "success") {
    const cont = document.getElementById("alertContainer");
    cont.innerHTML = `
        <div class="alert-box alert-${tipo}">
            ${mensaje}
        </div>
    `;
    setTimeout(() => {
        cont.innerHTML = "";
    }, 4000);
}

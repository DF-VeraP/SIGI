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
                    console.log(`📸 Foto optimizada: ${(file.size / (1024 * 1024)).toFixed(2)} MB -> ${(compressedFile.size / 1024).toFixed(1)} KB`);
                    resolve(compressedFile);
                }, "image/jpeg", quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // 0. Toggle Tema Claro / Oscuro (Tipo iPhone) — igual que el panel Admin
    const btnTemaReportero = document.getElementById("btnTemaReportero");
    if (localStorage.getItem("tema_sigi_reportero") === "claro") {
        document.body.classList.add("tema-claro");
    }
    if (btnTemaReportero) {
        btnTemaReportero.addEventListener("click", function (e) {
            e.stopPropagation();
            document.body.classList.toggle("tema-claro");
            const esClaro = document.body.classList.contains("tema-claro");
            localStorage.setItem("tema_sigi_reportero", esClaro ? "claro" : "oscuro");
        });
    }

    // 1. Verificar sesión de usuario
    await cargarSesion();


    // 2. Cargar catálogos (tipos, modalidades, etc.)
    await cargarCatalogos();

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
        if (elFecha) elFecha.value = `${anio}-${mes}-${dia}`;
        if (elHora) elHora.value = `${horas}:${minutos}`;
    }
    fijarFechaHoraActual();

    const btnAhoraRep = document.getElementById("btnAhoraReportero");
    if (btnAhoraRep) {
        btnAhoraRep.addEventListener("click", () => {
            fijarFechaHoraActual();
            mostrarToastReportero("Fecha y hora actualizadas al momento actual ⏱️", "info");
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
                        previewContainer.style.display = "block";
                    };
                    reader.readAsDataURL(fotoComprimida);
                } catch (optErr) {
                    console.warn("No se pudo comprimir la foto, usando original:", optErr);
                    fotoComprimida = file;
                    imgPreview.src = URL.createObjectURL(file);
                    previewContainer.style.display = "block";
                } finally {
                    if (spanBtn) spanBtn.innerText = "Cambiar Foto Adjunta";
                }
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
            if (spanBtn) spanBtn.innerText = "Adjuntar / Tomar Foto de Terreno";
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
    const appContainer = document.querySelector(".app-container");

    tabCrear.addEventListener("click", () => {
        tabCrear.classList.add("active");
        tabMis.classList.remove("active");
        secCrear.classList.add("active");
        secMis.classList.remove("active");
        if (appContainer) appContainer.classList.remove("view-mis-reportes");
        setTimeout(() => mapMini.invalidateSize(), 200);
    });

    tabMis.addEventListener("click", () => {
        tabMis.classList.add("active");
        tabCrear.classList.remove("active");
        secMis.classList.add("active");
        secCrear.classList.remove("active");
        if (appContainer) appContainer.classList.add("view-mis-reportes");
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
            showAlert(`✅ ${data.mensaje} (Código: ${data.incidente.codigoincidente})`, "success");
            document.getElementById("formReporte").reset();
            fotoComprimida = null;
            if (document.getElementById("previewContainer")) {
                document.getElementById("previewContainer").style.display = "none";
            }
            const spanBtn = btnTomarFoto?.querySelector("span");
            if (spanBtn) spanBtn.innerText = "Adjuntar / Tomar Foto de Terreno";

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

            // Botones de acción: solo si el reporte está en estado "Reportado" (id_estado = 1)
            const esPendiente = r.id_estado === 1;
            const htmlAcciones = esPendiente
                ? `<div class="report-actions">
                       <button class="btn-report-edit" onclick="abrirModalEditarReporte(${r.idincidente}, '${r.fechaincidente?.split('T')[0]}', '${r.horaincidente?.slice(0,5)}', ${r.id_gravedad || 3}, '${(r.direccion||'').replace(/'/g,"\\'")}', '${(r.descripcionincidente||'').replace(/'/g,"\\'")}', '${(r.imagen_url||'').replace(/'/g,"\\'")}')">
                           <i class="bi bi-pencil"></i> Editar
                       </button>
                       <button class="btn-report-delete" onclick="confirmarEliminarReporte(${r.idincidente}, '${r.codigoincidente || 'INC-'+r.idincidente}')">
                           <i class="bi bi-trash3"></i> Eliminar
                       </button>
                   </div>`
                : `<div class="report-actions-locked"><i class="bi bi-lock-fill"></i> En revisión — no editable</div>`;

            list.innerHTML += `
                <div class="report-card">
                    <div class="report-card-head">
                        <span class="report-code">${r.codigoincidente || 'INC-' + r.idincidente}</span>
                        <span class="badge-status" style="background-color: ${colorEstado}">
                            ${r.estado_nombre || 'Reportado'}
                        </span>
                    </div>
                    <div class="report-type">${r.tipo_nombre || 'Incidente general'}</div>
                    <div class="report-desc">${r.descripcionincidente || '<em style="opacity:0.5">Sin descripción</em>'}</div>
                    ${htmlFoto}
                    <div class="report-meta" style="margin-top: 8px;">
                        <span><i class="bi bi-calendar-event"></i> ${fechaFmt} ${r.horaincidente.slice(0, 5)}</span>
                        <span><i class="bi bi-geo-alt"></i> ${r.barrio_nombre || r.vereda_nombre || 'Sin Zona'}</span>
                    </div>
                    ${htmlAcciones}
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
        imgActual.src = imagenUrl;
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
    btnSave.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';

    const formData = new FormData();
    const fecha = document.getElementById("editFechaReporte").value;
    const hora = document.getElementById("editHoraReporte").value;
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
            showAlert('✅ Reporte actualizado correctamente', 'success');
            cargarMisReportes();
        } else {
            showAlert(`❌ ${data.mensaje || 'Error al actualizar'}`, 'error');
        }
    } catch (err) {
        console.error('Error editando reporte:', err);
        showAlert('❌ Error de conexión', 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="bi bi-check2-circle"></i> Guardar Cambios';
    }
}

async function confirmarEliminarReporte(id, codigo) {
    const confirmar = window.confirm(
        `¿Eliminar el reporte ${codigo}?\n\nEsta acción es permanente y no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
        const res = await fetch(`/api/incidentes/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
            showAlert('🗑️ Reporte eliminado correctamente', 'success');
            cargarMisReportes();
        } else {
            showAlert(`❌ ${data.mensaje || 'No se pudo eliminar'}`, 'error');
        }
    } catch (err) {
        console.error('Error eliminando reporte:', err);
        showAlert('❌ Error de conexión', 'error');
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

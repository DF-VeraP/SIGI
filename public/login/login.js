/**
 * SIGI — Lógica de Autenticación, Recuperación de Contraseña y Primer Ingreso
 */

document.addEventListener("DOMContentLoaded", () => {
    // Elementos Formulario Login Principal
    const loginForm = document.getElementById("loginForm");
    const nameInput = document.getElementById("nameuser");
    const passInput = document.getElementById("pssuser");
    const alertBox = document.getElementById("alertBox");
    const alertIcon = document.getElementById("alertIcon");
    const alertText = document.getElementById("resp");
    const btnSubmit = document.getElementById("btnSubmit");
    const glassCard = document.querySelector(".glass-card");
    const togglePassword = document.getElementById("togglePassword");
    const eyeIcon = document.getElementById("eyeIcon");

    // Elementos Modal Recuperar Contraseña
    const btnForgotPass = document.getElementById("btnForgotPass");
    const modalRecuperarPass = document.getElementById("modalRecuperarPass");
    const btnCloseRecuperar = document.getElementById("btnCloseRecuperar");
    const btnCancelRecuperar = document.getElementById("btnCancelRecuperar");
    const formRecuperarPass = document.getElementById("formRecuperarPass");
    const emailRecuperar = document.getElementById("emailRecuperar");
    const btnSubmitRecuperar = document.getElementById("btnSubmitRecuperar");
    const alertRecuperar = document.getElementById("alertRecuperar");
    const alertIconRecuperar = document.getElementById("alertIconRecuperar");
    const respRecuperar = document.getElementById("respRecuperar");

    // Elementos Modal Primer Ingreso
    const modalPrimerIngreso = document.getElementById("modalPrimerIngreso");
    const formPrimerIngreso = document.getElementById("formPrimerIngreso");
    const passActualPrimerIngreso = document.getElementById("passActualPrimerIngreso");
    const passNuevaPrimerIngreso = document.getElementById("passNuevaPrimerIngreso");
    const passConfirmarPrimerIngreso = document.getElementById("passConfirmarPrimerIngreso");
    const btnSubmitPrimerIngreso = document.getElementById("btnSubmitPrimerIngreso");
    const alertPrimerIngreso = document.getElementById("alertPrimerIngreso");
    const alertIconPrimerIngreso = document.getElementById("alertIconPrimerIngreso");
    const respPrimerIngreso = document.getElementById("respPrimerIngreso");

    // Rol temporal para redirección tras primer ingreso
    let rolPostLogin = "reportero";

    // ── 1. Funciones Auxiliares de Alertas ──
    function showAlert(message, type = "danger") {
        alertBox.className = `alert-box ${type}`;
        alertText.textContent = message;

        if (type === "danger") {
            alertIcon.className = "bi bi-exclamation-triangle-fill";
        } else if (type === "success") {
            alertIcon.className = "bi bi-check-circle-fill";
        } else if (type === "warning") {
            alertIcon.className = "bi bi-exclamation-circle-fill";
        }

        alertBox.style.display = "flex";
    }

    function hideAlert() {
        alertBox.style.display = "none";
    }

    function showModalAlert(box, icon, textEl, message, type = "danger") {
        box.className = `alert-box ${type}`;
        textEl.textContent = message;
        if (type === "danger") {
            icon.className = "bi bi-exclamation-triangle-fill";
        } else if (type === "success") {
            icon.className = "bi bi-check-circle-fill";
        } else if (type === "warning") {
            icon.className = "bi bi-exclamation-circle-fill";
        }
        box.style.display = "flex";
    }

    function hideModalAlert(box) {
        if (box) box.style.display = "none";
    }

    function triggerShake() {
        if (glassCard) {
            glassCard.classList.remove("shake");
            void glassCard.offsetWidth;
            glassCard.classList.add("shake");
            setTimeout(() => glassCard.classList.remove("shake"), 450);
        }
    }

    // ── 2. Detección de Mensajes de URL (Inactividad / Reset) ──
    const urlParams = new URLSearchParams(window.location.search);
    const motivo = urlParams.get("motivo");
    if (motivo === "inactividad") {
        showAlert("Tu sesión se cerró automáticamente por superar 40 minutos de inactividad. Por favor, ingresa tus credenciales nuevamente.", "warning");
    } else if (motivo === "reset_exitoso") {
        showAlert("Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.", "success");
    }

    // ── 3. Toggle de Visibilidad de Contraseña ──
    if (togglePassword && passInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passInput.getAttribute("type") === "password";
            passInput.setAttribute("type", isPassword ? "text" : "password");
            if (eyeIcon) {
                eyeIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
            }
            passInput.focus();
        });
    }

    // ── 4. Envío del Formulario de Login ──
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideAlert();

            const usuario = nameInput.value.trim();
            const contrasenia = passInput.value.trim();

            if (!usuario || !contrasenia) {
                showAlert("Por favor, completa todos los campos requeridos.", "warning");
                triggerShake();
                if (!usuario) nameInput.focus();
                else passInput.focus();
                return;
            }

            btnSubmit.classList.add("loading");
            btnSubmit.disabled = true;

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuario, contrasenia })
                });

                const data = await response.json();

                if (response.ok) {
                    rolPostLogin = data.rol || "reportero";

                    // Verificar si el usuario debe cambiar su contraseña obligatoriamente (Primer ingreso)
                    if (data.debe_cambiar_password === true) {
                        btnSubmit.classList.remove("loading");
                        btnSubmit.disabled = false;
                        showAlert("Primer ingreso detectado: Debes cambiar tu contraseña temporal para continuar.", "warning");
                        
                        // Abrir modal de primer ingreso
                        if (modalPrimerIngreso) {
                            if (passActualPrimerIngreso) passActualPrimerIngreso.value = contrasenia;
                            modalPrimerIngreso.classList.add("active");
                            if (passNuevaPrimerIngreso) passNuevaPrimerIngreso.focus();
                        }
                        return;
                    }

                    // Acceso regular
                    showAlert(data.mensaje || "Autenticación exitosa. Redirigiendo...", "success");
                    setTimeout(() => {
                        if (data.rol === "reportero") {
                            window.location.href = "/reportero/index.html";
                        } else {
                            window.location.href = "/admin/index.html";
                        }
                    }, 650);

                } else {
                    btnSubmit.classList.remove("loading");
                    btnSubmit.disabled = false;
                    showAlert(data.mensaje || "Credenciales incorrectas.", "danger");
                    triggerShake();
                    passInput.value = "";
                    passInput.focus();
                }

            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
                btnSubmit.classList.remove("loading");
                btnSubmit.disabled = false;
                showAlert("No fue posible conectar con el servidor. Revisa tu conexión.", "danger");
                triggerShake();
            }
        });
    }

    // ── 5. Modal de Recuperación de Contraseña ──
    function abrirModalRecuperar() {
        if (modalRecuperarPass) {
            hideModalAlert(alertRecuperar);
            if (formRecuperarPass) formRecuperarPass.reset();
            modalRecuperarPass.classList.add("active");
            if (emailRecuperar) emailRecuperar.focus();
        }
    }

    function cerrarModalRecuperar() {
        if (modalRecuperarPass) {
            modalRecuperarPass.classList.remove("active");
        }
    }

    if (btnForgotPass) {
        btnForgotPass.addEventListener("click", abrirModalRecuperar);
    }
    if (btnCloseRecuperar) {
        btnCloseRecuperar.addEventListener("click", cerrarModalRecuperar);
    }
    if (btnCancelRecuperar) {
        btnCancelRecuperar.addEventListener("click", cerrarModalRecuperar);
    }

    if (formRecuperarPass) {
        formRecuperarPass.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideModalAlert(alertRecuperar);

            const email = emailRecuperar.value.trim();
            if (!email || !email.includes("@")) {
                showModalAlert(alertRecuperar, alertIconRecuperar, respRecuperar, "Ingresa un correo institucional válido.", "warning");
                return;
            }

            btnSubmitRecuperar.disabled = true;
            btnSubmitRecuperar.innerHTML = `<span>Enviando...</span> <div class="btn-spinner" style="display:inline-block;"></div>`;

            try {
                const res = await fetch("/api/auth/recuperar-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();
                showModalAlert(alertRecuperar, alertIconRecuperar, respRecuperar, data.mensaje || "Solicitud procesada.", "success");

                setTimeout(() => {
                    cerrarModalRecuperar();
                }, 4000);

            } catch (err) {
                console.error("Error al solicitar recuperación:", err);
                showModalAlert(alertRecuperar, alertIconRecuperar, respRecuperar, "Ocurrió un error al enviar la solicitud. Intenta más tarde.", "danger");
            } finally {
                btnSubmitRecuperar.disabled = false;
                btnSubmitRecuperar.innerHTML = `<span>Enviar Enlace</span> <i class="bi bi-send-fill" style="font-size: 0.8rem;"></i>`;
            }
        });
    }

    // ── 6. Formulario de Cambio de Contraseña en Primer Ingreso ──
    if (formPrimerIngreso) {
        formPrimerIngreso.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideModalAlert(alertPrimerIngreso);

            const contraseniaActual = passActualPrimerIngreso.value.trim();
            const nuevaContrasenia = passNuevaPrimerIngreso.value.trim();
            const confirmarContrasenia = passConfirmarPrimerIngreso.value.trim();

            if (!contraseniaActual || !nuevaContrasenia || !confirmarContrasenia) {
                showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "Por favor diligencia todos los campos.", "warning");
                return;
            }

            if (nuevaContrasenia.length < 6) {
                showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
                return;
            }

            if (nuevaContrasenia !== confirmarContrasenia) {
                showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "Las contraseñas no coinciden.", "warning");
                return;
            }

            if (nuevaContrasenia === contraseniaActual) {
                showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "La nueva contraseña no puede ser idéntica a la anterior.", "warning");
                return;
            }

            btnSubmitPrimerIngreso.disabled = true;
            btnSubmitPrimerIngreso.innerHTML = `<span>Guardando...</span> <div class="btn-spinner" style="display:inline-block;"></div>`;

            try {
                const res = await fetch("/api/auth/cambiar-password-primer-ingreso", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contraseniaActual, nuevaContrasenia })
                });

                const data = await res.json();

                if (res.ok) {
                    showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "¡Contraseña actualizada exitosamente! Ingresando al sistema...", "success");
                    setTimeout(() => {
                        if (rolPostLogin === "reportero") {
                            window.location.href = "/reportero/index.html";
                        } else {
                            window.location.href = "/admin/index.html";
                        }
                    }, 1000);
                } else {
                    showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, data.mensaje || "Error al actualizar contraseña.", "danger");
                    btnSubmitPrimerIngreso.disabled = false;
                    btnSubmitPrimerIngreso.innerHTML = `<span>Actualizar y Continuar</span> <i class="bi bi-arrow-right-short" style="font-size: 1.1rem;"></i>`;
                }

            } catch (err) {
                console.error("Error en cambio forzoso de contraseña:", err);
                showModalAlert(alertPrimerIngreso, alertIconPrimerIngreso, respPrimerIngreso, "Error al conectar con el servidor.", "danger");
                btnSubmitPrimerIngreso.disabled = false;
                btnSubmitPrimerIngreso.innerHTML = `<span>Actualizar y Continuar</span> <i class="bi bi-arrow-right-short" style="font-size: 1.1rem;"></i>`;
            }
        });
    }

    // Limpiar alertas al escribir en los inputs
    [nameInput, passInput].forEach(input => {
        if (input) input.addEventListener("input", hideAlert);
    });
});
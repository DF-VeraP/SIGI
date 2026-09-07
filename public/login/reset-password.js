/**
 * SIGI — Lógica de Restablecimiento de Contraseña
 */

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const loadingToken = document.getElementById("loadingToken");
    const tokenErrorBox = document.getElementById("tokenErrorBox");
    const tokenErrorMessage = document.getElementById("tokenErrorMessage");
    const resetForm = document.getElementById("resetForm");
    const subtitleText = document.getElementById("subtitleText");

    const nuevaContrasenia = document.getElementById("nuevaContrasenia");
    const confirmarContrasenia = document.getElementById("confirmarContrasenia");
    const toggleNuevaPass = document.getElementById("toggleNuevaPass");
    const eyeIconNueva = document.getElementById("eyeIconNueva");
    const alertReset = document.getElementById("alertReset");
    const alertIconReset = document.getElementById("alertIconReset");
    const respReset = document.getElementById("respReset");
    const btnSubmitReset = document.getElementById("btnSubmitReset");

    function showAlert(msg, type = "danger") {
        alertReset.className = `alert-box ${type}`;
        respReset.textContent = msg;
        if (type === "danger") {
            alertIconReset.className = "bi bi-exclamation-triangle-fill";
        } else if (type === "success") {
            alertIconReset.className = "bi bi-check-circle-fill";
        } else if (type === "warning") {
            alertIconReset.className = "bi bi-exclamation-circle-fill";
        }
        alertReset.style.display = "flex";
    }

    function hideAlert() {
        alertReset.style.display = "none";
    }

    // Toggle de visibilidad de contraseña
    if (toggleNuevaPass && nuevaContrasenia) {
        toggleNuevaPass.addEventListener("click", () => {
            const isPass = nuevaContrasenia.getAttribute("type") === "password";
            nuevaContrasenia.setAttribute("type", isPass ? "text" : "password");
            if (confirmarContrasenia) {
                confirmarContrasenia.setAttribute("type", isPass ? "text" : "password");
            }
            if (eyeIconNueva) {
                eyeIconNueva.className = isPass ? "bi bi-eye-slash" : "bi bi-eye";
            }
        });
    }

    // 1. Validar presencia del token
    if (!token) {
        loadingToken.style.display = "none";
        tokenErrorBox.style.display = "block";
        tokenErrorMessage.textContent = "No se proporcionó ningún token de recuperación en el enlace.";
        return;
    }

    // 2. Validar token con el servidor
    try {
        const response = await fetch(`/api/auth/validar-token-reset?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        loadingToken.style.display = "none";

        if (response.ok && data.valido) {
            subtitleText.textContent = `Hola ${data.usuario}, define tu nueva clave de acceso`;
            resetForm.style.display = "flex";
            nuevaContrasenia.focus();
        } else {
            tokenErrorBox.style.display = "block";
            tokenErrorMessage.textContent = data.mensaje || "El enlace es inválido o ya ha expirado.";
        }
    } catch (err) {
        console.error("Error al validar token:", err);
        loadingToken.style.display = "none";
        tokenErrorBox.style.display = "block";
        tokenErrorMessage.textContent = "Error al conectar con el servidor. Revisa tu conexión.";
    }

    // 3. Manejar envío de nueva contraseña
    if (resetForm) {
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideAlert();

            const pass = nuevaContrasenia.value.trim();
            const passConfirm = confirmarContrasenia.value.trim();

            if (!pass || !passConfirm) {
                showAlert("Por favor diligencia todos los campos.", "warning");
                return;
            }

            if (pass.length < 6) {
                showAlert("La nueva contraseña debe contener al menos 6 caracteres.", "warning");
                return;
            }

            if (pass !== passConfirm) {
                showAlert("Las contraseñas ingresadas no coinciden.", "warning");
                return;
            }

            btnSubmitReset.classList.add("loading");
            btnSubmitReset.disabled = true;

            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, nuevaContrasenia: pass })
                });

                const data = await res.json();

                if (res.ok) {
                    showAlert(data.mensaje || "Contraseña restablecida con éxito.", "success");
                    setTimeout(() => {
                        window.location.href = "index.html?motivo=reset_exitoso";
                    }, 1200);
                } else {
                    btnSubmitReset.classList.remove("loading");
                    btnSubmitReset.disabled = false;
                    showAlert(data.mensaje || "No se pudo restablecer la contraseña.", "danger");
                }
            } catch (error) {
                console.error("Error al enviar nueva contraseña:", error);
                btnSubmitReset.classList.remove("loading");
                btnSubmitReset.disabled = false;
                showAlert("Error de conexión al procesar la solicitud.", "danger");
            }
        });
    }

    [nuevaContrasenia, confirmarContrasenia].forEach(input => {
        if (input) input.addEventListener("input", hideAlert);
    });
});

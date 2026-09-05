/**
 * SIGI — Lógica de Autenticación e Interacciones de Login
 */

document.addEventListener("DOMContentLoaded", () => {
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

    // Función auxiliar para mostrar alertas animadas
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

    function triggerShake() {
        if (glassCard) {
            glassCard.classList.remove("shake");
            // Forzar reflow para reiniciar la animación
            void glassCard.offsetWidth;
            glassCard.classList.add("shake");
            setTimeout(() => glassCard.classList.remove("shake"), 450);
        }
    }

    // Toggle de visibilidad de contraseña
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

    // Manejador del envío del formulario
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideAlert();

            const usuario = nameInput.value.trim();
            const contrasenia = passInput.value.trim();

            // Validación de campos vacíos
            if (!usuario || !contrasenia) {
                showAlert("Por favor, completa todos los campos requeridos.", "warning");
                triggerShake();
                if (!usuario) nameInput.focus();
                else passInput.focus();
                return;
            }

            // Estado de carga en el botón
            btnSubmit.classList.add("loading");
            btnSubmit.disabled = true;

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ usuario, contrasenia })
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert(data.mensaje || "Autenticación exitosa. Redirigiendo...", "success");
                    
                    // Breve delay para apreciar la animación de éxito
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

    // Limpiar alertas al escribir en los inputs
    [nameInput, passInput].forEach(input => {
        if (input) {
            input.addEventListener("input", hideAlert);
        }
    });
});
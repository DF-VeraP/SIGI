document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const usuario = document.getElementById("nameuser").value;
    const contrasenia = document.getElementById("pssuser").value;
    const validacion = document.getElementById("resp");
    if(usuario == "" || contrasenia == ""){
        validacion.innerText = "¡Favor completar campos!";
        validacion.classList.add("colorResp");
    }else{
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ usuario, contrasenia })
            })
            const data = await response.json();
            validacion.innerText = data.mensaje;
            if (response.ok) {
                window.location.href = "/admin"; 
            }
        } catch (error) {
            alert("Error conectando con el servidor");
        }
    }
});
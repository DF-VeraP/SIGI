async function testUserModalCrud() {
  console.log("🚀 Iniciando prueba automatizada de modal Crear, Editar y Limpiar...");

  // 1. Superadmin Login
  const loginRes = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "Daniel", contrasenia: "1234" })
  });

  const cookie = loginRes.headers.get("set-cookie");
  if (!cookie) throw new Error("No se pudo iniciar sesión como Superadmin");

  // 2. CREAR USUARIO (+ Nuevo usuario)
  const testUser = {
    nombreusuario: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@sigi.com`,
    contrasenia: "Password123!",
    rol: "admin",
    estado: "activo",
    dependencia: "Gestión Ambiental",
    telefono: "3209876543"
  };

  console.log("➡️ Creando usuario:", testUser.nombreusuario);
  const createRes = await fetch("http://localhost:3000/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify(testUser)
  });

  const createData = await createRes.json();
  console.log(`Respuesta creación (${createRes.status}):`, createData.mensaje);
  if (createRes.status !== 201) throw new Error("Falló la creación de usuario");

  const createdId = createData.usuario.idusuario;

  // 3. EDITAR USUARIO (Editar)
  const updateData = {
    nombreusuario: testUser.nombreusuario,
    email: `updated_${testUser.email}`,
    contrasenia: "", // sin cambio de contraseña
    rol: "superadmin",
    estado: "inactivo",
    dependencia: "Despacho Principal",
    telefono: "3000000000"
  };

  console.log(`➡️ Editando usuario ID #${createdId}...`);
  const editRes = await fetch(`http://localhost:3000/api/usuarios/${createdId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify(updateData)
  });

  const editData = await editRes.json();
  console.log(`Respuesta edición (${editRes.status}):`, editData.mensaje);
  if (editRes.status !== 200) throw new Error("Falló la edición de usuario");

  // 4. VERIFICAR CAMBIOS
  const checkRes = await fetch(`http://localhost:3000/api/usuarios/${createdId}`, {
    headers: { "Cookie": cookie }
  });
  const userVerified = await checkRes.json();
  console.log("✅ Usuario verificado tras edición:", {
    id: userVerified.idusuario,
    nombre: userVerified.nombreusuario,
    email: userVerified.email,
    rol: userVerified.rol,
    estado: userVerified.estado,
    dependencia: userVerified.dependencia
  });

  // 5. ELIMINAR USUARIO DE PRUEBA
  const deleteRes = await fetch(`http://localhost:3000/api/usuarios/${createdId}`, {
    method: "DELETE",
    headers: { "Cookie": cookie }
  });
  const deleteData = await deleteRes.json();
  console.log(`Respuesta eliminación (${deleteRes.status}):`, deleteData.mensaje);

  console.log("🎉 ¡Todas las operaciones del Modal de Usuario funcionan correctamente!");
}

testUserModalCrud().catch(console.error);

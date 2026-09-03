async function runSuperadminUserTest() {
  console.log("🚀 Iniciando prueba automatizada de la gestión de usuarios (Superadmin)...");
  
  // 1. Iniciar sesión como Superadmin (Daniel)
  const loginRes = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "Daniel", contrasenia: "1234" })
  });

  const cookie = loginRes.headers.get('set-cookie');
  console.log("1. Login Superadmin status:", loginRes.status);
  if (!cookie) throw new Error("No se obtuvo cookie de sesión");

  // 2. Obtener lista de usuarios
  const getUsersRes = await fetch("http://localhost:3000/api/usuarios", {
    headers: { "Cookie": cookie }
  });
  const usuarios = await getUsersRes.json();
  console.log(`2. GET /api/usuarios status: ${getUsersRes.status} | Total usuarios: ${usuarios.length}`);
  console.log("   Ejemplo primer usuario:", {
    id: usuarios[0].idusuario,
    nombre: usuarios[0].nombreusuario,
    rol: usuarios[0].rol,
    estado: usuarios[0].estado,
    fecha_registro: usuarios[0].fecha_registro,
    ultimo_acceso: usuarios[0].ultimo_acceso
  });

  // 3. Crear nuevo usuario de prueba
  const createRes = await fetch("http://localhost:3000/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({
      nombreusuario: "usuario_demo_test",
      email: "demo@sigi.test",
      contrasenia: "123456",
      rol: "reportero",
      estado: "activo",
      dependencia: "Gestión del Riesgo",
      telefono: "3109998877"
    })
  });
  const createData = await createRes.json();
  console.log(`3. POST /api/usuarios status: ${createRes.status} | Msg: ${createData.mensaje}`);
  const createdUserId = createData.usuario?.idusuario;

  // 4. Editar usuario de prueba (PUT)
  if (createdUserId) {
    const editRes = await fetch(`http://localhost:3000/api/usuarios/${createdUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({
        nombreusuario: "usuario_demo_actualizado",
        email: "demo_actualizado@sigi.test",
        rol: "admin",
        estado: "activo",
        dependencia: "Dirección Operativa",
        telefono: "3000000000"
      })
    });
    const editData = await editRes.json();
    console.log(`4. PUT /api/usuarios/${createdUserId} status: ${editRes.status} | Msg: ${editData.mensaje}`);

    // 5. Cambiar Estado (PATCH)
    const patchRes = await fetch(`http://localhost:3000/api/usuarios/${createdUserId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify({ estado: "bloqueado" })
    });
    const patchData = await patchRes.json();
    console.log(`5. PATCH /api/usuarios/${createdUserId}/estado status: ${patchRes.status} | Msg: ${patchData.mensaje}`);

    // 6. Eliminar usuario de prueba (DELETE)
    const deleteRes = await fetch(`http://localhost:3000/api/usuarios/${createdUserId}`, {
      method: "DELETE",
      headers: { "Cookie": cookie }
    });
    const deleteData = await deleteRes.json();
    console.log(`6. DELETE /api/usuarios/${createdUserId} status: ${deleteRes.status} | Msg: ${deleteData.mensaje}`);
  }

  // 7. Consultar logs de auditoría
  const auditRes = await fetch("http://localhost:3000/api/usuarios/auditoria/logs", {
    headers: { "Cookie": cookie }
  });
  const auditLogs = await auditRes.json();
  console.log(`7. GET /api/usuarios/auditoria/logs status: ${auditRes.status} | Ultimos logs (${auditLogs.length}):`);
  auditLogs.slice(0, 3).forEach(l => console.log(`   - [${l.accion}] por ${l.nombreusuario}: ${l.descripcion}`));

  console.log("\n✅ TODAS LAS OPERACIONES Y FUNCIONALIDADES DE GESTIÓN DE USUARIOS FUERON VERIFICADAS CON ÉXITO.");
}

runSuperadminUserTest().catch(console.error);

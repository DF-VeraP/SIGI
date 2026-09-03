async function testAuditLogs() {
  console.log("🚀 Probando permisos del endpoint de auditoría...");

  // 1. Iniciar sesión como Superadmin (Daniel)
  const loginSuper = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "Daniel", contrasenia: "1234" })
  });
  const cookieSuper = loginSuper.headers.get('set-cookie');
  const resSuper = await fetch("http://localhost:3000/api/usuarios/auditoria/logs", {
    headers: { "Cookie": cookieSuper }
  });
  console.log(`1. Superadmin (Daniel) audit logs status: ${resSuper.status}`);

  // 2. Iniciar sesión como Admin (admin_carlos)
  const loginAdmin = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "admin_carlos", contrasenia: "1234" })
  });
  const cookieAdmin = loginAdmin.headers.get('set-cookie');
  const resAdmin = await fetch("http://localhost:3000/api/usuarios/auditoria/logs", {
    headers: { "Cookie": cookieAdmin }
  });
  console.log(`2. Admin (admin_carlos) audit logs status: ${resAdmin.status}`);

  console.log("✅ Prueba de logs de auditoría completada con éxito.");
}

testAuditLogs().catch(console.error);

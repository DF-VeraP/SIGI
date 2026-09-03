const app = require('../server');
const http = require('http');

async function testApp() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log("Server test running on port", port);

  // Login as admin_carlos
  const loginRes = await fetch(`http://localhost:${port}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "admin_carlos", contrasenia: "1234" })
  });
  const cookie = loginRes.headers.get('set-cookie');

  // Request audit logs
  const logsRes = await fetch(`http://localhost:${port}/api/usuarios/auditoria/logs`, {
    headers: { "Cookie": cookie }
  });
  console.log("Status de logs con admin_carlos en nuevo proceso:", logsRes.status);
  
  server.close();
}

testApp().catch(console.error);

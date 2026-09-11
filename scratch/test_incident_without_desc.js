const http = require('http');

const PORT = 3000;

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, cookies, data: parsed });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, cookies, data });
        }
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  console.log("==================================================================");
  console.log("🧪 PRUEBA BACKEND: REGISTRO DE INCIDENTE SIN DESCRIPCIÓN (ADMIN)");
  console.log("==================================================================\n");

  try {
    // 1. Iniciar sesión como SuperAdmin 'Daniel'
    console.log("1️⃣ Iniciando sesión como 'Daniel' (superadmin)...");
    const loginRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { usuario: 'Daniel', contrasenia: '1234' });

    console.log(`   Status Login: ${loginRes.status}`);
    console.log(`   Respuesta Login:`, loginRes.data);
    const cookie = loginRes.cookies ? loginRes.cookies[0].split(';')[0] : null;
    console.log(`   Cookie de sesión: ${cookie ? 'Obtenida ✅' : 'No obtenida ❌'}\n`);

    if (loginRes.status !== 200 || !cookie) {
      throw new Error("No se pudo iniciar sesión como admin/superadmin");
    }

    // 2. Probar Caso 1: Enviar formulario tal como lo envía admin.js con descripción vacía ("")
    console.log("2️⃣ Caso 1: Enviando POST /registrarIncidente con descripcion: \"\" (string vacío, como lo hace admin.js)...");
    const payloadVacio = {
      tipo: 1,
      fecha: '2026-09-10',
      hora: '14:00',
      lat: 2.4419,
      lng: -76.6063,
      descripcion: ''
    };
    console.log("   Payload enviado:", payloadVacio);

    const resCaso1 = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/registrarIncidente',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    }, payloadVacio);

    console.log(`   --> Status recibido: ${resCaso1.status}`);
    console.log(`   --> Body recibido:`, resCaso1.data);
    console.log("\n------------------------------------------------------------------\n");

    // 3. Probar Caso 2: Enviar POST /registrarIncidente omitiendo por completo el campo descripcion
    console.log("3️⃣ Caso 2: Enviando POST /registrarIncidente SIN la propiedad descripcion...");
    const payloadSinDesc = {
      tipo: 1,
      fecha: '2026-09-10',
      hora: '14:00',
      lat: 2.4419,
      lng: -76.6063
    };
    console.log("   Payload enviado:", payloadSinDesc);

    const resCaso2 = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/registrarIncidente',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    }, payloadSinDesc);

    console.log(`   --> Status recibido: ${resCaso2.status}`);
    console.log(`   --> Body recibido:`, resCaso2.data);
    console.log("\n------------------------------------------------------------------\n");

    // 4. Probar Caso 3: Probar el endpoint alternativo /api/incidentes con descripcion vacía
    console.log("4️⃣ Caso 3: Enviando POST /api/incidentes con descripcion: \"\"...");
    const resCaso3 = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/incidentes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    }, payloadVacio);

    console.log(`   --> Status recibido: ${resCaso3.status}`);
    console.log(`   --> Body recibido:`, resCaso3.data);
    console.log("\n------------------------------------------------------------------\n");

    // 5. Probar Caso 4: Enviar con todos los campos incluyendo descripción para verificar que con descripción SÍ funciona
    console.log("5️⃣ Caso 4: Enviando POST /registrarIncidente CON descripción...");
    const payloadConDesc = {
      tipo: 1,
      fecha: '2026-09-10',
      hora: '14:00',
      lat: 2.4419,
      lng: -76.6063,
      descripcion: 'Incidente de prueba de integración'
    };

    const resCaso4 = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/registrarIncidente',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    }, payloadConDesc);

    console.log(`   --> Status recibido: ${resCaso4.status}`);
    console.log(`   --> Body recibido:`, resCaso4.data);
    console.log("\n==================================================================");

  } catch (err) {
    console.error("Error durante la prueba:", err);
  }
}

runTest();

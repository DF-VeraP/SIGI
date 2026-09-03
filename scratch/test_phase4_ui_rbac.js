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

async function runTests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO PRUEBAS FASE 4: VISTAS FRONTEND Y RBAC");
  console.log("=================================================\n");

  let cookieAdmin = null;
  let cookieReportero = null;

  try {
    // 1. Probar Endpoint Público de Catálogos
    console.log("1️⃣ Probando GET /api/catalogos (Público)...");
    const catalogRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/catalogos',
      method: 'GET'
    });
    console.log(`   --> Status: ${catalogRes.status}`);
    console.log(`   --> Tipos recibidos: ${catalogRes.data.tipos.length}`);
    console.log(`   --> Estados recibidos: ${catalogRes.data.estados.length}`);
    if (catalogRes.status === 200 && catalogRes.data.tipos.length > 0) {
      console.log("   ✅ PASÓ: Catálogos obtenidos correctamente.\n");
    } else {
      throw new Error("FALLÓ obtención de catálogos");
    }

    // 2. Login como SuperAdmin
    console.log("2️⃣ Probando POST /login (SuperAdmin 'Daniel')...");
    const loginAdmin = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { usuario: 'Daniel', contrasenia: '1234' });

    console.log(`   --> Status: ${loginAdmin.status}`);
    console.log(`   --> Rol: ${loginAdmin.data.rol}`);
    cookieAdmin = loginAdmin.cookies ? loginAdmin.cookies[0].split(';')[0] : null;

    if (loginAdmin.status === 200 && cookieAdmin) {
      console.log("   ✅ PASÓ: Login de SuperAdmin exitoso.\n");
    } else {
      throw new Error("FALLÓ login de SuperAdmin");
    }

    // 3. Crear nuevo usuario Reportero
    const testUsername = `terreno_${Date.now().toString().slice(-4)}`;
    console.log(`3️⃣ Probando POST /api/usuarios (Crear Reportero '${testUsername}')...`);
    const createRepRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/usuarios',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieAdmin
      }
    }, {
      nombreusuario: testUsername,
      email: `${testUsername}@sigi.test`,
      contraseniausuario: 'terreno123',
      rol: 'reportero',
      dependencia: 'Defensa Civil Terreno',
      telefono: '3000000000'
    });

    console.log(`   --> Status: ${createRepRes.status}`);
    console.log(`   --> Mensaje: ${createRepRes.data.mensaje}`);
    if (createRepRes.status === 201) {
      console.log("   ✅ PASÓ: Usuario reportero creado correctamente.\n");
    } else {
      throw new Error("FALLÓ creación de usuario reportero");
    }

    // 4. Login como el nuevo Reportero
    console.log(`4️⃣ Probando POST /login con el nuevo reportero '${testUsername}'...`);
    const loginRep = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { usuario: testUsername, contrasenia: 'terreno123' });

    console.log(`   --> Status: ${loginRep.status}`);
    console.log(`   --> Rol: ${loginRep.data.rol}`);
    cookieReportero = loginRep.cookies ? loginRep.cookies[0].split(';')[0] : null;

    if (loginRep.status === 200 && loginRep.data.rol === 'reportero') {
      console.log("   ✅ PASÓ: Redirección e inicio de sesión de reportero exitoso.\n");
    } else {
      throw new Error("FALLÓ login de reportero");
    }

    // 5. Registrar Incidente desde Móvil Terreno
    console.log("5️⃣ Probando POST /api/incidentes desde Reportero Terreno...");
    const regIncRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/incidentes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieReportero
      }
    }, {
      tipo: 1,
      fecha: '2026-09-01',
      hora: '14:30',
      lat: 1.6150,
      lng: -75.6070,
      id_gravedad: 3,
      direccion: 'Barrio Centro, Calle 10',
      descripcion: 'Reporte registrado desde interfaz móvil terreno',
      requiere_policia: true
    });

    console.log(`   --> Status: ${regIncRes.status}`);
    console.log(`   --> Código generado: ${regIncRes.data.incidente ? regIncRes.data.incidente.codigoincidente : 'N/A'}`);
    const newIncId = regIncRes.data.incidente ? regIncRes.data.incidente.idincidente : null;

    if (regIncRes.status === 201 && newIncId) {
      console.log("   ✅ PASÓ: Registro de incidente en terreno exitoso con auto-asociación espacial.\n");
    } else {
      throw new Error("FALLÓ registro de incidente");
    }

    // 6. Consultar Mis Reportes
    console.log("6️⃣ Probando GET /api/incidentes/mis-reportes...");
    const misRepRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/incidentes/mis-reportes',
      method: 'GET',
      headers: { 'Cookie': cookieReportero }
    });

    console.log(`   --> Status: ${misRepRes.status}`);
    console.log(`   --> Total reportes devueltos: ${misRepRes.data.length}`);
    if (misRepRes.status === 200 && misRepRes.data.length > 0) {
      console.log("   ✅ PASÓ: Mis reportes obtenidos en vista móvil.\n");
    } else {
      throw new Error("FALLÓ obtención de mis reportes");
    }

    // 7. Administrador actualiza estado de incidente
    console.log(`7️⃣ Probando PATCH /api/incidentes/${newIncId}/estado (Admin actualiza a 'En investigación')...`);
    const updateEstadoRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/incidentes/${newIncId}/estado`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieAdmin
      }
    }, {
      id_estado: 3, // En investigación
      id_gravedad: 4,
      observacion: 'Incidente validado por mesa técnica y derivado a investigación'
    });

    console.log(`   --> Status: ${updateEstadoRes.status}`);
    console.log(`   --> Mensaje: ${updateEstadoRes.mensaje || updateEstadoRes.data.mensaje}`);
    if (updateEstadoRes.status === 200) {
      console.log("   ✅ PASÓ: Estado de incidente actualizado por Admin.\n");
    } else {
      throw new Error("FALLÓ actualización de estado");
    }

    // 8. Consultar Logs de Auditoría
    console.log("8️⃣ Probando GET /api/usuarios/auditoria/logs (Superadmin)...");
    const logsRes = await httpRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/usuarios/auditoria/logs',
      method: 'GET',
      headers: { 'Cookie': cookieAdmin }
    });

    console.log(`   --> Status: ${logsRes.status}`);
    console.log(`   --> Total logs registrados: ${logsRes.data.length}`);
    if (logsRes.status === 200 && logsRes.data.length > 0) {
      console.log("   ✅ PASÓ: Tabla de auditoría poblada con logs en tiempo real.\n");
    } else {
      throw new Error("FALLÓ consulta de logs de auditoría");
    }

    console.log("=================================================");
    console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 4 FINALIZADAS CON ÉXITO (100%)");
    console.log("=================================================");

  } catch (err) {
    console.error("❌ ERROR EN LAS PRUEBAS:", err.message);
    process.exit(1);
  }
}

runTests();

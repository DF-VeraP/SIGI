/**
 * SIGI — Servicio de Envío de Correos Electrónicos
 * Soporta configuración SMTP real y fallback seguro para entornos de desarrollo.
 */

const nodemailer = require('nodemailer');

// Obtener la URL base de la aplicación a partir de la solicitud o del entorno
function getBaseUrl(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (req) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
  }
  return 'http://localhost:3000';
}

// Configuración del transporte de correo
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Si existen credenciales SMTP configuradas, usamos el transporte real
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });
  }

  // Fallback para desarrollo: simular envío en consola
  return {
    sendMail: async (mailOptions) => {
      console.log('\n======================================================');
      console.log('📧 [SIMULADOR DE CORREO SIGI - MODO DESARROLLO]');
      console.log(`📨 Para: ${mailOptions.to}`);
      console.log(`📌 Asunto: ${mailOptions.subject}`);
      if (mailOptions.text) {
        console.log(`📝 Texto:\n${mailOptions.text}`);
      }
      console.log('------------------------------------------------------');
      console.log('ℹ️ Para enviar correos reales, configura SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
      console.log('======================================================\n');
      return { messageId: 'simulated-' + Date.now() };
    }
  };
}

/**
 * Enviar correo para restablecimiento de contraseña
 */
async function enviarEmailRecuperacion(email, nombreusuario, token, req) {
  const baseUrl = getBaseUrl(req);
  const resetLink = `${baseUrl}/login/reset-password.html?token=${token}`;
  const from = process.env.SMTP_FROM || '"SIGI Notificaciones" <no-reply@sigi.gov.co>';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e3a8a, #0284c7); padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; color: #bae6fd; font-size: 13px; font-weight: 500; text-transform: uppercase; }
        .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
        .highlight { color: #38bdf8; font-weight: 600; }
        .btn-wrapper { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(2,132,199,0.4); }
        .warning { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #fcd34d; margin: 20px 0; }
        .link-alt { word-break: break-all; font-size: 12px; color: #64748b; margin-top: 15px; }
        .footer { background: #0b1120; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SIGI — Plataforma de Incidentes</h1>
          <p>Solicitud de Restablecimiento de Contraseña</p>
        </div>
        <div class="content">
          <p>Hola <span class="highlight">${nombreusuario}</span>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña asociada a tu cuenta institucional en SIGI.</p>
          <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
          <div class="btn-wrapper">
            <a href="${resetLink}" class="btn" target="_blank">Restablecer Contraseña</a>
          </div>
          <div class="warning">
            ⚠️ <strong>Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por motivos de seguridad. Si tú no realizaste esta solicitud, puedes ignorar este mensaje; tu contraseña actual continuará siendo segura.
          </div>
          <p class="link-alt">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${resetLink}</p>
        </div>
        <div class="footer">
          SIGI © ${new Date().getFullYear()} — Sistema de Información Geográfica de Incidentes
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: 'Recuperación de Contraseña — SIGI',
    text: `Hola ${nombreusuario},\n\nRecibimos una solicitud para restablecer tu contraseña en SIGI. Visita el siguiente enlace para crear una nueva (expira en 1 hora):\n\n${resetLink}\n\nSi no realizaste esta solicitud, ignora este correo.`,
    html
  };

  const transporter = getTransporter();
  return transporter.sendMail(mailOptions);
}

/**
 * Enviar correo de bienvenida al crear un nuevo usuario
 */
async function enviarEmailBienvenida(email, nombreusuario, passwordTemporal, req) {
  const baseUrl = getBaseUrl(req);
  const loginLink = `${baseUrl}/login/index.html`;
  const from = process.env.SMTP_FROM || '"SIGI Notificaciones" <no-reply@sigi.gov.co>';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #059669, #0284c7); padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500; text-transform: uppercase; }
        .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
        .credentials-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
        .cred-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .cred-label { color: #94a3b8; }
        .cred-value { font-weight: 700; color: #38bdf8; font-family: monospace; font-size: 15px; }
        .btn-wrapper { text-align: center; margin: 26px 0 16px 0; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(2,132,199,0.4); }
        .notice { background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #bae6fd; margin: 20px 0; }
        .footer { background: #0b1120; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bienvenido a SIGI</h1>
          <p>Credenciales de Acceso a la Plataforma</p>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${nombreusuario}</strong>,</p>
          <p>Tu cuenta de acceso institucional al Sistema de Información Geográfica de Incidentes (SIGI) ha sido creada exitosamente por el administrador.</p>
          <div class="credentials-card">
            <div class="cred-row">
              <span class="cred-label">Usuario / Correo:</span>
              <span class="cred-value">${email}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Contraseña Temporal:</span>
              <span class="cred-value">${passwordTemporal}</span>
            </div>
          </div>
          <div class="notice">
            🔒 <strong>Política de Seguridad:</strong> Al iniciar sesión por primera vez, el sistema te solicitará obligatoriamente cambiar esta contraseña temporal por una contraseña personal de tu elección.
          </div>
          <div class="btn-wrapper">
            <a href="${loginLink}" class="btn" target="_blank">Acceder a SIGI</a>
          </div>
        </div>
        <div class="footer">
          SIGI © ${new Date().getFullYear()} — Sistema de Información Geográfica de Incidentes
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: 'Bienvenido a SIGI — Tus credenciales de acceso',
    text: `Estimado/a ${nombreusuario},\n\nTu cuenta en SIGI ha sido creada. Tus credenciales son:\n- Usuario / Correo: ${email}\n- Contraseña temporal: ${passwordTemporal}\n\nPor seguridad, al iniciar sesión por primera vez se te solicitará cambiar tu contraseña.\nAccede aquí: ${loginLink}`,
    html
  };

  const transporter = getTransporter();
  return transporter.sendMail(mailOptions);
}

module.exports = {
  enviarEmailRecuperacion,
  enviarEmailBienvenida
};

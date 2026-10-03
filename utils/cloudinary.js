const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuración opcional desde variables de entorno
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Sube una imagen a Cloudinary. Si no están configuradas las credenciales,
 * guarda la imagen localmente en public/uploads/incidentes como fallback.
 * @param {Buffer} fileBuffer Buffer del archivo a subir
 * @param {string} codigoIncidente Código del incidente para nombrar el archivo
 * @param {string} originalName Nombre original del archivo
 * @returns {Promise<string>} URL pública resultante
 */
async function subirImagenCloudinary(fileBuffer, codigoIncidente, originalName = 'foto.jpg') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const tieneCredenciales = !!(cloudName && apiKey && apiSecret && cloudName !== 'tu_cloud_name');

  if (tieneCredenciales) {
    cloudinary.config({
      cloud_name: cloudName
    });

    const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'sigi_preset';
    const ext = (path.extname(originalName) || '.jpg').toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';

    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    try {
      const res = await cloudinary.uploader.unsigned_upload(dataUri, preset, {
        folder: 'sigi_incidentes',
        public_id: codigoIncidente || `INC_${Date.now()}`
      });
      console.log('☁️ ¡Imagen subida con ÉXITO TOTAL a Cloudinary! URL:', res.secure_url);
      return res.secure_url;
    } catch (error) {
      console.error('⚠️ Error al subir a Cloudinary, guardando en fallback local:', error.message);
      return guardarLocalFallback(fileBuffer, codigoIncidente, originalName);
    }
  } else {
    return guardarLocalFallback(fileBuffer, codigoIncidente, originalName);
  }
}

/**
 * Guardado local de respaldo si no hay credenciales de Cloudinary
 */
async function guardarLocalFallback(fileBuffer, codigoIncidente, originalName) {
  const ext = path.extname(originalName) || '.jpg';
  const nombreArchivo = `${codigoIncidente || 'INC_' + Date.now()}${ext}`;
  const carpetaUploads = path.join(__dirname, '..', 'public', 'uploads', 'incidentes');

  if (!fs.existsSync(carpetaUploads)) {
    fs.mkdirSync(carpetaUploads, { recursive: true });
  }

  const rutaCompleta = path.join(carpetaUploads, nombreArchivo);
  fs.writeFileSync(rutaCompleta, fileBuffer);
  
  const urlRelativa = `/uploads/incidentes/${nombreArchivo}`;
  console.log('📁 Imagen guardada en almacenamiento local:', urlRelativa);
  return urlRelativa;
}

/**
 * Elimina una imagen de Cloudinary (o localmente en fallback).
 * Extrae el public_id de la URL de Cloudinary para poder borrarla.
 * @param {string} imagenUrl URL pública almacenada en la BD
 * @returns {Promise<boolean>} true si se eliminó, false si hubo error
 */
async function eliminarImagenCloudinary(imagenUrl) {
  if (!imagenUrl) return true;

  // Si es imagen local (fallback), eliminar del disco
  if (!imagenUrl.includes('cloudinary.com')) {
    try {
      const rutaLocal = path.join(__dirname, '..', 'public', imagenUrl.replace(/^\//, ''));
      if (fs.existsSync(rutaLocal)) {
        fs.unlinkSync(rutaLocal);
        console.log('🗑️ Imagen local eliminada:', rutaLocal);
      }
      return true;
    } catch (e) {
      console.error('Error eliminando imagen local:', e.message);
      return false;
    }
  }

  // Si es Cloudinary: extraer public_id de la URL
  // Formato: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<public_id>.<ext>
  try {
    const match = imagenUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!match) {
      console.warn('⚠️ No se pudo extraer public_id de:', imagenUrl);
      return false;
    }
    const publicId = match[1]; // ej: sigi_incidentes/RO2309...
    const resultado = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Imagen Cloudinary eliminada:', publicId, '→', resultado.result);
    return resultado.result === 'ok' || resultado.result === 'not found';
  } catch (e) {
    console.error('Error eliminando imagen de Cloudinary:', e.message);
    return false;
  }
}

module.exports = {
  subirImagenCloudinary,
  eliminarImagenCloudinary
};

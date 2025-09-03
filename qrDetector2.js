const sharp = require('sharp');

// decodeQR from 'qr' is an ESM module; use dynamic import from CJS
async function decodeWithQr(image) {
  const mod = await import('qr/decode.js');
  const decodeQR = mod.default || mod;
  return decodeQR(image);
}

async function checkForQRCode(imagePath) {
  try {
    const image = await getImageFromPath(imagePath);
    const bitmap = await convertImageToBitmap(image);
    const qrResult = await decodeWithQr(bitmap);
    return Boolean(qrResult);
  } catch (err) {
    console.error(`Error processing ${imagePath}:`, err.message || err);
    return false;
  }
}

async function getImageFromPath(imagePath) {
  // Load image via Sharp and return raw RGBA buffer + dimensions
  const { data, info } = await sharp(imagePath)
    .ensureAlpha() // guarantee 4 channels
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

async function convertImageToBitmap(image) {
  // qr.decode expects { width, height, data } with RGBA by default
  // Sharp already provides RGBA (4 channels) due to ensureAlpha()
  // Buffer is a Uint8Array; pass through as-is
  const { width, height, data } = image;
  return { width, height, data };
}

module.exports = { checkForQRCode };

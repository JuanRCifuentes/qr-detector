const jsQR = require('jsqr');

function detectJsqr(img) {
    const imageData = {
        data: new Uint8ClampedArray(img.bitmap.data),
        width: img.bitmap.width,
        height: img.bitmap.height,
    };
    return jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
}

module.exports = { detectQR: detectJsqr };

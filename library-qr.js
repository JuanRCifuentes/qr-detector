const {Jimp} = require('jimp');
const jsQR = require('jsqr');

function decodeFromJimpImage(img) {
    const imageData = {
        data: new Uint8ClampedArray(img.bitmap.data),
        width: img.bitmap.width,
        height: img.bitmap.height,
    };
    return jsQR(imageData.data, imageData.width, imageData.height, {inversionAttempts: 'attemptBoth'});
}

function applyThreshold(src, threshold) {
    const img = src.clone();
    const {width, height, data} = img.bitmap;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const v = data[idx];
            const val = v >= threshold ? 255 : 0;
            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
        }
    }
    return img;
}

async function checkForQRCode(imagePath) {
    try {
        const base = await Jimp.read(imagePath);
        base.greyscale();

        const angles = [0, -2, 2, -5, 5, -10, 10, -15, 15];

        for (const angle of angles) {
            const rotated = base.clone().rotate(angle, false);
            const variants = [
                () => rotated,
                () => rotated.clone().contrast(0.5),
                () => rotated.clone().normalize(),
                () => applyThreshold(rotated, 128),
                () => applyThreshold(rotated, 180),
                () => applyThreshold(rotated.clone().blur(1), 140),
            ];
            for (const make of variants) {
                const attempt = make();
                const qr = decodeFromJimpImage(attempt);
                if (qr && qr.data) return qr.data;
            }
        }

        // If small image, upscale and try again
        const shouldScaleUp = Math.max(base.bitmap.width, base.bitmap.height) < 1000;
        if (shouldScaleUp) {
            const scaled = base.clone().scale(2);
            for (const angle of angles) {
                const rotated = scaled.clone().rotate(angle, false);
                const variants = [
                    () => rotated,
                    () => rotated.clone().contrast(0.5),
                    () => rotated.clone().normalize(),
                    () => applyThreshold(rotated, 128),
                    () => applyThreshold(rotated, 180),
                    () => applyThreshold(rotated.clone().blur(1), 140),
                ];
                for (const make of variants) {
                    const attempt = make();
                    const qr = decodeFromJimpImage(attempt);
                    if (qr && qr.data) return qr.data;
                }
            }
        }

        return null;
    } catch (err) {
        console.error(`Error processing ${imagePath}:`, err.message || err);
        return null;
    }
}

module.exports = {checkForQRCode};

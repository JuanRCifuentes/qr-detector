const { Jimp } = require('jimp');

function applyThreshold(src, threshold) {
    const img = src.clone();
    const { width, height, data } = img.bitmap;
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

function buildVariantsFor(baseImage, prefix) {
    return [
        { label: `${prefix} base image`, make: () => baseImage },
        { label: `${prefix} contrast+`, make: () => baseImage.clone().contrast(0.5) },
        { label: `${prefix} normalize`, make: () => baseImage.clone().normalize() },
        { label: `${prefix} thr128`, make: () => applyThreshold(baseImage, 128) },
        { label: `${prefix} thr180`, make: () => applyThreshold(baseImage, 180) },
        { label: `${prefix} blur1+thr140`, make: () => applyThreshold(baseImage.clone().blur(1), 140) },
    ];
}

function shouldScaleUp(base) {
    return Math.max(base.bitmap.width, base.bitmap.height) < 1000;
}

async function getPreparedVariants(imagePath) {
    const base = await Jimp.read(imagePath);
    base.greyscale();

    const attempts = [];

    const variants = buildVariantsFor(base, '');
    for (const v of variants) {
        attempts.push({ label: v.label, image: v.make() });
    }

    if (shouldScaleUp(base)) {
        const scaled = base.clone().scale(2);
        const variants = buildVariantsFor(scaled, `scaled 2x`);
        for (const v of variants) {
            attempts.push({ label: v.label, image: v.make() });
        }
    }

    return attempts;
}

async function makeAttempts(imagePath, detectQRFunction) {
    try {
        const attempts = await getPreparedVariants(imagePath);
        let attemptsCount = 0;
        for (const {label, image} of attempts) {
            const qr = detectQRFunction(image);
            if (qr && qr.data) {
                console.log(`Found QR code in attempt #: ${attemptsCount + 1}, ${label}.`);
                return qr.data;
            }
            attemptsCount += 1;
        }
        return null;
    } catch (err) {
        console.error(`Error processing ${imagePath}:`, err.message || err);
        return null;
    }
}

module.exports = {
    makeAttempts,
};

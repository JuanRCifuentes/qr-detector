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

function buildVariantsFor(baseImage) {
    return [
        { label: 'base image', make: () => baseImage },
        { label: 'contrast+', make: () => baseImage.clone().contrast(0.5) },
        { label: 'normalize', make: () => baseImage.clone().normalize() },
        { label: 'thr128', make: () => applyThreshold(baseImage, 128) },
        { label: 'thr180', make: () => applyThreshold(baseImage, 180) },
        { label: 'blur1+thr140', make: () => applyThreshold(baseImage.clone().blur(1), 140) },
    ];
}

function shouldScaleUp(base) {
    return Math.max(base.bitmap.width, base.bitmap.height) < 1000;
}

async function getPreparedVariants(imagePath) {
    const base = await Jimp.read(imagePath);
    base.greyscale();

    const attempts = [];

    const variants = buildVariantsFor(base, `angle ${0}°`);
    for (const v of variants) {
        attempts.push({ label: v.label, image: v.make() });
    }

    if (shouldScaleUp(base)) {
        const scaled = base.clone().scale(2);
        const variants = buildVariantsFor(scaled, `scaled 2x, angle ${0}°`);
        for (const v of variants) {
            attempts.push({ label: v.label, image: v.make() });
        }
    }

    console.log(`Found ${attempts.length} variants.`);
    return attempts;
}

module.exports = {
    getPreparedVariants,
    applyThreshold, // exported in case of future need
};

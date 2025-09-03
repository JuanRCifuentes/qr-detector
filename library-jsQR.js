const {Jimp} = require('jimp');
const jsQR = require('jsqr');

function decodeFromJimpImage(img) {
    const imageData = {
        data: new Uint8ClampedArray(img.bitmap.data),
        width: img.bitmap.width,
        height: img.bitmap.height,
    };

    return jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {inversionAttempts: 'attemptBoth'}
    );
}

function applyThreshold(src, threshold) {
    const img = src.clone();
    const {width, height, data} = img.bitmap;
    // Assumes grayscale input for best results
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const v = data[idx]; // r channel
            const val = v >= threshold ? 255 : 0;
            data[idx] = val;     // r
            data[idx + 1] = val; // g
            data[idx + 2] = val; // b
            // alpha unchanged
        }
    }
    return img;
}

async function checkForQRCode(imagePath) {
    try {
        const base = await Jimp.read(imagePath);
        // Working copy in grayscale to reduce noise across attempts
        base.greyscale();

        // Small angle set to tolerate slight inclinations
        const angles = [0, -2, 2, -5, 5, -10, 10, -15, 15];

        // Try the original size first
        for (const angle of angles) {
            const rotated = base.clone().rotate(angle, false);

            const variants = [
                {label: `angle ${angle}°`, make: () => rotated},
                {label: `angle ${angle}°, contrast+`, make: () => rotated.clone().contrast(0.5)},
                {label: `angle ${angle}°, normalize`, make: () => rotated.clone().normalize()},
                {label: `angle ${angle}°, thr128`, make: () => applyThreshold(rotated, 128)},
                {label: `angle ${angle}°, thr180`, make: () => applyThreshold(rotated, 180)},
                {label: `angle ${angle}°, blur1+thr140`, make: () => applyThreshold(rotated.clone().blur(1), 140)},
            ];

            for (const v of variants) {
                const attempt = v.make();
                const qrResult = decodeFromJimpImage(attempt);
                if (qrResult) {
                    console.log(`QR code detected! Content: ${qrResult.data} (${v.label})`);
                    return true;
                }
            }
        }

        // If still not found, try a scaled-up pass to help with low-res images
        const shouldScaleUp = Math.max(base.bitmap.width, base.bitmap.height) < 1000;
        if (shouldScaleUp) {
            const scaled = base.clone().scale(2);
            for (const angle of angles) {
                const rotated = scaled.clone().rotate(angle, false);

                const variants = [
                    {label: `scaled 2x, angle ${angle}°`, make: () => rotated},
                    {label: `scaled 2x, angle ${angle}°, contrast+`, make: () => rotated.clone().contrast(0.5)},
                    {label: `scaled 2x, angle ${angle}°, normalize`, make: () => rotated.clone().normalize()},
                    {label: `scaled 2x, angle ${angle}°, thr128`, make: () => applyThreshold(rotated, 128)},
                    {label: `scaled 2x, angle ${angle}°, thr180`, make: () => applyThreshold(rotated, 180)},
                    {
                        label: `scaled 2x, angle ${angle}°, blur1+thr140`,
                        make: () => applyThreshold(rotated.clone().blur(1), 140)
                    },
                ];

                for (const v of variants) {
                    const attempt = v.make();
                    const qrResult = decodeFromJimpImage(attempt);
                    if (qrResult) {
                        console.log(`QR code detected! Content: ${qrResult.data} (${v.label})`);
                        return true;
                    }
                }
            }
        }

        console.log(`No QR code found in: ${imagePath}`);
        return false;
    } catch (error) {
        console.error(`Error checking QR code in ${imagePath}:`, error.message);
        return false;
    }
}

module.exports = {checkForQRCode};

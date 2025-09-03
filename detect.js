const path = require('path');
const { promises: fs } = require('fs');
const {Jimp} = require('jimp');
const jsQR = require('jsqr');

const IMAGES_FOLDER = path.resolve(__dirname, 'images');

function decodeFromJimpImage(img) {
    // Build ImageData-compatible object for jsQR
    const imageData = {
        data: new Uint8ClampedArray(img.bitmap.data),
        width: img.bitmap.width,
        height: img.bitmap.height,
    };

    return jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        { inversionAttempts: 'attemptBoth' }
    );
}

async function checkForQRCode(imagePath) {
    try {
        const base = await Jimp.read(imagePath);
        // Working copy in grayscale to reduce noise across attempts
        base.greyscale();

        // Small angle set to tolerate slight inclinations
        const angles = [0, -5, 5, -10, 10, -15, 15];

        // Try the original size first
        for (const angle of angles) {
            const rotated = base.clone().rotate(angle, false);

            let qrResult = decodeFromJimpImage(rotated);
            if (qrResult) {
                console.log(`QR code detected! Content: ${qrResult.data} (angle ${angle}°)`);
                return true;
            }

            // Try a mild contrast boost which often helps binarization
            const contrasted = rotated.clone().contrast(0.5);
            qrResult = decodeFromJimpImage(contrasted);
            if (qrResult) {
                console.log(`QR code detected! Content: ${qrResult.data} (angle ${angle}°, contrast+)`);
                return true;
            }
        }

        // If still not found, try a scaled-up pass to help with low-res images
        const shouldScaleUp = Math.max(base.bitmap.width, base.bitmap.height) < 1000;
        if (shouldScaleUp) {
            const scaled = base.clone().scale(2);
            for (const angle of angles) {
                const rotated = scaled.clone().rotate(angle, false);

                let qrResult = decodeFromJimpImage(rotated);
                if (qrResult) {
                    console.log(`QR code detected! Content: ${qrResult.data} (scaled 2x, angle ${angle}°)`);
                    return true;
                }

                const contrasted = rotated.clone().contrast(0.5);
                qrResult = decodeFromJimpImage(contrasted);
                if (qrResult) {
                    console.log(`QR code detected! Content: ${qrResult.data} (scaled 2x, angle ${angle}°, contrast+)`);
                    return true;
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

async function scanFolderForPNGs(folderPath = IMAGES_FOLDER) {
    try {
        const entries = await fs.readdir(folderPath, { withFileTypes: true });
        const pngFiles = entries
            .filter((e) => e.isFile())
            .filter((e) => ['.png'].includes(path.extname(e.name).toLowerCase()))
            .map((e) => path.join(folderPath, e.name));

        if (pngFiles.length === 0) {
            console.log(`No PNG files found in: ${folderPath}`);
            return;
        }

        let detectedCount = 0;
        for (const file of pngFiles) {
            const detected = await checkForQRCode(file);
            if (detected) detectedCount += 1;
        }

        console.log(`Finished scanning. ${detectedCount}/${pngFiles.length} PNG(s) had QR codes.`);
    } catch (err) {
        console.error(`Failed to scan folder ${folderPath}:`, err.message);
    }
}

if (require.main === module) {
    scanFolderForPNGs().catch((e) => {
        console.error('Unexpected error:', e);
        process.exitCode = 1;
    });
}
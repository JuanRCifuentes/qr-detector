const path = require('path');
const { promises: fs } = require('fs');
const { checkForQRCode } = require('./qrDetector2');

const IMAGES_FOLDER = path.resolve(__dirname, 'images');
const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg'];

async function main(folderPath = IMAGES_FOLDER) {
    const startTime = process.hrtime.bigint();

    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const imageFiles = entries
        .filter((e) => e.isFile())
        .map((e) => path.join(folderPath, e.name))
        .filter((p) => ALLOWED_EXTS.includes(path.extname(p).toLowerCase()));

    if (imageFiles.length === 0) {
        console.log(`No image files (${ALLOWED_EXTS.join(', ')}) found in: ${folderPath}`);
    }

    let detectedCount = 0;
    for (const file of imageFiles) {
        const hasQR = await checkForQRCode(file);
        console.log(`${path.basename(file)}: ${hasQR ? 'QR found' : 'No QR'}`);
        if (hasQR) detectedCount += 1;
    }

    const endTime = process.hrtime.bigint();
    const elapsedMs = Number(endTime - startTime) / 1e6;
    console.log(`Summary: ${detectedCount}/${imageFiles.length} image(s) with QR.`);
    console.log(`Total time: ${(elapsedMs / 1000).toFixed(3)}s (${elapsedMs.toFixed(0)} ms)`);
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Error running detection:', err.message || err);
        process.exitCode = 1;
    });
}
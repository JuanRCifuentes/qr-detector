const path = require('path');
const {promises: fs} = require('fs');
const qrLib = require('./library-qr');

function getQRChosenMethod() {
    return qrLib && qrLib.checkForQRCode;
    // return typeof qrFunc === 'function' ? qrFunc : jsqrFunc;
}

async function getImages(imagesFolder, allowedExtensions) {
    const entries = await fs.readdir(imagesFolder, {withFileTypes: true});
    const imageFiles = entries
        .filter((e) => e.isFile())
        .map((e) => path.join(imagesFolder, e.name))
        .filter((p) => allowedExtensions.includes(path.extname(p).toLowerCase()));

    if (imageFiles.length === 0) {
        console.log(`No image files (${allowedExtensions.join(', ')}) found in: ${imagesFolder}`);
    }

    return imageFiles;
}

async function detectQrInImages(imageFiles, checkQRFunction) {
    if (typeof checkQRFunction !== 'function') {
        throw new Error('checkQRFunction is not a function');
    }
    let detectedCount = 0;
    for (const file of imageFiles) {
        const hasQR = await checkQRFunction(file);
        console.log(`${path.basename(file)}: ${hasQR ? 'QR found' : 'No QR Found'}`);
        if (hasQR) detectedCount += 1;
    }
    return detectedCount;
}

function logResults(times, imageCount) {
    const elapsedTime = Number(times.endTime - times.startTime) / 1e6;
    console.log(`Summary: ${imageCount.detectedCount}/${imageCount.imageFiles.length} image(s) with QR.`);
    console.log(`Total time: ${(elapsedTime / 1000).toFixed(3)}s (${elapsedTime.toFixed(0)} ms)`);
}

module.exports = {
    getImages,
    detectQrInImages,
    logResults,
    getQRChosenMethod,
};
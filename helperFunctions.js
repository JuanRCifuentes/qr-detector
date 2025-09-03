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
        console.error(`No image files (${allowedExtensions.join(', ')}) found in: ${imagesFolder}`);
    }

    return imageFiles;
}

async function iterateImages(imageFiles, checkQRFunction) {
    let detectedCount = 0;
    for (const file of imageFiles) {
        console.log('=====')

        const startTime = process.hrtime.bigint();
        const hasQR = await checkQRFunction(file);
        const endTime = process.hrtime.bigint();

        console.log(`Time for ${path.basename(file)}: ${Number(endTime - startTime) / 1e6}ms`);
        console.log(`${path.basename(file)}: ${hasQR ? 'QR found' : 'No QR Found'}`);

        if (hasQR) detectedCount += 1;
    }
    return detectedCount;
}

function logResults(times, imageCount) {
    const elapsedTime = Number(times.endTime - times.startTime) / 1e6;
    console.log('=====')
    console.log(`Summary: ${imageCount.detectedCount}/${imageCount.imageFiles.length} image(s) with QR.`);
    console.log(`Total time: ${(elapsedTime / 1000).toFixed(3)}s (${elapsedTime.toFixed(0)} ms)`);
}

module.exports = {
    getImages,
    iterateImages,
    logResults,
    getQRChosenMethod,
};
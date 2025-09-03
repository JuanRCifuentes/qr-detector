const path = require('path');
const {promises: fs} = require('fs');
const {getImages, iterateImages, logResults, getQRChosenMethod} = require("./helperFunctions");

const IMAGES_FOLDER = path.resolve(__dirname, 'images');
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

async function main() {
    const startTime = process.hrtime.bigint();

    const imageFiles = await getImages(IMAGES_FOLDER, ALLOWED_EXTENSIONS);

    const chosenMethod = getQRChosenMethod();
    const detectedCount = await iterateImages(imageFiles, chosenMethod);

    const endTime = process.hrtime.bigint();
    logResults({startTime, endTime}, {detectedCount, imageFiles});
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Error running detection:', err.message || err);
        process.exitCode = 1;
    });
}
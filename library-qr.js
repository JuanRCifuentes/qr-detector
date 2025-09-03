const jsQR = require('jsqr');
const { getPreparedVariants } = require('./imagePreprocessor');
const {Jimp} = require("jimp");

function decodeFromJimpImage(img) {
    const imageData = {
        data: new Uint8ClampedArray(img.bitmap.data),
        width: img.bitmap.width,
        height: img.bitmap.height,
    };
    return jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
}

async function checkForQRCode(imagePath) {
    try {
        const attempts = await getPreparedVariants(imagePath);
        let attemptsCount = 0;
        for (const { label, image } of attempts) {
            const qr = decodeFromJimpImage(image);
            if (qr && qr.data) {
                console.log(`Found QR code in attempt #: ${attemptsCount+1}, ${label}.`);
                return qr.data;
            }
            attemptsCount += 1;
        }
        return null;
    } catch (err) {
        console.error(`Error processing ${imagePath}:`, err.message || err);
        return null;
    }

    // const image = await Jimp.read(imagePath);
    // image.greyscale();
    // const qr = decodeFromJimpImage(image);
    // return qr && qr.data;
}

module.exports = { checkForQRCode };

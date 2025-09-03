# QR-Detection

## Image-set
The images are the ones in the `images` folder.

## Variants
1. Base image
2. Contrast 0.5
3. Normalize
4. Threshold 128
5. Threshold 180
6. Blur 1 + Threshold 140

It also scales the image if it's too small, creating another copy for each variant.

## Performance - Intel Core i7-13620H

Attempts with 100% success:

### 1. jimp + jsQR

```
Found 12 variants.
Found QR code in attempt #: 1, base image.
mi_qr.png: QR found
Found 12 variants.
Found QR code in attempt #: 1, base image.
mi_qr2.png: QR found
Found 6 variants.
no-qr1.png: No QR Found
Found 6 variants.
no-qr2.png: No QR Found
Found 6 variants.
no-qr3.png: No QR Found
Found 6 variants.
no-qr4.png: No QR Found
Found 6 variants.
Found QR code in attempt #: 1, base image.
qr1.png: QR found
Found 12 variants.
Found QR code in attempt #: 1, base image.
qr2.png: QR found
Found 6 variants.
Found QR code in attempt #: 2, contrast+.
qr3.png: QR found
Found 6 variants.
Found QR code in attempt #: 6, blur1+thr140.
qr4.png: QR found
Found 6 variants.
Found QR code in attempt #: 6, blur1+thr140.
qr5.png: QR found
Found 6 variants.
Found QR code in attempt #: 6, blur1+thr140.
qr6.png: QR found
Summary: 8/12 image(s) with QR.
```
#### Time to complete the whole test
- 22.620 seconds
- 22.497 seconds
- 22.128 seconds
- 21.748 seconds
- 22.254 seconds

AVERAGE: 22.2494

#### Time to `No QR Found`

- 2.4474 seconds
- 2.6698 seconds
- 2.4731 seconds
- 2.4291 seconds
- 2.5268 seconds

AVERAGE: 2.50924
const Jimp = require('jimp');
const path = require('path');

async function generateLogo(size, fileName) {
    // Create image with orange background #ff6b35
    const image = new Jimp(size, size, 0xff6b35ff);

    // Scale factor
    const s = size / 40;

    // Fill white shapes
    // Circle at cx=20, cy=32, r=2 (scaled)
    const cx = 20 * s;
    const cy = 32 * s;
    const r = 2 * s;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            // Circle check
            if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r) {
                image.setPixelColor(0xffffffff, x, y);
            }

            // House/Arrow shape check (approximate path scaling)
            // Path: M20 8L12 16H16V28H24V16H28L20 8Z
            // Scaled vertices:
            // (20s, 8s), (12s, 16s), (16s, 16s), (16s, 28s), (24s, 28s), (24s, 16s), (28s, 16s)

            // Simplified polygon check for the house shape
            if (isInsideArrow(x, y, s)) {
                image.setPixelColor(0xffffffff, x, y);
            }
        }
    }

    const outputPath = path.join('c:/Users/mukht/Desktop/VS projects/STREAMLUX-main/public', fileName);
    await image.writeAsync(outputPath);
    console.log(`Generated ${fileName} at ${size}x${size}`);
}

function isInsideArrow(px, py, s) {
    // Vertices of the arrow shape scaled
    const v = [
        [20 * s, 8 * s],
        [12 * s, 16 * s],
        [16 * s, 16 * s],
        [16 * s, 28 * s],
        [24 * s, 28 * s],
        [24 * s, 16 * s],
        [28 * s, 16 * s]
    ];

    // Check if point is inside the triangle part or the rectangle part
    // Triangle: (20,8), (12,16), (28,16)
    const isInsideTriangle = isPointInTriangle(px, py, v[0][0], v[0][1], v[1][0], v[1][1], v[6][0], v[6][1]);

    // Rectangle: (16,16), (16,28), (24,28), (24,16)
    const isInsideRect = px >= 16 * s && px <= 24 * s && py >= 16 * s && py <= 28 * s;

    return isInsideTriangle || isInsideRect;
}

function isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const area = 0.5 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
    const s = 1 / (2 * area) * (y1 * x3 - x1 * y3 + (y3 - y1) * px + (x1 - x3) * py);
    const t = 1 / (2 * area) * (x1 * y2 - y1 * x2 + (y1 - y2) * px + (x2 - x1) * py);
    return s > 0 && t > 0 && (1 - s - t) > 0;
}

generateLogo(192, 'logo192.png');
generateLogo(512, 'logo512.png');
generateLogo(192, 'icon.png'); // Overwrite legacy icon.png

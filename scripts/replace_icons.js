
const { Jimp } = require('jimp');
const path = require('path');

const srcIcon = path.resolve(__dirname, '../store_assets/icon.png');
const resDir = path.resolve(__dirname, '../android/app/src/main/res');

const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

async function run() {
    console.log('Loading source icon:', srcIcon);
    const image = await Jimp.read(srcIcon);

    for (const [folder, size] of Object.entries(sizes)) {
        const destDir = path.join(resDir, folder);

        const resized = image.clone().resize({ w: size, h: size });

        await resized.write(path.join(destDir, 'ic_launcher.png'));
        await resized.write(path.join(destDir, 'ic_launcher_round.png'));
        await resized.write(path.join(destDir, 'ic_launcher_foreground.png'));

        console.log(`✅ ${folder} (${size}x${size})`);
    }

    console.log('\nAll icons replaced successfully!');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

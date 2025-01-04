import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ICONS_DIR = 'public/icons';
const SPLASH_DIR = 'public/splash';

// Ensure output directories exist
await fs.mkdir(ICONS_DIR, { recursive: true });
await fs.mkdir(SPLASH_DIR, { recursive: true });

const SOURCE_ICON = 'fuellens.png';

// Standard icons
const standardSizes = [192, 512];

// Generate standard icons
for (const size of standardSizes) {
    // Standard icon
    await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(ICONS_DIR, `icon-${size}.png`));
    
    // Maskable icons (with padding)
    const scaledSize = Math.floor(size * 0.8);  // 80% of the size
    const padding = Math.floor(size * 0.1);     // 10% padding on each side
    
    await sharp(SOURCE_ICON)
        .resize(scaledSize, scaledSize)
        .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 15, g: 118, b: 110, alpha: 1 } // #0f766e
        })
        .toFile(path.join(ICONS_DIR, `icon-${size}-maskable.png`));
}

// Apple Touch Icon (180x180)
await sharp(SOURCE_ICON)
    .resize(180, 180)
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));

// Generate splash screens
const splashScreens = [
    { width: 1290, height: 2796, name: 'apple-splash-1290-2796.jpg' }, // iPhone 14 Pro Max
    { width: 1179, height: 2556, name: 'apple-splash-1179-2556.jpg' }, // iPhone 14 Pro
    { width: 1170, height: 2532, name: 'apple-splash-1170-2532.jpg' }  // iPhone 13/14
];

for (const screen of splashScreens) {
    // Calculate icon size (40% of smaller dimension)
    const iconSize = Math.floor(Math.min(screen.width, screen.height) * 0.4);
    
    // Create a solid color background
    await sharp({
        create: {
            width: screen.width,
            height: screen.height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .composite([{
        input: await sharp(SOURCE_ICON)
            .resize(iconSize)
            .toBuffer(),
        gravity: 'center'
    }])
    .jpeg({ quality: 90 })
    .toFile(path.join(SPLASH_DIR, screen.name));
}

console.log('Generated all icon variants successfully!');

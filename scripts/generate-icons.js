const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const inputSvg = path.join(process.cwd(), 'public', 'icon.svg');
  const publicDir = path.join(process.cwd(), 'public');

  // Read the SVG file
  const svgBuffer = await fs.readFile(inputSvg);

  // Generate PNG icons
  const sizes = [16, 32, 192, 512];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `${size === 16 ? 'favicon-16x16' : size === 32 ? 'favicon-32x32' : `android-chrome-${size}x${size}`}.png`));
  }

  // Generate apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // For favicon.ico, we'll just use the 32x32 PNG version for now
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // Generate Safari pinned tab SVG
  await fs.copyFile(inputSvg, path.join(publicDir, 'safari-pinned-tab.svg'));

  // Generate OG image (1200x630)
  await sharp(svgBuffer)
    .resize(1200, 630)
    .composite([{
      input: Buffer.from(`
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <text x="600" y="400" font-family="Arial Black" font-size="72" fill="#e2e8f0" text-anchor="middle">Atmosphere</text>
          <text x="600" y="480" font-family="Arial" font-size="32" fill="#94a3b8" text-anchor="middle">Global Air Quality Map</text>
        </svg>`),
      top: 0,
      left: 0,
    }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error); 
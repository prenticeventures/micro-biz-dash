/**
 * Create iOS App Icon from SVG favicon
 * Converts favicon.svg to 1024x1024 PNG and places it in the iOS project
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgPath = path.join(rootDir, 'public', 'favicon.svg');
const outputPath = path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'icon-1024.png');

console.log('🎨 Creating iOS App Icon...');
console.log(`Reading: ${svgPath}`);
console.log(`Output: ${outputPath}`);

try {
  // Read the SVG
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Convert to 1024x1024 PNG
  await sharp(svgBuffer)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
    })
    .png()
    .toFile(outputPath);
  
  console.log('✅ App icon created successfully!');
  console.log(`   Saved to: ${outputPath}`);
  console.log('\n📱 Next: Xcode will auto-generate smaller sizes from this 1024x1024 icon.');
} catch (error) {
  console.error('❌ Error creating app icon:', error.message);
  process.exit(1);
}

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const svgPath = join(rootDir, 'public', 'og-image.svg');
const pngPath = join(rootDir, 'public', 'og-image.png');

// If PNG already exists, skip conversion
if (existsSync(pngPath)) {
  console.log('✅ og-image.png already exists, skipping conversion');
  process.exit(0);
}

// If SVG doesn't exist, we can't convert
if (!existsSync(svgPath)) {
  console.log('⚠️  og-image.svg not found. If you need og-image.png, please add the SVG file first.');
  console.log('✅ Build will continue with existing PNG file if present.');
  process.exit(0);
}

// Read the SVG file and convert to PNG
try {
  const svgContent = readFileSync(svgPath, 'utf-8');

  // Convert SVG to PNG
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Write PNG file
  writeFileSync(pngPath, pngBuffer);
  console.log('✅ Successfully converted og-image.svg to og-image.png');
} catch (error) {
  console.error('❌ Error converting SVG to PNG:', error.message);
  console.log('⚠️  Build will continue, but og-image.png may not be available.');
  // Don't fail the build - exit with 0
  process.exit(0);
}

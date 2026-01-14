import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read the SVG file
const svgContent = readFileSync(join(rootDir, 'public', 'og-image.svg'), 'utf-8');

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
writeFileSync(join(rootDir, 'public', 'og-image.png'), pngBuffer);
console.log('✅ Successfully converted og-image.svg to og-image.png');

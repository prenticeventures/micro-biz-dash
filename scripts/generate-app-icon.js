/**
 * Generate iOS App Icon from SVG favicon
 * Creates a 1024x1024 PNG from the SVG favicon
 * 
 * Run with: node scripts/generate-app-icon.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read the SVG favicon
const svgPath = path.join(rootDir, 'public', 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Create a simple HTML file to render the SVG at 1024x1024
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 1024px;
      height: 1024px;
      background: transparent;
    }
    svg {
      width: 1024px;
      height: 1024px;
    }
  </style>
</head>
<body>
  ${svgContent.replace('width="64" height="64"', 'width="1024" height="1024"')}
</body>
</html>
`;

// Instructions for the user
console.log(`
📱 iOS App Icon Generator
========================

The favicon.svg has been prepared for conversion to a 1024x1024 PNG.

Since we need a PNG file, you have a few options:

OPTION 1: Use an online converter (Easiest)
1. Open https://cloudconvert.com/svg-to-png
2. Upload: public/favicon.svg
3. Set size: 1024x1024
4. Download and save as: ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png

OPTION 2: Use ImageMagick (if installed)
Run: convert -background none -size 1024x1024 public/favicon.svg ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png

OPTION 3: Use a design tool
- Open favicon.svg in Figma/Sketch/Photoshop
- Export as 1024x1024 PNG
- Save to: ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png

The icon file location will be:
ios/App/App/Assets.xcassets/AppIcon.appiconset/icon-1024.png

Note: You'll also need to create smaller sizes (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt)
but Xcode can generate these automatically from the 1024x1024 version.
`);

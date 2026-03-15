import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input SVG file
const inputSvg = path.join(__dirname, 'src-tauri/icons/design4-playful.svg');

// Target sizes and files
const targets = [
  { size: 32, output: 'src-tauri/icons/32x32.png' },
  { size: 128, output: 'src-tauri/icons/128x128.png' },
  { size: 256, output: 'src-tauri/icons/128x128@2x.png' },
  { size: 512, output: 'src-tauri/icons/icon.png' },
  { size: 1024, output: 'src-tauri/icons/icon-highres.png' }
];

async function generateIcons() {
  try {
    console.log('Generating icons from design4-playful.svg...');
    
    for (const target of targets) {
      await sharp(inputSvg)
        .resize(target.size, target.size)
        .png()
        .toFile(target.output);
      console.log(`✓ Generated ${target.output} (${target.size}x${target.size})`);
    }
    
    console.log('\n✅ All PNG icons generated successfully!');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
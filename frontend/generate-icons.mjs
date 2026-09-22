import { Jimp } from 'jimp';

async function generateIcons() {
  try {
    const image = await Jimp.read('d:/Codes/PROJECTS/fairshare/frontend/public/apple-touch-icon.png');
    
    // Create 192x192
    const icon192 = image.clone().resize({ w: 192, h: 192 });
    await icon192.write('d:/Codes/PROJECTS/fairshare/frontend/public/pwa-192x192.png');
    console.log('Generated pwa-192x192.png');

    // Create 512x512
    const icon512 = image.clone().resize({ w: 512, h: 512 });
    await icon512.write('d:/Codes/PROJECTS/fairshare/frontend/public/pwa-512x512.png');
    console.log('Generated pwa-512x512.png');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

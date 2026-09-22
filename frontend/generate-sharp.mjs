import sharp from 'sharp';

async function generate() {
  try {
    await sharp('public/favicon.svg')
      .resize(192, 192)
      .toFile('public/pwa-192x192.png');
    console.log('Generated 192x192');

    await sharp('public/favicon.svg')
      .resize(512, 512)
      .toFile('public/pwa-512x512.png');
    console.log('Generated 512x512');
  } catch (err) {
    console.error(err);
  }
}

generate();

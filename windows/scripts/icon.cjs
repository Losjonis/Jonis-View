const fs = require('node:fs/promises');
const sharp = require('sharp');
async function main() {
  const mark = (await fs.readFile('src/logo.svg', 'utf8')).replace(/<svg[^>]*>|<\/svg>/g, '');
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect x="4" y="4" width="248" height="248" rx="55" fill="#211b23"/><rect x="5" y="5" width="246" height="246" rx="54" fill="none" stroke="#58404f" stroke-width="2"/><g fill="none" transform="translate(25 25) scale(1.609375)">${mark}</g></svg>`);
  await fs.mkdir('build/appx', { recursive: true });
  for (const [name, width, height] of [['StoreLogo',50,50], ['Square150x150Logo',150,150], ['Square44x44Logo',44,44], ['Wide310x150Logo',310,150], ['icon',256,256]]) {
    const size = Math.min(width, height);
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    await sharp({ create: { width, height, channels: 4, background: '#211b23' } }).composite([{ input: png, gravity: 'centre' }]).png().toFile(`build/appx/${name}.png`);
  }
  const sizes = [16,24,32,48,64,128,256];
  const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((png, i) => {
    const entry = 6 + 16 * i;
    header[entry] = sizes[i] % 256; header[entry + 1] = sizes[i] % 256;
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  const ico = Buffer.concat([header, ...images]);
  await fs.writeFile('build/icon.ico', ico);
  await fs.writeFile('src/icon.ico', ico);
  await sharp(svg).png().toFile('build/logo-preview.png');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

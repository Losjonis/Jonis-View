const fs = require('node:fs/promises');
const sharp = require('sharp');
(async () => {
 const mark = (await fs.readFile('src/logo.svg','utf8')).replace(/<svg[^>]*>|<\/svg>/g,'');
 const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><rect x="4" y="4" width="248" height="248" rx="55" fill="#211b23"/><rect x="5" y="5" width="246" height="246" rx="54" fill="none" stroke="#58404f" stroke-width="2"/><g fill="none" transform="translate(25 25) scale(1.609375)">${mark}</g></svg>`);
 await fs.mkdir('dist/Store-logos',{recursive:true});
 for (const size of [300,150,71]) {
  const target = `dist/Store-logos/Jonis-View-${size}x${size}.png`;
  await sharp(svg,{density:300}).resize(size,size).png().toFile(target);
  const metadata = await sharp(target).metadata();
  const stat = await fs.stat(target);
  if(metadata.width!==size || metadata.height!==size || stat.size>=5000000) throw new Error('Invalid export');
  console.log(`${target}: ${metadata.width}x${metadata.height}, ${stat.size} bytes`);
 }
})().catch(e=>{console.error(e);process.exitCode=1});

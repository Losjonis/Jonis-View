const { spawnSync } = require('node:child_process');
if(process.platform !== 'linux') {
  console.error('Genera el AppImage en Linux: npm ci && npm run dist. Para una carpeta de aplicación desde Windows: npm run pack.');
  process.exit(1);
}
const result=spawnSync(process.execPath,[require.resolve('electron-builder/cli.js'),'--linux','--x64',...process.argv.slice(2)],{stdio:'inherit'});
process.exit(result.status ?? 1);

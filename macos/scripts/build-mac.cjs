const { spawnSync } = require('node:child_process');
if (process.platform !== 'darwin') {
  console.error('Genera el instalador en un Mac: npm ci y npm run dist. En Windows puedes previsualizar la interfaz con npm start.');
  process.exit(1);
}
const cli = require.resolve('electron-builder/cli.js');
const result = spawnSync(process.execPath, [cli, '--mac', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);

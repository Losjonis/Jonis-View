const { build } = require('electron-builder');
const path = require('node:path');
const fs = require('node:fs');
const localKit = path.resolve(__dirname, '../.tools/sdk/bin/10.0.26100.0/x64');
if (!process.env.ELECTRON_BUILDER_WINDOWS_KITS_PATH && fs.existsSync(path.join(localKit, 'makeappx.exe'))) {
  process.env.ELECTRON_BUILDER_WINDOWS_KITS_PATH = localKit;
}
const STORE_IDENTITY_NAME = process.env.STORE_IDENTITY_NAME;
const STORE_PUBLISHER = process.env.STORE_PUBLISHER;
const STORE_PUBLISHER_DISPLAY_NAME = process.env.STORE_PUBLISHER_DISPLAY_NAME;
if (!STORE_IDENTITY_NAME || !STORE_PUBLISHER || !STORE_PUBLISHER_DISPLAY_NAME) {
  console.error('Configura STORE_IDENTITY_NAME, STORE_PUBLISHER y STORE_PUBLISHER_DISPLAY_NAME con los valores exactos de Partner Center. Consulta STORE.md.');
  process.exitCode = 1;
} else {
  build({ win: ['appx'], config: { appx: { identityName: STORE_IDENTITY_NAME, publisher: STORE_PUBLISHER, publisherDisplayName: STORE_PUBLISHER_DISPLAY_NAME } } }).catch(error => { console.error(error); process.exitCode = 1; });
}

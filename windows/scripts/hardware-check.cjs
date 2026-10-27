const { _electron: electron } = require('@playwright/test');
(async () => {
  const app = await electron.launch({ args: ['.'] });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => [...document.querySelector('#camera').options].some(o => /UGREEN/i.test(o.textContent)));
    const device = await page.locator('#camera option').evaluateAll(options => options.find(o => /UGREEN/i.test(o.textContent)).value);
    await page.locator('#camera').selectOption(device);
    await page.locator('#connect').click();
    await page.waitForFunction(() => !document.querySelector('#connect').disabled);
    const status = await page.locator('#status').textContent();
    if (status !== 'Señal conectada') throw new Error(await page.locator('#notice').textContent());
    await page.waitForFunction(() => document.querySelector('#video').getVideoPlaybackQuality().totalVideoFrames > 15);
    const audioDevice = await page.locator('#audio-input option').evaluateAll(options => options.find(o => /UGREEN/i.test(o.textContent))?.value);
    if (audioDevice) {
      await page.locator('#settings').click();
      await page.locator('#mute').click();
      await page.locator('#audio-input').selectOption(audioDevice);
      await page.waitForFunction(() => document.querySelector('#audio').srcObject?.active);
    }
    console.log(JSON.stringify(await page.evaluate(() => ({ status: document.querySelector('#status').textContent, format: document.querySelector('#actual').textContent, frames: document.querySelector('#video').getVideoPlaybackQuality().totalVideoFrames, audioActive: Boolean(document.querySelector('#audio').srcObject?.active), notice: document.querySelector('#notice').textContent })), null, 2));
    await page.locator('#connect').click();
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

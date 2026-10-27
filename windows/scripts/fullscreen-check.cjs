const { _electron } = require('@playwright/test');
const assert = require('node:assert/strict');
(async()=>{
 const app=await _electron.launch({executablePath:'dist/win-unpacked/Jonis View.exe',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 try {
 const page=await app.firstWindow();
 await page.locator('#fullscreen').click();
 await page.waitForFunction(()=>document.body.classList.contains('fullscreen'));
 const slider=page.locator('#fullscreen-volume');
 const r=await slider.boundingBox();
 await page.mouse.move(r.x+20,r.y+r.height/2);
 await page.mouse.down();
 await page.mouse.move(r.x+r.width-20,r.y+r.height/2,{steps:20});
 await page.mouse.up();
 const value=await slider.inputValue();
 assert(Number(value)>70);
 assert.equal(await page.locator('#audio').evaluate(el=>el.volume),Number(value)/100);
 await page.waitForTimeout(2800);
 assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('idle')),false);
 await page.mouse.move(100,100);
 await page.locator('#video').click();
 await page.waitForFunction(()=>document.body.classList.contains('idle'));
 await page.mouse.move(r.x+40,r.y+r.height/2);
 await page.waitForFunction(()=>!document.body.classList.contains('idle'));
 await slider.click({position:{x:25,y:r.height/2}});
 assert(Number(await slider.inputValue())<30);
 console.log('PASS packaged v'+await app.evaluate(({app})=>app.getVersion())+': mouse drag/click changes audio volume; controls stay visible while hovered and return after hiding.');
 }finally{await app.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

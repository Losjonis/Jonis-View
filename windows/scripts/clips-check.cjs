const { _electron: electron }=require('@playwright/test');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
(async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'jonis-clips-test-'));
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'jonis-clips-profile-'));
 const app=await electron.launch({args:['.','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',`--user-data-dir=${profile}`],env:{...process.env,JONIS_CAPTURE_DIR:folder,JONIS_TEST_LOCALE:'es-ES'}});
 try {
 const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!process.env.JONIS_RING_ONLY) {
 await page.waitForFunction(()=>document.getElementById('camera').value);await page.locator('#connect').click();await page.waitForFunction(()=>document.getElementById('video').videoWidth>0 && !document.getElementById('connect').disabled);
 await page.locator('#settings').click();await page.locator('#audio-input').selectOption({index:1});await page.waitForFunction(()=>document.getElementById('audio').srcObject?.active);
 await page.locator('footer [data-clip=image]').click();await page.waitForFunction(()=>document.getElementById('capture-message').textContent.includes('.png'));
 const png=(await fs.readdir(folder)).find(f=>f.endsWith('.png'));const image=await fs.readFile(path.join(folder,png));const size=await page.locator('#video').evaluate(v=>[v.videoWidth,v.videoHeight]);assert.equal(image.readUInt32BE(16),size[0]);assert.equal(image.readUInt32BE(20),size[1]);
 await page.locator('footer [data-clip=record]').click();await page.waitForTimeout(3200);await page.locator('footer [data-clip=record]').click();await page.waitForFunction(()=>document.getElementById('capture-message').textContent.includes('.mp4'),null,{timeout:60000});
 await page.locator('#replay-length').selectOption('15');await page.waitForFunction(()=>document.getElementById('replay-state').textContent.includes('activa'));await page.waitForTimeout(18000);
 await page.locator('#fullscreen').click();await page.waitForFunction(()=>document.body.classList.contains('fullscreen'));await page.mouse.move(300,300);await page.locator('.overlay [data-clip=replay]').click();await page.waitForFunction(()=>document.getElementById('capture-message').textContent.includes('.mp4'),null,{timeout:60000});
 await page.screenshot({path:'test-results/clips-fullscreen.png'});
 await page.keyboard.press('Escape');await page.locator('#replay-length').selectOption('0');
 const clips=(await fs.readdir(folder)).filter(f=>f.endsWith('.mp4'));assert.equal(clips.length,2);
 for(const name of clips){const result=spawnSync(require('ffmpeg-static'),['-v','info','-i',path.join(folder,name),'-f','null','-'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.match(result.stderr,/Video: h264/);assert.match(result.stderr,/Audio: aac/);if(name===clips[1])assert.match(result.stderr,/Duration: 00:00:1[45]/);console.log(name,result.stderr.match(/Duration: [^,]+/)[0]);}
 await page.locator('footer [data-clip=record]').click();await page.waitForTimeout(1500);await page.locator('#connect').click();await page.waitForFunction(()=>document.getElementById('status').textContent==='Desconectado');assert.equal((await fs.readdir(folder)).filter(f=>f.endsWith('.mp4')).length,3);
 }
 // Exercise the bounded ring beyond its wrap point without waiting 80 real seconds.
 const fixture=path.join(folder,'fixture.webm');
 const generated=spawnSync(require('ffmpeg-static'),['-v','error','-f','lavfi','-i','testsrc2=size=160x120:rate=10','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','80','-c:v','libvpx','-deadline','realtime','-g','20','-c:a','libopus',fixture],{encoding:'utf8'});assert.equal(generated.status,0,generated.stderr);
 const data=await fs.readFile(fixture);
 for(const seconds of [30,60]) {
   const id=await page.evaluate(()=>window.desktop.capture('begin','replay'));
   for(let at=0;at<data.length;at+=65536)await page.evaluate(({id,bytes})=>window.desktop.capture('chunk',id,new Uint8Array(bytes)),{id,bytes:[...data.subarray(at,at+65536)]});
   const file=await page.evaluate(({id,seconds})=>window.desktop.capture('finish',id,true,seconds),{id,seconds});
   const result=spawnSync(require('ffmpeg-static'),['-v','info','-i',file,'-f','null','-'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
   const match=result.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);const length=Number(match[1])*3600+Number(match[2])*60+Number(match[3]);assert.ok(Math.abs(length-seconds)<0.6, 'Replay duration '+length);console.log('PASS: wrapped replay',seconds,'seconds');
 }
 // Closing a window finalizes an active recording before process exit.
 await page.locator('#connect').click();await page.waitForFunction(()=>document.getElementById('video').videoWidth>0 && !document.getElementById('connect').disabled);await page.locator('footer [data-clip=record]').click();await page.waitForTimeout(1200);
 const beforeClose=(await fs.readdir(folder)).filter(f=>f.endsWith('.mp4')).length;
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());
 for(let n=0;n<100;n++){if((await fs.readdir(folder)).filter(f=>f.endsWith('.mp4')).length>beforeClose)break;await new Promise(r=>setTimeout(r,100));}
 assert.equal((await fs.readdir(folder)).filter(f=>f.endsWith('.mp4')).length,beforeClose+1);
 assert.deepEqual(errors,[]);console.log('PASS: PNG at source resolution, H.264/AAC MP4 decoded, rolling replay duration, fullscreen controls and disconnect finalization. Files:',folder);
 }finally{await app.close().catch(()=>{});}
})().catch(e=>{console.error(e);process.exitCode=1});

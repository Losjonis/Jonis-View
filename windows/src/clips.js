/* Capture shares existing media tracks; playback volume does not change recorded audio. */
window.Clips = (() => {
  const t = window.I18n.t;
  const $ = id => document.getElementById(id);
  const video = $('video'), audio = $('audio');
  const api = (action,...args) => window.desktop.capture(action,...args);
  let manual, replay, working=false, closing=false, elapsed=0, messageTimer;
  const exports = new Set();
  const gpu=$('gpu-export');
  try {gpu.checked=localStorage.getItem('jonis-gpu-export')==='true';}catch{}
  async function gpuStatus() {
    if(!gpu.checked){$('gpu-status').textContent=t("Desactivado · exportación con CPU");return;}
    $('gpu-status').textContent=t("Comprobando GPU…");
    try{const info=await api('gpu-info');if(gpu.checked)$('gpu-status').textContent=info.available?t(info.name):t("No disponible · se usará CPU");}catch{if(gpu.checked)$('gpu-status').textContent=t("No disponible · se usará CPU");}
  }
  gpu.onchange=()=>{try{localStorage.setItem('jonis-gpu-export',String(gpu.checked));}catch{}gpuStatus();};
  gpuStatus();
  window.desktop.onExportStatus(name=>message(t('Guardando clip…')+' · '+t(name)));
  function message(text) { clearTimeout(messageTimer); $('capture-message').textContent=text; $('capture-message').hidden=!text; if(text.startsWith(t("Guardado:"))) messageTimer=setTimeout(()=>message(''),6000); }
  function trackExport(promise) { exports.add(promise); promise.finally(()=>exports.delete(promise)).catch(()=>{}); return promise; }
  function ready() { return video.srcObject?.active && video.videoWidth > 0; }
  function update() {
    for(const button of document.querySelectorAll('[data-clip]')) {
      const action=button.dataset.clip;
      button.disabled=working || closing || (action==='replay' ? !replay : !ready());
      if(action==='record') { button.classList.toggle('recording',Boolean(manual)); button.setAttribute('aria-label',manual?t("Detener clip"):t("Grabar clip")); button.title=manual?t("Detener clip · R"):t("Grabar clip · R"); window.ButtonIcons.set(button,manual?'stop':'record'); }
    }
    $('replay-length').disabled=working || closing || !ready();
    $('record-time').hidden=!manual;
    if(manual) { const secs=Math.floor((Date.now()-elapsed)/1000); $('record-time').textContent=`● ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`; }
    $('replay-state').textContent=replay?t("Repetición activa"):'';
  }
  async function create(mode) {
    if(!ready()) throw Error(t("Conecta primero la capturadora."));
    const tracks=[...video.srcObject.getVideoTracks(),...(audio.srcObject?.getAudioTracks() || [])];
    const mime=['video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    if(!mime) throw Error(t("Este equipo no dispone de un codificador compatible."));
    const recorder=new MediaRecorder(new MediaStream(tracks),{mimeType:mime,videoBitsPerSecond:12000000,audioBitsPerSecond:192000,videoKeyFrameIntervalDuration:2000});
    const id=await api('begin',mode); let queue=Promise.resolve(),failure;
    recorder.ondataavailable=event=> { if(event.data.size) queue=queue.then(async()=>api('chunk',id,await event.data.arrayBuffer())).catch(error=>{failure=error; if(recorder.state!=='inactive') recorder.stop(); message(t("No se pudo escribir la captura. Revisa el espacio disponible."));}); };
    recorder.onerror=event=>{ failure=event.error || Error(t("Error del codificador")); message(failure.message); };
    const stopped=new Promise(resolve=>recorder.onstop=resolve);
    try { recorder.start(500); } catch(error) { await api('finish',id,false).catch(()=>{}); throw error; }
    return {recorder, async end(save,seconds) { if(recorder.state!=='inactive')recorder.stop(); await stopped; await queue; const file=await api('finish',id,save && !failure,seconds,$('gpu-export').checked); if(failure)throw failure; return file; }};
  }
  async function exportClip(session,seconds) {
    message(t("Guardando clip…"));
    try { const file=await trackExport(session.end(true,seconds)); message(t('Guardado:')+' '+file.split(/[\\/]/).pop()); }
    catch(error) { message(t('No se pudo guardar el clip:')+' '+error.message); }
  }
  async function record() {
    if(manual) { const session=manual; manual=null; update(); await exportClip(session); }
    else { manual=await create('manual'); elapsed=Date.now(); message(''); update(); }
  }
  async function snapshot() {
    if(!ready())throw Error(t("Conecta primero la capturadora."));
    const canvas=document.createElement('canvas'); canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error(t("No se pudo capturar la imagen."));
    const file=await api('image',await blob.arrayBuffer());message(t('Guardado:')+' '+file.split(/[\\/]/).pop());
  }
  async function saveReplay() {
    if(!replay)return;
    const session=replay;replay=null;
    // Finalize the old stream before creating its successor; encoding/export can continue separately.
    const promise=exportClip(session,Number($('replay-length').value));
    await new Promise(resolve=>setTimeout(resolve,0));
    replay=await create('replay');update();await promise;
  }
  async function stopAll() {
    while(working) await new Promise(resolve=>setTimeout(resolve,50));
    const a=manual,b=replay;manual=replay=null;$('replay-length').value='0';update();
    await Promise.allSettled([a?exportClip(a):null,b?b.end(false):null]);
  }
  async function action(fn) { if(working || closing)return;working=true;update();try{await fn();}catch(error){message(error.message);}finally{working=false;update();} }
  for(const button of document.querySelectorAll('[data-clip]'))button.onclick=()=>action({image:snapshot,record,replay:saveReplay}[button.dataset.clip]);
  $('replay-length').onchange=()=>action(async()=>{if(replay){const old=replay;replay=null;await old.end(false);}if(Number($('replay-length').value))replay=await create('replay');update();});
  $('capture-folder').onclick=()=>action(async()=>{ $('capture-folder').title=await api('choose'); });
  $('open-captures').onclick=()=>action(()=>api('open'));
  document.addEventListener('keydown',event=>{if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target.matches('input,select,textarea')||$('help-dialog').open)return;const fn={p:snapshot,r:record,b:saveReplay}[(event.code?.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase())];if(fn){event.preventDefault();action(fn);}});
  window.desktop.onCaptureClose(async()=>{if(closing)return;closing=true;while(working)await new Promise(r=>setTimeout(r,100));await stopAll();await Promise.allSettled([...exports]);await api('closed');});
  setInterval(update,250);api('folder').then(folder=>$('capture-folder').title=folder).catch(error=>message(error.message));update();
  return {stopAll};
})();

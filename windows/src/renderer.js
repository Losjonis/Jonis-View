const t = window.I18n.t;
const $ = id => document.getElementById(id);
const camera = $('camera'), input = $('audio-input'), output = $('audio-output'), video = $('video'), audio = $('audio');
let stream, audioStream, busy = false, full = false, idleTimer, generation = 0;
let saved = {};
try { saved = JSON.parse(localStorage.getItem('jonis-settings') || '{}'); } catch {}
$('profile').value = saved.profile || 'auto';
if (!$('profile').value) $('profile').value = 'auto';
$('volume').value = saved.volume ?? 75;
audio.volume = Number($('volume').value) / 100;
$('volume-label').value = `${$('volume').value}%`;
$('fullscreen-volume').value = $('volume').value;
$('fullscreen-volume-label').value = $('volume-label').value;
function save() {
  saved = { camera: camera.value, input: input.value, output: output.value, profile: $('profile').value, volume: $('volume').value };
  localStorage.setItem('jonis-settings', JSON.stringify(saved));
}
function notice(message = '') { $('notice').textContent = message; $('notice').hidden = !message; }
function populate(select, devices, preferred, placeholder) {
  select.replaceChildren();
  if (placeholder) select.add(new Option(placeholder, ''));
  devices.forEach((device, i) => select.add(new Option(device.label || t('Dispositivo {number}', {number:i+1}), device.deviceId)));
  if ([...select.options].some(o => o.value === preferred)) select.value = preferred;
}
async function refresh() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    populate(camera, cameras, camera.value || saved.camera, cameras.length ? null : t("No hay capturadoras disponibles"));
    populate(input, devices.filter(d => d.kind === 'audioinput'), input.value || saved.input, t("Sin audio"));
    populate(output, devices.filter(d => d.kind === 'audiooutput'), output.value || saved.output, t("Salida predeterminada"));
    $('connect').disabled = busy || !camera.value;
  } catch (error) { notice(Capture.errorMessage(error)); }
}
function stopAudio() { audio.srcObject = null; audioStream?.getTracks().forEach(t => t.stop()); audioStream = null; }
async function stop(clearNotice = true) {
  await window.Clips?.stopAll();
  generation++;
  stream?.getTracks().forEach(t => t.stop()); stream = null;
  stopAudio(); video.srcObject = null;
  $('empty').hidden = false;
  $('status').textContent = t("Desconectado");
  $('status-dot').classList.remove('live');
  $('actual').textContent = '';
  $('stream-info').textContent = t("Vista de capturadora");
  $('connect').textContent = t("Conectar");
  $('connect').classList.remove('connected');
  window.desktop?.awake(false);
  if (clearNotice) notice();
}
async function routeAudio() { if (audio.setSinkId) await audio.setSinkId(output.value); }
async function startAudio(token) {
  await window.Clips?.stopAll();
  stopAudio();
  if (!input.value) return;
  try {
    const next = await navigator.mediaDevices.getUserMedia({ video: false, audio: { deviceId: { exact: input.value }, echoCancellation: false, noiseSuppression: false, autoGainControl: false, latency: { ideal: 0 } } });
    if (token !== generation) { next.getTracks().forEach(t => t.stop()); return; }
    audioStream = next;
    next.getAudioTracks()[0].onended = async () => { await window.Clips?.stopAll(); stopAudio(); notice(t("La entrada de audio se ha desconectado. Selecciona otra entrada o vuelve a conectar.")); };
    audio.srcObject = next;
    await routeAudio();
    await audio.play();
  } catch (error) { if (token === generation) { stopAudio(); notice(t('Vídeo activo, pero sin audio.')+' '+Capture.errorMessage(error)); } }
}
async function connect() {
  if (busy) return;
  if (stream) { await stop(); return; }
  if (!camera.value) { notice(t("Conecta una capturadora USB y actualiza los dispositivos.")); return; }
  busy = true; $('connect').disabled = true; camera.disabled = true; $('profile').disabled = true; input.disabled = true; $('refresh').disabled = true; $('connect').textContent = t("Conectando…"); notice();
  const token = ++generation;
  try {
    const next = await navigator.mediaDevices.getUserMedia(Capture.constraints(camera.value, $('profile').value));
    if (token !== generation) { next.getTracks().forEach(t => t.stop()); return; }
    stream = next; video.srcObject = next; await video.play();
    const track = next.getVideoTracks()[0], settings = track.getSettings();
    track.onended = async () => { await stop(false); notice(t("La capturadora se ha desconectado. Reconéctala y pulsa Conectar señal.")); refresh(); };
    track.onmute = () => { $('status').textContent = t("Esperando señal del dispositivo"); };
    track.onunmute = () => { $('status').textContent = t("Señal conectada"); };
    $('empty').hidden = true; $('status').textContent = t("Señal conectada"); $('status-dot').classList.add('live');
    $('actual').textContent = `${settings.width || '?'} × ${settings.height || '?'} · ${Math.round(settings.frameRate || 0)} FPS`;
    $('stream-info').textContent = track.label || t("Capturadora USB");
    $('overlay-name').textContent = track.label || 'Jonis View';
    $('connect').textContent = t("Desconectar"); $('connect').classList.add('connected');
    window.desktop?.awake(true);
    await refresh(); await startAudio(token); save();
  } catch (error) { await stop(false); notice(Capture.errorMessage(error)); }
  finally { busy = false; $('connect').disabled = !camera.value; camera.disabled = false; $('profile').disabled = false; input.disabled = false; $('refresh').disabled = false; }
}
async function fullscreen(value = !full) {
  if (window.desktop) { await window.desktop.fullscreen(value); }
  else if (value) { await document.documentElement.requestFullscreen(); setFull(true); }
  else { if (document.fullscreenElement) await document.exitFullscreen(); setFull(false); }
}
function setFull(value) { full = value; document.body.classList.toggle('fullscreen', full); activity(); }
function activity() { document.body.classList.remove('idle'); clearTimeout(idleTimer); if (full) idleTimer = setTimeout(() => { if (!document.querySelector('.overlay :focus-visible, .overlay:hover, .overlay :active')) document.body.classList.add('idle'); }, 2400); }
window.desktop?.onFullscreen(setFull);
document.addEventListener('fullscreenchange', () => { if (!window.desktop) setFull(Boolean(document.fullscreenElement)); });
$('connect').onclick = connect;
$('refresh').onclick = refresh;
$('fullscreen').onclick = () => fullscreen();
$('exit-fullscreen').onclick = () => fullscreen(false);
$('stage').ondblclick = event => { if (!event.target.closest('button,input,.overlay')) fullscreen(); };
$('overlay').addEventListener('pointerleave', activity);
$('overlay').addEventListener('focusin', activity);
$('overlay').addEventListener('focusout', activity);
document.addEventListener('mousemove', activity);
document.addEventListener('keydown', event => {
  activity();
  if (event.key === 'Escape' && full) { fullscreen(false); return; }
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.target.matches('select,input,textarea') || $('help-dialog').open) return;
  if ((event.code?.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase()) === 'f') fullscreen();
  if ((event.code?.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase()) === 'm') toggleMute();
});
function toggleMute() {
  audio.muted = !audio.muted;
  for (const id of ['mute', 'fullscreen-mute']) {
    window.ButtonIcons.set($(id),audio.muted ? 'muted' : 'volume');
    $(id).setAttribute('aria-label', audio.muted ? t("Activar sonido") : t("Silenciar"));
    $(id).setAttribute('aria-pressed', String(audio.muted));
    $(id).title = audio.muted ? t("Activar sonido") : t("Silenciar");
  }
  activity();
}
$('mute').onclick = toggleMute;
$('fullscreen-mute').onclick = toggleMute;
for (const id of ['volume', 'fullscreen-volume']) $(id).oninput = event => {
  const value = event.target.value;
  audio.volume = Number(value) / 100;
  if (Number(value) > 0 && audio.muted) toggleMute();
  for (const control of ['volume', 'fullscreen-volume']) { $(control).value = value; $(`${control}-label`).value = `${value}%`; }
  save(); activity();
};
$('fit').onclick = () => { const fill = video.classList.toggle('fill'); $('fit').textContent = fill ? t("Rellenar") : t("Ajustar"); };
for (const select of [camera, $('profile')]) select.onchange = async () => { const active = Boolean(stream); await stop(); save(); if (active) connect(); };
input.onchange = async () => { save(); if (stream) { const token = ++generation; notice(); await startAudio(token); } };
output.onchange = async () => { save(); try { await routeAudio(); } catch { notice(t("No se pudo cambiar la salida de audio. Selecciona una salida disponible.")); } };
$('help').onclick = () => $('help-dialog').showModal();
function settings(open) { const panel=$('settings-panel'); if(!open && panel.contains(document.activeElement)) $('settings').focus(); panel.inert=!open; panel.hidden = !open; $('settings').setAttribute('aria-expanded', String(open)); }
$('settings').onclick = () => settings($('settings-panel').hidden);
$('close-settings').onclick = () => settings(false);
$('close-help').onclick = () => $('help-dialog').close();
navigator.mediaDevices.addEventListener('devicechange', refresh);
window.addEventListener('beforeunload', () => { stream?.getTracks().forEach(t => t.stop()); stopAudio(); });
refresh();

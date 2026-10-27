const { app, dialog, shell, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const ffmpeg = require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked');
module.exports = function install(getWindow) {
  const {t}=require('../src/i18n.js').create((!app.isPackaged && process.env.JONIS_TEST_LOCALE) || app.getPreferredSystemLanguages()[0] || app.getLocale());
  const jobs = new Map(); let folder, closing = false;
  const preferences = path.join(app.getPath('userData'), 'capture-folder.json');
  async function directory() {
    if (!folder) { try { folder = JSON.parse(await fs.readFile(preferences, 'utf8')).folder; } catch {} }
    folder ||= process.env.JONIS_CAPTURE_DIR || path.join(app.getPath('videos'), 'Jonis View');
    await fs.mkdir(folder, { recursive: true }); return folder;
  }
  const output = async ext => path.join(await directory(), `Jonis-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0,8)}.${ext}`);
  function run(args, pipe = false, timeout = 0) {
    const child = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { windowsHide: true, stdio: [pipe ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    const timer=timeout ? setTimeout(()=>child.kill(),timeout) : null;
    child.once('close',()=>clearTimeout(timer));child.once('error',()=>clearTimeout(timer));
    let error = ''; child.stderr.on('data', data => { error = (error + data).slice(-4000); });
    child.stdin?.on('error', () => {});
    const done = new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(error || t('Codificador:')+' '+code))); });
    done.catch(() => {}); return { child, done };
  }
  function handle(name, fn) { ipcMain.handle(`capture:${name}`, async (event, ...args) => {
    if (event.sender !== getWindow()?.webContents) throw Error(t("Origen no autorizado"));
    return fn(...args);
  }); }
  const exporter = require('./export-encoder.cjs')(run);
  handle('gpu-info', () => exporter.info());
  handle('folder', directory);
  handle('choose', async () => { const result = await dialog.showOpenDialog(getWindow(), { properties: ['openDirectory', 'createDirectory'] }); if (!result.canceled) { folder = result.filePaths[0]; await fs.writeFile(preferences, JSON.stringify({folder})); } return directory(); });
  handle('open', async () => { const error = await shell.openPath(await directory()); if(error) throw Error(error); });
  handle('image', async data => { const bytes = Buffer.from(data); if (bytes.length > 100*1024*1024 || bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error(t("Imagen inválida")); const file = await output('png'); await fs.writeFile(file, bytes, {flag:'wx'}); return file; });
  handle('begin', async mode => {
    if (!['manual','replay'].includes(mode) || jobs.size >= 4) throw Error(t("Ya hay una captura activa"));
    const dir = await fs.mkdtemp(path.join(app.getPath('temp'), 'jonis-capture-')); const id = randomUUID();
    const args = mode === 'replay' ? ['-i','pipe:0','-map','0','-c','copy','-f','segment','-segment_time','2','-reset_timestamps','1','-segment_list',path.join(dir,'segments.csv'),'-segment_list_size','35','-segment_wrap','36',path.join(dir,'part-%03d.mkv')] : ['-i','pipe:0','-map','0','-c','copy',path.join(dir,'clip.mkv')];
    const process = run(args, true); jobs.set(id, {mode,dir,...process}); return id;
  });
  handle('chunk', async (id, data) => {
    const job = jobs.get(id); if (!job || job.finishing) throw Error(t("Captura cerrada"));
    const bytes = Buffer.from(data); if(bytes.length > 32*1024*1024) throw Error(t("Fragmento demasiado grande"));
    await new Promise((resolve,reject) => job.child.stdin.write(bytes, error => error ? reject(error) : resolve()));
  });
  handle('finish', async (id, save, seconds, useGpu = false) => {
    const job = jobs.get(id); if(!job || job.finishing) throw Error(t("Captura cerrada")); job.finishing=true;
    let keep=false;
    try {
      job.child.stdin.end(); await job.done;
      if(!save) return null;
      let args;
      if(job.mode === 'replay') {
        const rows = (await fs.readFile(path.join(job.dir,'segments.csv'),'utf8')).trim().split(/\r?\n/).map(line => { const [file,start,end] = line.split(','); return {file:file.replace(/^"|"$/g,''),start:Number(start),end:Number(end)}; });
        const duration = [15,30,60].includes(seconds) ? seconds : 30;
        const end = rows.at(-1).end; const selected = rows.filter(row => row.end > end-duration);
        const list = selected.map(row => `file '${path.basename(row.file)}'
duration ${(row.end-row.start).toFixed(6)}`).join('\n');
        await fs.writeFile(path.join(job.dir,'concat.txt'), list);
        args=['-f','concat','-safe','1','-i',path.join(job.dir,'concat.txt'),'-ss',Math.max(0,end-duration-selected[0].start).toFixed(6),'-t',String(duration)];
      } else args=['-i',path.join(job.dir,'clip.mkv')];
      const file = await output('mp4');
      // Encode into a temporary file so incomplete exports never appear as saved clips.
      const pending = file + '.partial.mp4';
      try { await exporter.encode(args,pending,useGpu === true,name => getWindow()?.webContents.send('capture:export-status',name)); await fs.rename(pending,file); } catch(error) { await fs.rm(pending,{force:true}); throw error; }
      return file;
    } catch(error) { keep=Boolean(save); throw new Error(`${error.message}${keep ? ' '+t('Material temporal conservado en:')+' '+job.dir : ''}`); } finally { jobs.delete(id); if(!keep) await fs.rm(job.dir,{recursive:true,force:true}); }
  });
  // Renderer closes recorders before acknowledging the close request.
  handle('closed', () => { closing=true; getWindow()?.close(); });
  return { attach(win) { win.on('close', event => { if(!closing && jobs.size > 0) { event.preventDefault(); win.webContents.send('capture:closing'); } }); }, busy: () => jobs.size > 0 };
};

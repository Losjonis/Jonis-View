(function (root) {
  const profiles = { auto: {}, '1080p60': { width: 1920, height: 1080, frameRate: 60 }, '1080p30': { width: 1920, height: 1080, frameRate: 30 }, '720p60': { width: 1280, height: 720, frameRate: 60 }, '1440p60': { width: 2560, height: 1440, frameRate: 60 }, '1440p30': { width: 2560, height: 1440, frameRate: 30 }, '2160p30': { width: 3840, height: 2160, frameRate: 30 } };
  function constraints(deviceId, profile) {
    const video = { deviceId: { exact: deviceId } };
    for (const [key, value] of Object.entries(profiles[profile] || {})) video[key] = { ideal: value };
    return { video, audio: false };
  }
  function errorMessage(error) {
    return ({ NotAllowedError: 'macOS ha bloqueado el acceso. Activa Jonis View en Ajustes del Sistema > Privacidad y seguridad > Cámara o Micrófono. Después vuelve a abrir la app.', NotFoundError: 'No se encuentra el dispositivo. Comprueba la conexión USB y actualiza la lista.', NotReadableError: 'No se puede abrir el dispositivo. Cierra OBS, Cámara u otra aplicación que lo esté utilizando.', OverconstrainedError: 'El dispositivo no admite esta configuración. Prueba el modo Automático.', AbortError: 'La conexión se interrumpió. Vuelve a conectar la capturadora.' })[error.name] || 'No se ha podido iniciar la captura. Comprueba el dispositivo y vuelve a intentarlo.';
  }
  const api = { constraints, errorMessage };
  if (typeof module !== 'undefined') module.exports = api; else root.Capture = api;
})(globalThis);

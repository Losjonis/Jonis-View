const { test } = require('node:test');
const assert = require('node:assert/strict');
const { constraints, errorMessage } = require('../src/capture.js');
test('requests only the selected USB device, never a default microphone', () => {
  assert.deepEqual(constraints('usb-id', 'auto'), { video: { deviceId: { exact: 'usb-id' } }, audio: false });
});
test('quality is preferred so unsupported formats can fall back', () => {
  assert.deepEqual(constraints('usb-id', '1080p60').video.frameRate, { ideal: 60 });
  assert.deepEqual(constraints('usb-id', 'invalid').video, { deviceId: { exact: 'usb-id' } });
});
test('hardware and privacy failures have actionable Spanish messages', () => {
  assert.match(errorMessage({ name: 'NotReadableError' }), /Cierra OBS/);
  assert.match(errorMessage({ name: 'NotAllowedError' }), /Privacidad/);
  assert.match(errorMessage({ name: 'UnknownError' }), /vuelve a intentarlo/);
});

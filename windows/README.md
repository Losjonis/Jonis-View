# Jonis View

USB UVC capture device viewer for Windows, featuring a dark interface with soft pink accents. Live video, selectable audio input and output, volume control, fullscreen mode (F, Esc, double-click), fit/fill display options, and local preferences. Supports saving PNG screenshots, MP4 clips, and the last few seconds of the signal. Everything is processed locally.

## Run

Requires Node.js LTS and Windows 10/11 x64.

```powershell
npm ci
npm start
```

Connect your device's HDMI output → the capture card's HDMI input → your computer's USB port. Select the source and click **Connect Signal**. To hear the device, select its audio input; the microphone is not enabled automatically. Close any other applications using the capture device.

## Build and verify

```powershell
npm test
npm run smoke
npm run pack
npm run dist
```

`pack` creates `dist/win-unpacked/Jonis View.exe`; `dist` creates the portable executable. `smoke` tests the Electron application with synthetic video and audio, without activating hardware. For the Microsoft Store, see [STORE.md](STORE.md).

The selected resolution and FPS are preferences; the top bar displays the values actually negotiated. Latency depends on the hardware, format, and Chromium; zero latency is not guaranteed. HDCP is not bypassed. A black image from the capture device does not necessarily mean the USB device is disconnected. Final verification of sound, stability, synchronization, and delay requires the physical device.

## Architecture

Electron with an isolated, sandboxed renderer and no Node.js access in the UI. UVC capture via MediaDevices/getUserMedia, video and audio playback, optional recording with MediaRecorder, and local export using FFmpeg. Permissions are restricted to media devices and the application's local page; external navigation is blocked. `powerSaveBlocker` keeps the display awake during capture. Preferences are stored in localStorage; devices are released when disconnecting or closing the application.

## Screenshots and clips (Windows 0.2.0)

P saves a PNG at the received resolution. R starts or stops an H.264/AAC MP4 recording. In Settings, enable a 15-, 30-, or 60-second replay buffer; B saves that interval (or whatever is available if you have just enabled it). Saving a replay starts a new history buffer. Replay is disabled by default and is turned off when changing the source, format, or audio.

Files are saved to Videos/Jonis View; Settings lets you change and open the folder. Volume and mute affect monitoring, not recorded audio. Controls are also available in fullscreen mode. The counter indicates manual recording. Disconnecting or closing finalizes the clip; wait while it is being exported.

Replay uses temporary disk segments with an approximate limit of 72 seconds (plus any clip currently being exported). These are deleted when replay is stopped normally. A forced shutdown may leave temporary files behind; if export fails, the footage is preserved and its location is displayed for recovery. Manual recordings use disk space according to their duration. MP4 export uses the CPU and may take time, especially at 1440p/4K.

Automated file test: `node scripts/clips-check.cjs`. It validates PNG files, MP4 decoding with audio, replay duration, and finalization on disconnect. Synchronization with real hardware requires testing with your capture device.

## GPU export (Windows 0.2.2)

Settings → Export with GPU enables H.264 encoding through NVIDIA NVENC, Intel Quick Sync, or AMD AMF, depending on availability. It is disabled by default and remembers your selection. The app tests encoders using real frames; if GPU export fails, it retries using the CPU and displays the encoder used. This affects MP4 clips and replays, not PNG screenshots or temporary capture. Audio is still encoded using the CPU. Speed and quality depend on hardware, drivers, and format; this does not eliminate all saving delays. Version 0.2.3 fixed a false negative in NVENC detection: the test uses 640 × 480 because NVIDIA may reject 128 × 128. Verified on an RTX 3060 with H.264 export at 1080p60 and successful decoding of the resulting MP4.

## Automatic language selection (Windows 0.3.0)

The app uses Windows' first preferred language at startup. It supports Spanish, English, French, German, Swedish, and Russian, just like the website. Regional variants share the same translation (for example, es-MX and es-ES). If the language is not supported, the app defaults to English. Restart the app after changing the Windows language. System preferences and device names are not modified. The physical F/M/P/R/B shortcuts also work with a Russian keyboard layout.

The editable translation catalog is located at `src/translations.txt` (columns: es, en, fr, de, sv, ru). Run `npm run build:i18n` after editing it, and `npm run test:languages` to test all six languages and the English fallback.

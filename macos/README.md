# Jonis View · macOS

An independent project separate from the Windows edition. It offers the same USB capture functionality, profiles up to 1440p/4K depending on the device, audio, local settings, and volume control in fullscreen mode. Light interface with pink accents, native window controls, and a macOS menu.

## Try it

Install Node.js LTS on a Mac, open Terminal in this folder, and run:

```sh
npm ci
npm start
```

Connect a UVC capture device compatible with macOS. Click **Connect** and grant Camera permission. To hear its audio, select the corresponding input in Settings and grant Microphone permission. If you deny a permission, enable it under **System Settings > Privacy & Security** and restart the app.

**F:** Enter fullscreen. **M:** Mute or unmute. **Esc:** Exit fullscreen. In fullscreen mode, move the mouse to display the volume control. **Cmd+,** opens Settings; **Cmd+Q** quits. Closing the window keeps the app running in the Dock; click its Dock icon to reopen the window.

## Mac installer

On a Mac, run:

```sh
npm run dist
```

This generates DMG and ZIP files in `dist`, separately for Apple Silicon (arm64) and Intel (x64). `npm run pack` generates the application without an installer. The provisional bundle identifier is `com.jonisapps.jonisview`; it must match the identifier registered in your Apple account before publishing.

Developer ID signing and notarization require an Apple Developer account and credentials configured on the build Mac. No certificates or credentials are included. Without them, the resulting build is not signed or notarized for distribution, and Gatekeeper may block it. Configuration: https://www.electron.build/v26/docs/code-signing-mac/

This configuration prepares direct distribution via DMG, not submission to the Mac App Store. The store requires a dedicated MAS build profile, sandboxing, certificates, and provisioning profiles, as well as testing and review.

## Validation

```sh
npm test
npm run smoke
```

The functional test uses synthetic camera and audio sources and checks window sizes, capture, audio, fullscreen mode, volume, and preferences. A preview has been prepared on Windows; native permissions, menus, signing, and operation with real capture devices still need to be validated on macOS. Resolution, frame rate, and latency depend on the device and its compatibility.

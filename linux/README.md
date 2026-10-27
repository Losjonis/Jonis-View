Jonis View for Linux

Independent edition featuring a dark interface with soft pink accents. Supports USB video, selectable audio, quality settings (including 1440p), fullscreen mode, and volume control. It does not record or upload video.

Try it on Linux

Install Node.js LTS with npm. Open a terminal in this folder:

sh
npm ci
npm start


Connect a USB UVC capture device compatible with your Linux distribution, select it, and click Connect. In Settings, select the corresponding audio input.

Move the mouse while in fullscreen mode to display the volume control.

Keyboard shortcuts
F — Enter fullscreen mode.
Esc — Exit fullscreen mode.
M — Mute or unmute audio.
Requirements and troubleshooting

Use a graphical desktop session with the libraries required by Electron.

Video functionality depends on Linux recognizing the capture device. Audio functionality depends on the devices available on your system.

If something fails, check:

Device permissions.
Audio input settings.
Whether another application is using the capture device.

Run the application as a regular user, not as root. Do not disable the sandbox.

Build the installer on Linux

Run the following command from the project directory:

sh
npm run dist


The x64 AppImage will be created in the dist directory.

Make it executable and launch it:

sh
chmod +x dist/Jonis-View-0.1.2-x64.AppImage
./dist/Jonis-View-0.1.2-x64.AppImage

AppImage compatibility

Some Linux distributions require their FUSE compatibility package to run AppImage files.

If FUSE is unavailable, you can extract the application:

sh
./dist/Jonis-View-0.1.2-x64.AppImage --appimage-extract


Then launch it using:

sh
./squashfs-root/AppRun


The distribution's sandbox policies still apply.

Build a portable application directory

The following command creates a Linux x64 application directory without an installer:

sh
npm run pack


Copy the entire application directory to the target Linux system.

If the transfer process has removed executable permissions, mark jonis-view as executable. Launch it from a graphical desktop session.

Important: Copying only the jonis-view executable is not sufficient. The entire application directory is required.

Validation

Run the tests:

sh
npm test
npm run smoke
```

La prueba funcional usa dispositivos sintéticos. La interfaz, captura simulada, audio, tamaños de ventana, volumen en pantalla completa y preferencias se comprueban en Windows. El funcionamiento real en Linux, sus permisos y la compatibilidad X11/Wayland necesitan probarse en un equipo Linux; no se certifican distribuciones concretas todavía. El empaquetado está configurado para Intel/AMD de 64 bits, no ARM.

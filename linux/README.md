# Jonis View para Linux

Edición independiente con la interfaz oscura y rosa tenue. Mantiene vídeo USB, audio seleccionable, ajustes de calidad (incluido 1440p), pantalla completa y control de volumen. No graba ni sube el vídeo.

## Probar en Linux

Instala Node.js LTS con npm. Abre una terminal en esta carpeta:

```sh
npm ci
npm start
```

Conecta una capturadora USB UVC compatible con tu distribución, selecciónala y pulsa Conectar. En Ajustes selecciona la entrada de audio correspondiente. Mueve el ratón en pantalla completa para mostrar el volumen. F abre pantalla completa, Esc sale y M silencia.

Usa una sesión gráfica de escritorio con las bibliotecas que requiere Electron. El vídeo depende de que Linux reconozca la capturadora; el audio depende de los dispositivos disponibles en el sistema. Si falla, comprueba los permisos del dispositivo, la configuración de audio y si otra aplicación está ocupando la capturadora. Ejecuta como usuario normal, no como root; no desactives el sandbox.

## Generar el instalador en Linux

```sh
npm run dist
```

El AppImage x64 aparecerá en `dist`. Dale permiso de ejecución y ábrelo:

```sh
chmod +x dist/Jonis-View-0.1.2-x64.AppImage
./dist/Jonis-View-0.1.2-x64.AppImage
```

Algunas distribuciones necesitan instalar su paquete de compatibilidad FUSE para ejecutar AppImage. Si FUSE no está disponible, puedes extraerlo con `./dist/Jonis-View-0.1.2-x64.AppImage --appimage-extract` y ejecutar `./squashfs-root/AppRun`. Las políticas de sandbox de la distribución siguen aplicándose.

`npm run pack` genera una carpeta de aplicación Linux x64, sin instalador. Copia la carpeta completa a Linux, marca `jonis-view` como ejecutable si el transporte perdió los permisos y ejecútalo desde una sesión gráfica. No basta con copiar solo ese archivo.

## Validación

```sh
npm test
npm run smoke
```

La prueba funcional usa dispositivos sintéticos. La interfaz, captura simulada, audio, tamaños de ventana, volumen en pantalla completa y preferencias se comprueban en Windows. El funcionamiento real en Linux, sus permisos y la compatibilidad X11/Wayland necesitan probarse en un equipo Linux; no se certifican distribuciones concretas todavía. El empaquetado está configurado para Intel/AMD de 64 bits, no ARM.

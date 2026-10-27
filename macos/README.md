# Jonis View · macOS

Proyecto independiente de la edición Windows. Misma captura USB, perfiles hasta 1440p/4K según el dispositivo, audio, ajustes locales y volumen en pantalla completa. Interfaz clara, detalles rosa, controles nativos de ventana y menú de macOS.

## Probar

Instala Node.js LTS en un Mac, abre Terminal en esta carpeta y ejecuta:

```sh
npm ci
npm start
```

Conecta una capturadora compatible con UVC en macOS. Pulsa Conectar y acepta el permiso de Cámara. Para escucharla, selecciona su entrada en Ajustes y acepta Micrófono. Si deniegas un permiso, actívalo en Ajustes del Sistema > Privacidad y seguridad y reinicia la app.

F: pantalla completa. M: silenciar. Esc: salir. En pantalla completa mueve el ratón para mostrar el volumen. Cmd+, abre ajustes; Cmd+Q sale. Cerrar la ventana conserva la aplicación en el Dock; pulsar su icono la abre de nuevo.

## Instalador para Mac

En un Mac:

```sh
npm run dist
```

Genera DMG y ZIP en `dist`, separados para Apple Silicon (arm64) e Intel (x64). `npm run pack` genera la aplicación sin instalador. El identificador provisional es `com.jonisapps.jonisview`; debe coincidir con el que registres en tu cuenta Apple antes de publicar.

La firma Developer ID y la notarización requieren una cuenta Apple Developer y credenciales configuradas en el Mac de compilación. No se incluyen certificados ni credenciales. Sin ellos el resultado no es una distribución firmada/notarizada y Gatekeeper puede bloquearla. Configuración: https://www.electron.build/v26/docs/code-signing-mac/

Esta configuración prepara distribución directa por DMG, no un envío a la Mac App Store. Esa tienda requiere un perfil MAS, sandbox, certificados y perfiles de aprovisionamiento propios, además de pruebas y revisión.

## Validación

```sh
npm test
npm run smoke
```

La prueba funcional usa cámara y audio sintéticos y comprueba tamaños de ventana, captura, audio, pantalla completa, volumen y preferencias. Se ha preparado una previsualización en Windows; los permisos nativos, menús, firma y funcionamiento con capturadoras reales necesitan validación en macOS. Resolución, frecuencia y latencia dependen del dispositivo y su compatibilidad.

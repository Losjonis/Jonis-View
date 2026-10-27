# Jonis View

Visor de capturadoras USB UVC para Windows, con interfaz oscura en rosa tenue. Vídeo directo, audio de entrada y salida seleccionable, volumen, pantalla completa (F, Esc, doble clic), ajuste/relleno y preferencias locales. Permite guardar imágenes PNG, clips MP4 y los últimos segundos de la señal. Todo se procesa localmente.

## Ejecutar

Requiere Node.js LTS y Windows 10/11 x64.

```powershell
npm ci
npm start
```

Conecta dispositivo HDMI → entrada HDMI de la capturadora → USB del ordenador. Selecciona la fuente y pulsa **Conectar señal**. Para oír el dispositivo, selecciona su entrada de audio; el micrófono no se activa automáticamente. Cierra otros programas que utilicen la capturadora.

## Construir y verificar

```powershell
npm test
npm run smoke
npm run pack
npm run dist
```

`pack` genera `dist/win-unpacked/Jonis View.exe`; `dist` genera el ejecutable portable. `smoke` prueba la aplicación Electron con vídeo y audio sintéticos, sin activar hardware. Microsoft Store: consulta [STORE.md](STORE.md).

La resolución y FPS elegidos son preferencias; la barra superior muestra los valores negociados realmente. La latencia depende de hardware, formato y Chromium; no se promete latencia cero. HDCP no se elude. Una imagen negra procedente de la capturadora no implica que el USB esté desconectado. La comprobación final de sonido, estabilidad, sincronización y retraso requiere el dispositivo físico.

## Arquitectura

Electron con renderer aislado y sandbox, sin Node en la interfaz. Captura UVC por MediaDevices/getUserMedia, reproducción de vídeo y audio; grabación opcional con MediaRecorder y exportación local mediante FFmpeg. Permisos limitados a medios y a la página local de la aplicación; navegación externa bloqueada. `powerSaveBlocker` mantiene el monitor encendido mientras hay captura. Preferencias en localStorage; los dispositivos se liberan al desconectar o cerrar.

## Capturas y clips (Windows 0.2.0)

P guarda un PNG a la resolución recibida. R inicia o detiene un clip MP4 H.264/AAC. En Ajustes, activa la repetición de 15, 30 o 60 segundos; B guarda ese intervalo (o el disponible si acabas de activarla). Al guardar una repetición comienza un nuevo historial. La repetición está desactivada por defecto y se desactiva al cambiar de fuente, formato o audio.

Se guarda en Vídeos/Jonis View; Ajustes permite cambiar y abrir la carpeta. El volumen y silencio afectan a la escucha, no al audio grabado. Los controles también aparecen en pantalla completa. El contador indica grabación manual. Desconectar o cerrar finaliza el clip; espera mientras se exporta.

La repetición utiliza segmentos temporales en disco con un límite aproximado de 72 segundos (más el clip que se esté exportando). Se eliminan al detenerla normalmente. Un cierre forzado puede dejar temporales; si falla la exportación se conserva el material y se muestra su ubicación para recuperarlo. La grabación manual ocupa disco según su duración. La exportación MP4 usa CPU y puede tardar, especialmente a 1440p/4K.

Prueba automática de archivos: `node scripts/clips-check.cjs`. Valida PNG, decodificación MP4 con audio, duración de repetición y finalización al desconectar. La sincronización con hardware real requiere una prueba con tu capturadora.

## Exportación GPU (Windows 0.2.2)

Ajustes → Exportar con GPU habilita la codificación H.264 mediante NVIDIA NVENC, Intel Quick Sync o AMD AMF, según disponibilidad. Está desactivada por defecto y recuerda la elección. La app prueba los codificadores con fotogramas reales; si la GPU falla al exportar, reintenta con CPU y muestra el codificador utilizado. Afecta a clips y repeticiones MP4, no a capturas PNG ni a la captura temporal. El audio sigue codificándose con CPU. La velocidad y calidad dependen del hardware, los controladores y el formato; no elimina toda la espera de guardado. En 0.2.3 se corrigió un falso negativo de detección de NVENC: la prueba usa 640 × 480, ya que NVIDIA puede rechazar 128 × 128. Verificado en una RTX 3060 con exportación H.264 a 1080p60 y decodificación del MP4 resultante.

## Idioma automático (Windows 0.3.0)

La app utiliza el primer idioma preferido de Windows al iniciarse. Admite español, inglés, francés, alemán, sueco y ruso, igual que la web. Las variantes regionales comparten traducción (por ejemplo, es-MX y es-ES). Si el idioma no está incluido, usa inglés. Reinicia la app tras cambiar el idioma de Windows. No se modifican las preferencias del sistema ni los nombres de los dispositivos. Los atajos físicos F/M/P/R/B también funcionan con una distribución de teclado rusa.

El catálogo editable está en src/translations.txt (columnas es, en, fr, de, sv, ru). Ejecuta npm run build:i18n tras modificarlo y npm run test:languages para probar los seis idiomas y el respaldo en inglés.

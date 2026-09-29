# Fake Snake Game

Juego de verificación en un solo archivo HTML. El botón «Descargar juego para usar sin Internet» descarga `Fake-Snake-Game.html`. En computador se abre ese archivo en un navegador, incluso sin conexión. En Android, se abre desde Archivos con un navegador compatible con HTML local.

Para tener un acceso directo con la cara de la serpiente, abre la página con Internet y pulsa **Instalar con ícono para jugar sin Internet**. En Chrome o Edge aparecerá el instalador cuando el navegador lo permita; en iPhone o iPad, abre la página en Safari y usa **Compartir → Agregar a pantalla de inicio**. Espera a que termine de cargar antes de desconectarte. La instalación usa `manifest.webmanifest` y `sw.js` bajo HTTPS. El archivo HTML descargado sigue funcionando sin manifest ni servidor, pero el sistema operativo mostrará el ícono genérico del archivo HTML; su pestaña sí utiliza el favicon del juego.

Al abrir el archivo descargado o la aplicación web sin conexión, el juego permite jugar sin registro. El progreso se guarda localmente en ese navegador; las sesiones sin conexión no se envían a Google ni se sincronizan después. Con conexión, la versión web conserva el registro y el seguimiento existentes.

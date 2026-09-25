# La víbora de la mentira

Juego de verificación en un solo archivo HTML. El botón «Descargar juego para usar sin Internet» descarga `La-vibora-de-la-mentira.html`. En computador se abre ese archivo en un navegador, incluso sin conexión. En Android, se abre desde Archivos con un navegador compatible con HTML local.

En iPhone o iPad, abre la página con Safari mientras tienes conexión, selecciona **Compartir → Añadir a pantalla de inicio** y espera a que termine de cargar antes de desconectarte. La instalación usa `manifest.webmanifest` y `sw.js`; requiere HTTPS, como el de GitHub Pages. En Chrome de Android o de escritorio también se puede instalar la aplicación desde el menú del navegador. La descarga del HTML funciona sin manifest ni servidor.

Al abrir el archivo descargado o la aplicación web sin conexión, el juego permite jugar sin registro. El progreso se guarda localmente en ese navegador; las sesiones sin conexión no se envían a Google ni se sincronizan después. Con conexión, la versión web conserva el registro y el seguimiento existentes.

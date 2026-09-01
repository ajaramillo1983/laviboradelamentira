# Registro de jugadores

Este código conecta la página pública del juego con la hoja privada **«Seguimiento · La víbora de la mentira»**.

## Publicación del endpoint

1. Abre [Google Apps Script](https://script.google.com/) con la cuenta propietaria de la hoja.
2. Crea un proyecto y reemplaza el contenido de `Code.gs` por el archivo de esta carpeta.
3. Selecciona **Implementar → Nueva implementación → Aplicación web**.
4. Configura **Ejecutar como: yo** y **Quién tiene acceso: cualquier usuario**.
5. Autoriza el acceso a la hoja y copia la URL que termina en `/exec`.
6. En `index.html`, reemplaza `__GOOGLE_APPS_SCRIPT_WEB_APP_URL__` por esa URL.

La aplicación valida y limita la longitud de los campos, evita duplicados por `session_id` durante seis horas y nunca guarda contraseñas. El formulario no habilita el juego si el envío falla.

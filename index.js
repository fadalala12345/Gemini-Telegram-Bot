const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const http = require('http');

// سيرفر بسيط للحفاظ على نشاط الخدمة
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('QR Engine is Ready\n');
}).listen(process.env.PORT || 10000);

const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// إظهار الـ QR في السجلات فوراً
client.on('qr', (qr) => {
    console.log('--- اتبع التعليمات أدناه ---');
    qrcode.generate(qr, {small: true});
    console.log('📸 قم بمسح الكود أعلاه بهاتفك الآن');
});

client.on('ready', () => {
    console.log('✅ تم الربط بنجاح! البوت يعمل الآن.');
});

client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return;
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        await msg.reply(response.data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("خطأ في رد Gemini");
    }
});

client.initialize();

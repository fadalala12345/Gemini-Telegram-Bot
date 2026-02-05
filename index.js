const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const http = require('http');

// 1. حل مشكلة الـ Port في Render لتجنب الرسائل الحمراء
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot is Running Successfully\n');
}).listen(process.env.PORT || 10000);

// 2. إعدادات Gemini (مفتاحك الخاص)
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

// 3. إعدادات المتصفح لتجاوز خطأ (Sandbox) و (Root) في Render
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// 4. توليد كود الـ QR للربط بالرقم 0924803945
client.on('qr', (qr) => {
    console.log('--- امسح الكود التالي عبر واتساب في هاتفك ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('تم الربط بنجاح! البوت جاهز الآن للرد من الرقم: 0924803945');
});

// 5. منطق الرد التلقائي باستخدام Gemini
client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; // تجاهل المجموعات لتوفير الاستهلاك

    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("خطأ في الاتصال بـ Gemini أو معالجة الرسالة.");
    }
});

client.initialize();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// مفتاح Gemini الخاص بك الذي رأيناه في الكود السابق
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppetter: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('--- امسح الكود التالي عبر واتساب في هاتفك ---');
});

client.on('ready', () => {
    console.log('تم الربط بنجاح! البوت جاهز الآن للرد من الرقم: 0924803945');
});

client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; // تجاهل المجموعات لتوفير الاستهلاك

    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("خطأ في الاتصال بـ Gemini، تأكد من سلامة المفتاح");
    }
});

client.initialize();

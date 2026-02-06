const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const http = require('http');

// 1. سيرفر لإبقاء الخدمة حية وتجنب إيقاف Render لها
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot Engine is Online\n');
}).listen(process.env.PORT || 10000);

// 2. إعدادات Gemini الخاصة بك
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

// 3. تهيئة البوت بإعدادات متوافقة مع Render وتتجاوز الخطأ الأحمر
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

// 4. إظهار الـ QR في السجلات
client.on('qr', (qr) => {
    console.log('--- كود QR جديد للمسح ---');
    qrcode.generate(qr, {small: true});
    console.log('📸 امسح الكود الآن بهاتفك الأساسي');
});

// 5. تأكيد نجاح الاتصال
client.on('ready', () => {
    console.log('✅ مبروك! البوت مرتبط الآن وبدأ العمل.');
});

// 6. محرك الردود الذكي عبر Gemini
client.on('message', async msg => {
    // تجاهل رسائل المجموعات لتقليل الضغط
    if (msg.from.includes('@g.us')) return;

    try {
        console.log(`📩 رسالة مستلمة: ${msg.body}`);
        
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });

        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
        console.log('📤 تم الرد بواسطة Gemini بنجاح.');

    } catch (e) {
        console.error("⚠️ خطأ في معالجة الرد عبر Gemini.");
    }
});

// انطلاق البوت
client.initialize();

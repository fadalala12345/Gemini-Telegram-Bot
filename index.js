const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const http = require('http');

// 1. تشغيل سيرفر بسيط لإبقاء الخدمة حية على Render
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot Engine is Running\n');
}).listen(process.env.PORT || 10000);

// 2. إعدادات Gemini الخاصة بك
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

// 3. تهيئة البوت بأخف إعدادات ممكنة لـ Render
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    }
});

// 4. دالة طلب الكود الرقمي الاستراتيجية
async function startEngine() {
    console.log("🚀 جاري بدء المحرك التقني...");
    await client.initialize();

    // ننتظر 20 ثانية لضمان تحميل صفحة واتساب بالكامل قبل طلب الكود
    setTimeout(async () => {
        try {
            const myNumber = "218924803945"; 
            const code = await client.requestPairingCode(myNumber);
            console.log('**********************************************');
            console.log('✅ كود الربط الخاص بك هو: ' + code);
            console.log('**********************************************');
        } catch (err) {
            console.log("❌ تعذر استخراج الكود حالياً، يرجى عمل Manual Deploy مرة أخرى.");
        }
    }, 20000);
}

// 5. استقبال الرسائل والرد عبر الذكاء الاصطناعي
client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; 
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("⚠️ خطأ في رد Gemini.");
    }
});

client.on('ready', () => {
    console.log('🎊 مبروك! البوت متصل الآن بنجاح.');
});

// انطلاق العملية
startEngine();

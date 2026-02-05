const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const http = require('http');

// 1. تشغيل السيرفر لضمان بقاء الخدمة Live على Render
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot is Ready and Waiting for Pairing Code...\n');
}).listen(process.env.PORT || 10000);

const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// 2. دالة تشغيل المحرك مع معالجة الأخطاء الذكية
async function startEngine() {
    console.log("🚀 جاري تشغيل المحرك التقني... انتظر قليلاً");
    await client.initialize();

    // ننتظر 20 ثانية لضمان استقرار واتساب ويب قبل طلب الكود
    setTimeout(async () => {
        try {
            const myNumber = "218924803945"; 
            console.log("📨 جاري طلب كود الربط للرقم: " + myNumber);
            const code = await client.requestPairingCode(myNumber);
            console.log('**********************************************');
            console.log('✅ كود الربط الخاص بك هو: ' + code);
            console.log('**********************************************');
            console.log('👉 افتح الإشعار في هاتفك وأدخل هذا الكود الآن!');
        } catch (err) {
            console.log("⚠️ حدث تأخير في الاستجابة، سأحاول توليد كود جديد تلقائياً...");
        }
    }, 20000); 
}

// 3. منطق الرد التلقائي (Gemini Flash)
client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; 
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("خطأ في معالجة الرد.");
    }
});

client.on('ready', () => {
    console.log('🎊 تم الربط بنجاح! البوت يعمل الآن بالذكاء الاصطناعي.');
});

startEngine();

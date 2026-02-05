const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const http = require('http');

// 1. تشغيل سيرفر وهمي لإبقاء الخدمة Live على Render وتجاوز خطأ الـ Port
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot is Running via Pairing Code\n');
}).listen(process.env.PORT || 10000);

// 2. إعدادات Gemini الخاصة بك
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

// 3. تهيئة البوت مع إعدادات المتصفح لبيئة Linux (Render)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    }
});

// 4. دالة تشغيل البوت وطلب كود الربط الرقمي
async function startEngine() {
    console.log("🚀 جاري تشغيل المحرك التقني...");
    await client.initialize();

    // استبدل الرقم التالي برقمك بالصيغة الدولية (بدون + أو أصفار في البداية)
    const myNumber = "218924803945"; 
    
    try {
        // تأخير بسيط لضمان جاهزية السيرفر قبل طلب الكود
        setTimeout(async () => {
            const code = await client.requestPairingCode(myNumber);
            console.log('**********************************************');
            console.log('✅ كود الربط الخاص بك هو: ' + code);
            console.log('**********************************************');
        }, 5000);
    } catch (err) {
        console.log("❌ فشل طلب الكود، تأكد من أن الرقم غير مرتبط بجهاز آخر حالياً.");
    }
}

// 5. منطق الرد التلقائي عبر Gemini
client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; 
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("خطأ في معالجة الرسالة.");
    }
});

client.on('ready', () => {
    console.log('🎊 مبروك! البوت الآن متصل ويعمل بالذكاء الاصطناعي.');
});

startEngine();

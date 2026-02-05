const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const http = require('http');

// 1. إنشاء سيرفر لإبقاء الخدمة نشطة على Render
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot is Live and Waiting for Pairing Code\n');
}).listen(process.env.PORT || 10000);

// 2. مفتاح Gemini الخاص بك
const GEMINI_KEY = "AlzaSyAEDxL8dJux-yWVaJ-T_TF0gHi18bzWWyc"; 

// 3. إعدادات المتصفح لبيئة Linux في Render
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

// 4. المحرك الاستراتيجي لطلب كود الربط الرقمي
async function startEngine() {
    console.log("🚀 جاري تشغيل المحرك التقني... انتظر قليلاً");
    await client.initialize();

    // محاولة طلب الكود كل 15 ثانية حتى ينجح ويظهر في Logs
    const requestInterval = setInterval(async () => {
        try {
            // الرقم بالصيغة الدولية (ليبيا)
            const myNumber = "218924803945"; 
            const code = await client.requestPairingCode(myNumber);
            
            console.log('**********************************************');
            console.log('✅ كود الربط الخاص بك هو: ' + code);
            console.log('**********************************************');
            
            // التوقف عن الطلب بمجرد الحصول على الكود بنجاح
            if (code) clearInterval(requestInterval); 
        } catch (err) {
            console.log("⏳ المحرك يحاول استخراج الكود من واتساب ويب... يرجى الانتظار");
        }
    }, 15000); 
}

// 5. منطق استقبال الرسائل والرد عبر Gemini
client.on('message', async msg => {
    if (msg.from.includes('@g.us')) return; // تجاهل المجموعات
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: msg.body }] }]
        });
        const botReply = response.data.candidates[0].content.parts[0].text;
        await msg.reply(botReply);
    } catch (e) {
        console.error("⚠️ خطأ في معالجة رد Gemini.");
    }
});

client.on('ready', () => {
    console.log('🎊 مبروك! تم الربط بنجاح والبوت جاهز للرد الآن.');
});

// تشغيل المحرك
startEngine();

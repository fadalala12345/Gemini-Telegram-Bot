const { Client, LocalAuth } = require('whatsapp-web.js');
const http = require('http');

// حل مشكلة المنفذ في Render
http.createServer((req, res) => { res.end('Bot is Live'); }).listen(process.env.PORT || 10000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// --- التعديل الاستراتيجي للربط بالرقم ---
client.on('ready', () => {
    console.log('✅ تم الاتصال بنجاح!');
});

async function startBot() {
    await client.initialize();
    
    // طلب كود الربط للرقم الخاص بك
    // ملاحظة: الرقم يجب أن يكون بالصيغة الدولية بدون اصفار أو +
    const myNumber = "218924803945"; 
    const code = await client.requestPairingCode(myNumber);
    console.log('🚀 كود الربط الخاص بك هو: ' + code);
}

startBot();

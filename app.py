import requests
from flask import Flask, request

app = Flask(__name__)

TOKEN = "8465944522:AAFRZ7lQF42PCj0m4TIunLGZodNJFEZ9b4c"
GEMINI_KEY = "AIzaSyAEDxL8dJux-yRVej-t_TF0gHIi8brWWyc"

@app.route('/', methods=['POST'])
def handle_webhook():
    data = request.get_json()
    # التحقق من وجود رسالة نصية
    if "message" in data and "text" in data["message"]:
        chat_id = data["message"]["chat"]["id"]
        user_text = data["message"]["text"]
        
        # إعداد طلب Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
        payload = {"contents": [{"parts": [{"text": user_text}]}]}
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            result = response.json()
            
            # استخراج النص بمرونة عالية
            if "candidates" in result and result["candidates"]:
                ai_text = result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                ai_text = "عذراً، لم أستطع معالجة هذا الطلب حالياً."

            # إرسال الرد إلى تليجرام
            requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", 
                          json={"chat_id": chat_id, "text": ai_text})
        except Exception as e:
            print(f"Error: {e}")

    return "ok", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)

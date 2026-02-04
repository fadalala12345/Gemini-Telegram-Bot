import requests
from flask import Flask, request

app = Flask(__name__)

# بياناتك السرية التي حصلنا عليها
TELEGRAM_TOKEN = "8465944522:AAFRZ7lQF42PCj0m4TIunLGZodNJFEZ9b4c"
GEMINI_KEY = "AIzaSyAEDxL8dJux-yRVej-t_TF0gHIi8brWWyc"

@app.route('/', methods=['POST'])
def webhook():
    data = request.get_json()
    if "message" in data:
        chat_id = data["message"]["chat"]["id"]
        user_text = data["message"].get("text", "")
        
        # نداء ذكاء Gemini الاصطناعي
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
        try:
            res = requests.post(url, json={"contents": [{"parts": [{"text": user_text}]}]})
            if res.status_code == 200:
                ai_reply = res.json()['candidates'][0]['content']['parts'][0]['text']
                # إرسال الرد إلى تليجرام
                requests.post(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": ai_reply})
        except Exception as e:
            print(f"Error: {e}")
            
    return "OK", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)


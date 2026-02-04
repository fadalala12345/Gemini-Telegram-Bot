import requests
from flask import Flask, request

app = Flask(__name__)

# بياناتك الصحيحة من الصور
TOKEN = "8465944522:AAFRZ7lQF42PCj0m4TIunLGZodNJFEZ9b4c"
GEMINI_KEY = "AIzaSyAEDxL8dJux-yRVej-t_TF0gHIi8brWWyc"

@app.route('/', methods=['POST'])
def bot_logic():
    data = request.get_json()
    if "message" in data:
        chat_id = data["message"]["chat"]["id"]
        text = data["message"].get("text", "")
        
        # طلب الرد من Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
        res = requests.post(url, json={"contents": [{"parts": [{"text": text}]}]})
        
        if res.status_code == 200:
            ai_reply = res.json()['candidates'][0]['content']['parts'][0]['text']
            # إرسال الجواب لتليجرام
            requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={"chat_id": chat_id, "text": ai_reply})
            
    return "ok", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)

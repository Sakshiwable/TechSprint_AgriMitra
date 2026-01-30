from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini (if key exists)
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')

@app.route('/', methods=['GET'])
def home():
    return "AgriMitra Chatbot Service is Running!"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        language = data.get("language", "en") 

        if not user_message:
            return jsonify({"response": "Please say something!"})

        # 1. Try Gemini if available
        if GENAI_API_KEY:
            try:
                # Add context about agriculture
                prompt = f"You are AgriMitra, an expert agricultural assistant for Indian farmers. Answer the following question in {language} language simply and clearly: {user_message}"
                response = model.generate_content(prompt)
                return jsonify({"response": response.text})
            except Exception as e:
                print(f"Gemini Error: {e}")
                # Fallback if Gemini fails
        
        # 2. Fallback Rule-based logic
        msg_lower = user_message.lower()
        
        response = "I am not sure about that. Please visit the Schemes page for more info."

        if "pm kisan" in msg_lower:
            response = "PM-KISAN provides Rs 6000 per year to eligible farmer families. You can apply at pmkisan.gov.in."
        elif "insurance" in msg_lower or "bima" in msg_lower:
            response = "PMFBY (Pradhan Mantri Fasal Bima Yojana) covers crop loss due to natural calamities."
        elif "hello" in msg_lower or "namaste" in msg_lower:
            response = "Namaste! I am AgriMitra. Ask me about schemes, crops, or farming tips."
        
        # Simple translation simulation for demo (if not using LLM)
        if language == "hi":
           if "pm kisan" in msg_lower: response = "पीएम-किसान पात्र किसान परिवारों को प्रति वर्ष 6000 रुपये प्रदान करता है।"
           elif "hello" in msg_lower: response = "नमस्ते! मैं एग्रीमित्र हूँ। मुझसे योजनाओं या फसलों के बारे में पूछें।"
        
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

from scraper import get_all_live_schemes

@app.route('/schemes/live', methods=['GET'])
def get_live_schemes():
    try:
        schemes = get_all_live_schemes()
        return jsonify(schemes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)


import os
import json
import argostranslate.package
import argostranslate.translate
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Cache for loaded valid language codes
SUPPORTED_LANGUAGES = ['hi', 'mr', 'ta', 'te', 'kn', 'ml', 'gu', 'pa', 'bn']

def install_languages():
    """
    Install English translation packages for supported Indian languages.
    """
    print("🔄 Updating package index...")
    argostranslate.package.update_package_index()
    available_packages = argostranslate.package.get_available_packages()
    
    # We want to translate FROM English TO these languages
    # Argos Translate uses ISO codes (usually 2 letter)
    
    targets = ['hi'] # Marathi ('mr') might not be directly supported in standard Argos index, checking availability
    
    # Check what is available
    installed = argostranslate.package.get_installed_packages()
    installed_codes = [p.to_code for p in installed]
    
    print(f"📦 Installed targets: {installed_codes}")
    
    for code in targets:
        if code not in installed_codes:
            print(f"📥 Installing en -> {code}...")
            # Find package
            package_to_install = next(
                filter(
                    lambda x: x.from_code == 'en' and x.to_code == code, 
                    available_packages
                ), 
                None
            )
            
            if package_to_install:
                package_to_install.install()
                print(f"✅ Installed en -> {code}")
            else:
                print(f"❌ Package en -> {code} not found available.")

# Run installation on startup (blocking, but necessary for first run)
try:
    install_languages()
except Exception as e:
    print(f"⚠️ Error installing languages: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "translation_service"})

@app.route('/translate', methods=['POST'])
def translate():
    """
    Request body:
    {
        "text": "Rice price is increasing",
        "source": "en",
        "target": "hi"
    }
    """
    try:
        data = request.json
        text = data.get('text', '')
        source_lang = data.get('source', 'en')
        target_lang = data.get('target', 'hi')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        if target_lang == 'en':
            return jsonify({"translated_text": text})
            
        # Argos Translate
        try:
            translated_text = argostranslate.translate.translate(text, source_lang, target_lang)
            return jsonify({"translated_text": translated_text})
        except Exception as e:
            # Fallback or error
            print(f"Translation Error: {e}")
            # If language not supported, return original
            return jsonify({"translated_text": text, "warning": "Translation failed, returned original"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)

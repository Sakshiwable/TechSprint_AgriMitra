const axios = require('axios');

async function testTranslation() {
  try {
    console.log('Testing translation service...');
    
    const response = await axios.post('http://localhost:8001/translate', {
      text: 'Government Schemes',
      source_lang: 'en',
      target_lang: 'hi'
    });
    
    console.log('✅ Translation service is working!');
    console.log('Original:', 'Government Schemes');
    console.log('Translated:', response.data.translated_text);
    console.log('Confidence:', response.data.confidence);
    
  } catch (error) {
    console.error('❌ Translation service test failed:', error.message);
  }
}

testTranslation();
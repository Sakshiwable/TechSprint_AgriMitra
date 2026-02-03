const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple translation mappings
const translations = {
  hi: {
    'Government Schemes': 'सरकारी योजनाएं',
    'Market Prices': 'बाज़ार भाव',
    'Search': 'खोजें',
    'Filter': 'फ़िल्टर',
    'All Schemes': 'सभी योजनाएं',
    'State Schemes': 'राज्य योजनाएं',
    'Central Schemes': 'केंद्रीय योजनाएं',
    'Sort': 'क्रमबद्ध करें',
    'Maharashtra': 'महाराष्ट्र',
    'Rice': 'चावल',
    'Wheat': 'गेहूं',
    'Onion': 'प्याज',
    'Tomato': 'टमाटर',
    'Potato': 'आलू',
    'Save': 'सहेजें',
    'Cancel': 'रद्द करें',
    'Submit': 'जमा करें',
    'Edit': 'संपादित करें',
    'Delete': 'हटाएं',
    'View': 'देखें'
  },
  mr: {
    'Government Schemes': 'सरकारी योजना',
    'Market Prices': 'बाजार भाव',
    'Search': 'शोधा',
    'Filter': 'फिल्टर',
    'All Schemes': 'सर्व योजना',
    'State Schemes': 'राज्य योजना',
    'Central Schemes': 'केंद्रीय योजना',
    'Sort': 'क्रमवारी लावा',
    'Maharashtra': 'महाराष्ट्र',
    'Rice': 'तांदूळ',
    'Wheat': 'गहू',
    'Onion': 'कांदा',
    'Tomato': 'टोमॅटो',
    'Potato': 'बटाटा',
    'Save': 'जतन करा',
    'Cancel': 'रद्द करा',
    'Submit': 'सबमिट करा',
    'Edit': 'संपादित करा',
    'Delete': 'हटवा',
    'View': 'पहा'
  }
};

app.get('/', (req, res) => {
  res.json({ service: 'Mock Translation Service', status: 'running' });
});

app.post('/translate', (req, res) => {
  const { text, target_lang } = req.body;
  
  let translated = text;
  if (translations[target_lang] && translations[target_lang][text]) {
    translated = translations[target_lang][text];
  }
  
  res.json({
    translated_text: translated,
    confidence: translated !== text ? 0.9 : 0.1,
    source_lang: 'en',
    target_lang
  });
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Mock Translation Service running on port ${PORT}`);
});

module.exports = app;
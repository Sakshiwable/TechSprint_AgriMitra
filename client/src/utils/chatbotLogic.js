export const generateResponse = async (message, language = "en") => {
  const lowerMsg = message.toLowerCase();
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const responses = {
    en: {
      default: "I'm not sure about that, but I can help with farming, crops, and weather!",
      greetings: ["hello", "hi", "hey"],
      greetingResponse: "Hello! How can I assist you with your farming today?",
      weather: ["weather", "rain", "temperature", "forecast"],
      weatherResponse: "The weather seems good for planting. Make sure to check the specific forecast for your region.",
      crops: ["crop", "planting", "wheat", "rice", "corn"],
      cropResponse: "For crop advice, ensure you test your soil first. I can help you analyze crop diseases too!",
      schemes: ["scheme", "subsidy", "government", "loan"],
      schemesResponse: "There are several government schemes available using PM-Kisan. Check the Schemes section for more details.",
    },
    hi: {
      default: "मुझे इसके बारे में यकीन नहीं है, लेकिन मैं खेती, फसलों और मौसम में मदद कर सकता हूं!",
      greetings: ["नमस्ते", "हलो", "हाय"],
      greetingResponse: "नमस्ते! आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
      weather: ["मौसम", "बारिश", "तापमान"],
      weatherResponse: "खेती के लिए मौसम अच्छा लग रहा है। अपने क्षेत्र का सटीक पूर्वानुमान देखना न भूलें।",
      crops: ["फसल", "गेहूं", "चावल", "मक्का"],
      cropResponse: "फसल सलाह के लिए, पहले अपनी मिट्टी की जाँच करें। मैं फसल रोगों के विश्लेषण में भी मदद कर सकता हूँ!",
      schemes: ["योजना", "सब्सिडी", "सरकार", "लोन"],
      schemesResponse: "PM-Kisan के तहत कई सरकारी योजनाएं उपलब्ध हैं। अधिक जानकारी के लिए योजना अनुभाग देखें।",
    },
    mr: {
      default: "मला त्याबद्दल खात्री नाही, पण मी शेती, पिके आणि हवामानाबाबत मदत करू शकतो!",
      greetings: ["नमस्कार", "हॅलो", "हाय"],
      greetingResponse: "नमस्कार! आज मी तुमच्या शेतीत कशी मदत करू?",
      weather: ["हवामान", "पाऊस", "तापमान"],
      weatherResponse: "शेतीसाठी हवामान चांगले दिसत आहे. तुमच्या भागाचा अचूक अंदाज नक्की पहा.",
      crops: ["पीक", "गहू", "तांदूळ", "मका"],
      cropResponse: "पिकाच्या सल्ल्यासाठी, आधी माती परीक्षण करा. मी पिकांच्या रोगांचे विश्लेषण करण्यासही मदत करू शकतो!",
      schemes: ["योजना", "अनुदान", "सरकार", "कर्ज"],
      schemesResponse: "PM-Kisan अंतर्गत अनेक सरकारी योजना उपलब्ध आहेत. अधिक माहितीसाठी योजना विभाग पहा.",
    }
  };

  const langData = responses[language] || responses["en"];
  
  if (langData.greetings.some(k => lowerMsg.includes(k))) return langData.greetingResponse;
  if (langData.weather.some(k => lowerMsg.includes(k))) return langData.weatherResponse;
  if (langData.crops.some(k => lowerMsg.includes(k))) return langData.cropResponse;
  if (langData.schemes.some(k => lowerMsg.includes(k))) return langData.schemesResponse;

  return langData.default;
};

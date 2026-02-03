import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import "./LanguageSelector.css";

const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages, loading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = availableLanguages.find((l) => l.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (lang) => {
    setIsOpen(false);
    await setLanguage(lang.code);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className={`lang-button ${loading ? "loading" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        title="Select Language"
      >
        <span className="flag">{currentLang?.flag}</span>
        <span className="lang-name">{currentLang?.nativeName}</span>
        <span className={`dropdown-icon ${isOpen ? "open" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === language ? "active" : ""}`}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="flag">{lang.flag}</span>
              <div className="lang-info">
                <span className="lang-native">{lang.nativeName}</span>
                <span className="lang-english">{lang.name}</span>
              </div>
              {lang.code === language && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

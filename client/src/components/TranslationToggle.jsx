import React from 'react';
import './TranslationToggle.css';

const TranslationToggle = ({ 
  isTranslated, 
  confidence, 
  onToggle, 
  originalLang = 'en',
  currentLang 
}) => {
  if (!isTranslated) {
    return null;
  }
  
  const getConfidenceBadge = (score) => {
    if (score >= 0.9) return { label: 'Excellent', class: 'excellent' };
    if (score >= 0.7) return { label: 'Good', class: 'good' };
    return { label: 'Low Quality', class: 'low' };
  };
  
  const badge = confidence ? getConfidenceBadge(confidence) : null;
  
  return (
    <div className="translation-toggle-container">
      <button 
        className="translation-toggle-btn"
        onClick={onToggle}
        title="View original content"
      >
        <span className="toggle-icon">🌐</span>
        <span className="toggle-text">View Original</span>
      </button>
      
      {badge && confidence < 0.9 && (
        <div className={`confidence-badge ${badge.class}`} title={`Translation confidence: ${(confidence * 100).toFixed(0)}%`}>
          <span className="badge-icon">ℹ️</span>
          <span className="badge-text">{badge.label} Translation</span>
        </div>
      )}
      
      {confidence && confidence < 0.7 && (
        <div className="translation-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Translation quality may be limited. 
            {onToggle && <button onClick={onToggle} className="warning-link">View original</button>}
          </span>
        </div>
      )}
    </div>
  );
};

export default TranslationToggle;

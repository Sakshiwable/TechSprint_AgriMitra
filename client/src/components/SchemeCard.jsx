import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SchemeCard.css';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/gov-schemes/${scheme._id}`);
  };

  return (
    <div className="scheme-card" onClick={handleClick}>
      <h3 className="scheme-title">{scheme.name}</h3>
      <p className="scheme-location">{scheme.state || scheme.type}</p>
      <p className="scheme-description">{scheme.shortDescription}</p>
      
      {scheme.tags && scheme.tags.length > 0 && (
        <div className="scheme-tags">
          {scheme.tags.slice(0, 5).map((tag, index) => (
            <span key={index} className="scheme-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemeCard;

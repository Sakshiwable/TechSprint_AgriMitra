import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/gov-schemes/${scheme._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-l-4 border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
            {scheme.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{scheme.state || scheme.type}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {scheme.shortDescription}
          </p>
          
          {scheme.tags && scheme.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {scheme.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-500 transition-colors">
          <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;

import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const FilterSidebar = ({ filters, selectedFilters, onFilterChange, onResetFilters }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDropdownChange = (filterType, value) => {
    const newFilters = { ...selectedFilters };
    if (value) {
      newFilters[filterType] = value;
    } else {
      delete newFilters[filterType];
    }
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (filterType, value) => {
    const newFilters = { ...selectedFilters };
    const currentValues = newFilters[filterType] || [];
    
    if (currentValues.includes(value)) {
      newFilters[filterType] = currentValues.filter(v => v !== value);
      if (newFilters[filterType].length === 0) {
        delete newFilters[filterType];
      }
    } else {
      newFilters[filterType] = [...currentValues, value];
    }
    
    onFilterChange(newFilters);
  };

  const handleSpecialTagChange = (tag) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[tag]) {
      delete newFilters[tag];
    } else {
      newFilters[tag] = 'true';
    }
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-emerald-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xl font-bold text-gray-800">Filter By</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold underline transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
          <select
            className="w-full px-4 py-2.5 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
            value={selectedFilters.state || ''}
            onChange={(e) => handleDropdownChange('state', e.target.value)}
          >
            <option value="">Select</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('gender')}
          >
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            {expandedSections.gender ? (
              <ChevronUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          {expandedSections.gender && (
            <div className="space-y-2 pl-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Male')}
                  onChange={() => handleCheckboxChange('gender', 'Male')}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Female')}
                  onChange={() => handleCheckboxChange('gender', 'Female')}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                />
                <span>Female</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Transgender')}
                  onChange={() => handleCheckboxChange('gender', 'Transgender')}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                />
                <span>Transgender</span>
              </label>
            </div>
          )}
        </div>

        {/* Age Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
          <select
            className="w-full px-4 py-2.5 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
            value={selectedFilters.age || ''}
            onChange={(e) => handleDropdownChange('age', e.target.value)}
          >
            <option value="">Select</option>
            <option value="18-35">18-35</option>
            <option value="35-60">35-60</option>
            <option value="60+">60+</option>
          </select>
        </div>

        {/* Caste */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('caste')}
          >
            <label className="text-sm font-semibold text-gray-700">Caste</label>
            {expandedSections.caste ? (
              <ChevronUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          {expandedSections.caste && (
            <div className="space-y-2 pl-2">
              {['General', 'SC', 'ST', 'OBC'].map((caste) => (
                <label key={caste} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={(selectedFilters.caste || []).includes(caste)}
                    onChange={() => handleCheckboxChange('caste', caste)}
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <span>{caste}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Residence */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('residence')}
          >
            <label className="text-sm font-semibold text-gray-700">Residence</label>
            {expandedSections.residence ? (
              <ChevronUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          {expandedSections.residence && (
            <div className="space-y-2 pl-2">
              {['Urban', 'Rural'].map((residence) => (
                <label key={residence} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={(selectedFilters.residence || []).includes(residence)}
                    onChange={() => handleCheckboxChange('residence', residence)}
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <span>{residence}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Benefit Type */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('benefitType')}
          >
            <label className="text-sm font-semibold text-gray-700">Benefit Type</label>
            {expandedSections.benefitType ? (
              <ChevronUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          {expandedSections.benefitType && (
            <div className="space-y-2 pl-2">
              {['Financial', 'Education', 'Health'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={(selectedFilters.benefitType || []).includes(type)}
                    onChange={() => handleCheckboxChange('benefitType', type)}
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Disability Percentage Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Disability Percentage</label>
          <select
            className="w-full px-4 py-2.5 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
            value={selectedFilters.disability || ''}
            onChange={(e) => handleDropdownChange('disability', e.target.value)}
          >
            <option value="">Select</option>
            <option value="40-60%">40-60%</option>
            <option value="60-80%">60-80%</option>
            <option value="80%+">80%+</option>
          </select>
        </div>

        {/* Employment Status */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('employmentStatus')}
          >
            <label className="text-sm font-semibold text-gray-700">Employment Status</label>
            {expandedSections.employmentStatus ? (
              <ChevronUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          {expandedSections.employmentStatus && (
            <div className="space-y-2 pl-2">
              {['Employed', 'Unemployed', 'Self-Employed'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={(selectedFilters.employmentStatus || []).includes(status)}
                    onChange={() => handleCheckboxChange('employmentStatus', status)}
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Occupation Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
          <select
            className="w-full px-4 py-2.5 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
            value={selectedFilters.occupation || ''}
            onChange={(e) => handleDropdownChange('occupation', e.target.value)}
          >
            <option value="">Select</option>
            <option value="Farmer">Farmer</option>
            <option value="Student">Student</option>
            <option value="Business">Business</option>
            <option value="Professional">Professional</option>
          </select>
        </div>

        {/* Special Tags */}
        <div className="pt-4 border-t border-emerald-200 space-y-2">
          {[
            { key: 'minority', label: 'Minority' },
            { key: 'differentlyAbled', label: 'Differently Abled' },
            { key: 'dbtScheme', label: 'DBT Scheme' },
            { key: 'belowPovertyLine', label: 'Below Poverty Line' },
            { key: 'economicDistress', label: 'Economic Distress' },
            { key: 'governmentEmployee', label: 'Government Employee' },
            { key: 'student', label: 'Student' }
          ].map((tag) => (
            <label key={tag.key} className="flex items-center justify-between cursor-pointer text-sm text-gray-600 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!selectedFilters[tag.key]}
                  onChange={() => handleSpecialTagChange(tag.key)}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                />
                <span>{tag.label}</span>
              </div>
              <span className="text-xs text-gray-400">
                {filters.specialTags?.[tag.key] || 0}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

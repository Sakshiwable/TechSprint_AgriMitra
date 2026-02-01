import React, { useState } from 'react';
import './FilterSidebar.css';

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
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filter By</h3>
        <button className="reset-filters" onClick={onResetFilters}>
          Reset Filters
        </button>
      </div>

      <div className="filter-sections">
        {/* State Dropdown */}
        <div className="filter-section">
          <label className="filter-label">State</label>
          <select
            className="filter-select"
            value={selectedFilters.state || ''}
            onChange={(e) => handleDropdownChange('state', e.target.value)}
          >
            <option value="">Select</option>
            {/* Add state options dynamically from filters */}
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
          </select>
        </div>

        {/* Gender */}
        <div className="filter-section expandable">
          <div className="filter-label-row" onClick={() => toggleSection('gender')}>
            <label className="filter-label">Gender</label>
            <span className="expand-icon">{expandedSections.gender ? '−' : '+'}</span>
          </div>
          {expandedSections.gender && (
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Male')}
                  onChange={() => handleCheckboxChange('gender', 'Male')}
                />
                <span>Male</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Female')}
                  onChange={() => handleCheckboxChange('gender', 'Female')}
                />
                <span>Female</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.gender || []).includes('Transgender')}
                  onChange={() => handleCheckboxChange('gender', 'Transgender')}
                />
                <span>Transgender</span>
              </label>
            </div>
          )}
        </div>

        {/* Age Dropdown */}
        <div className="filter-section">
          <label className="filter-label">Age</label>
          <select
            className="filter-select"
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
        <div className="filter-section expandable">
          <div className="filter-label-row" onClick={() => toggleSection('caste')}>
            <label className="filter-label">Caste</label>
            <span className="expand-icon">{expandedSections.caste ? '−' : '+'}</span>
          </div>
          {expandedSections.caste && (
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.caste || []).includes('General')}
                  onChange={() => handleCheckboxChange('caste', 'General')}
                />
                <span>General</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.caste || []).includes('SC')}
                  onChange={() => handleCheckboxChange('caste', 'SC')}
                />
                <span>SC</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.caste || []).includes('ST')}
                  onChange={() => handleCheckboxChange('caste', 'ST')}
                />
                <span>ST</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.caste || []).includes('OBC')}
                  onChange={() => handleCheckboxChange('caste', 'OBC')}
                />
                <span>OBC</span>
              </label>
            </div>
          )}
        </div>

        {/* Residence */}
        <div className="filter-section expandable">
          <div className="filter-label-row" onClick={() => toggleSection('residence')}>
            <label className="filter-label">Residence</label>
            <span className="expand-icon">{expandedSections.residence ? '−' : '+'}</span>
          </div>
          {expandedSections.residence && (
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.residence || []).includes('Urban')}
                  onChange={() => handleCheckboxChange('residence', 'Urban')}
                />
                <span>Urban</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.residence || []).includes('Rural')}
                  onChange={() => handleCheckboxChange('residence', 'Rural')}
                />
                <span>Rural</span>
              </label>
            </div>
          )}
        </div>

        {/* Benefit Type */}
        <div className="filter-section expandable">
          <div className="filter-label-row" onClick={() => toggleSection('benefitType')}>
            <label className="filter-label">Benefit Type</label>
            <span className="expand-icon">{expandedSections.benefitType ? '−' : '+'}</span>
          </div>
          {expandedSections.benefitType && (
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.benefitType || []).includes('Financial')}
                  onChange={() => handleCheckboxChange('benefitType', 'Financial')}
                />
                <span>Financial</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.benefitType || []).includes('Education')}
                  onChange={() => handleCheckboxChange('benefitType', 'Education')}
                />
                <span>Education</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.benefitType || []).includes('Health')}
                  onChange={() => handleCheckboxChange('benefitType', 'Health')}
                />
                <span>Health</span>
              </label>
            </div>
          )}
        </div>

        {/* Disability Percentage Dropdown */}
        <div className="filter-section">
          <label className="filter-label">Disability Percentage</label>
          <select
            className="filter-select"
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
        <div className="filter-section expandable">
          <div className="filter-label-row" onClick={() => toggleSection('employmentStatus')}>
            <label className="filter-label">Employment Status</label>
            <span className="expand-icon">{expandedSections.employmentStatus ? '−' : '+'}</span>
          </div>
          {expandedSections.employmentStatus && (
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.employmentStatus || []).includes('Employed')}
                  onChange={() => handleCheckboxChange('employmentStatus', 'Employed')}
                />
                <span>Employed</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.employmentStatus || []).includes('Unemployed')}
                  onChange={() => handleCheckboxChange('employmentStatus', 'Unemployed')}
                />
                <span>Unemployed</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={(selectedFilters.employmentStatus || []).includes('Self-Employed')}
                  onChange={() => handleCheckboxChange('employmentStatus', 'Self-Employed')}
                />
                <span>Self-Employed</span>
              </label>
            </div>
          )}
        </div>

        {/* Occupation Dropdown */}
        <div className="filter-section">
          <label className="filter-label">Occupation</label>
          <select
            className="filter-select"
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
        <div className="filter-section special-tags">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.minority}
              onChange={() => handleSpecialTagChange('minority')}
            />
            <span>Minority</span>
            <span className="tag-count">{filters.specialTags?.minority || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.differentlyAbled}
              onChange={() => handleSpecialTagChange('differentlyAbled')}
            />
            <span>Differently Abled</span>
            <span className="tag-count">{filters.specialTags?.differentlyAbled || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.dbtScheme}
              onChange={() => handleSpecialTagChange('dbtScheme')}
            />
            <span>DBT Scheme</span>
            <span className="tag-count">{filters.specialTags?.dbtScheme || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.belowPovertyLine}
              onChange={() => handleSpecialTagChange('belowPovertyLine')}
            />
            <span>Below Poverty Line</span>
            <span className="tag-count">{filters.specialTags?.belowPovertyLine || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.economicDistress}
              onChange={() => handleSpecialTagChange('economicDistress')}
            />
            <span>Economic Distress</span>
            <span className="tag-count">{filters.specialTags?.economicDistress || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.governmentEmployee}
              onChange={() => handleSpecialTagChange('governmentEmployee')}
            />
            <span>Government Employee</span>
            <span className="tag-count">{filters.specialTags?.governmentEmployee || 0}</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={!!selectedFilters.student}
              onChange={() => handleSpecialTagChange('student')}
            />
            <span>Student</span>
            <span className="tag-count">{filters.specialTags?.student || 0}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

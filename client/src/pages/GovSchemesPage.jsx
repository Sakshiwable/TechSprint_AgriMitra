import React, { useState, useEffect } from 'react';
import { fetchMySchemes, fetchFilters } from '../api/govSchemeApi';
import FilterSidebar from '../components/FilterSidebar';
import SchemeCard from '../components/SchemeCard';
import './GovSchemesPage.css';

const GovSchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetchFilters();
        if (response.success) {
          setFilters(response.data);
        }
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    
    loadFilters();
  }, []);

  // Fetch schemes when filters or pagination changes
  useEffect(() => {
    const loadSchemes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const filterParams = { ...selectedFilters };
        
        // Add tab filter
        if (activeTab === 'state') {
          filterParams.type = 'State';
        } else if (activeTab === 'central') {
          filterParams.type = 'Central';
        }
        
        // Add search
        if (searchTerm) {
          filterParams.search = searchTerm;
        }
        
        const response = await fetchMySchemes(filterParams, currentPage, 20, sortBy);
        
        if (response.success) {
          setSchemes(response.data);
          setTotalPages(response.pagination.pages);
          setTotalSchemes(response.pagination.total);
        }
      } catch (err) {
        setError('Failed to load schemes. Please try again later.');
        console.error('Error loading schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchemes();
  }, [selectedFilters, currentPage, activeTab, sortBy, searchTerm]);

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="gov-schemes-page">
      <div className="schemes-container">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Main Content */}
        <div className="schemes-content">
          {/* Header */}
          <div className="schemes-header">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder='For an exact match, put the words in quotes. For example: "Scheme Name"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="sort-dropdown">
              <label>Sort:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="schemes-tabs">
            <button
              className={activeTab === 'all' ? 'tab active' : 'tab'}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
            >
              All Schemes
            </button>
            <button
              className={activeTab === 'state' ? 'tab active' : 'tab'}
              onClick={() => {
                setActiveTab('state');
                setCurrentPage(1);
              }}
            >
              State Schemes
            </button>
            <button
              className={activeTab === 'central' ? 'tab active' : 'tab'}
              onClick={() => {
                setActiveTab('central');
                setCurrentPage(1);
              }}
            >
              Central Schemes
            </button>
          </div>

          {/* Scheme Count */}
          <div className="schemes-count">
            We found <strong>{totalSchemes}</strong> schemes based on your preferences
          </div>

          {/* Schemes List */}
          {loading ? (
            <div className="loading">Loading schemes...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : schemes.length === 0 ? (
            <div className="no-results">
              No schemes found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="schemes-list">
                {schemes.map((scheme) => (
                  <SchemeCard key={scheme._id} scheme={scheme} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovSchemesPage;

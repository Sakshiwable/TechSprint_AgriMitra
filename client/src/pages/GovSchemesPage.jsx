import React, { useState, useEffect, useRef } from 'react';
import { fetchMySchemes, fetchFilters } from '../api/govSchemeApi';
import FilterSidebar from '../components/FilterSidebar';
import SchemeCard from '../components/SchemeCard';
import { Search, Filter, BookOpen } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GovSchemesPage = () => {
  const { t } = useTranslation();
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

  const schemesRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    if (schemes.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.scheme-card-item', {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: schemesRef.current,
          start: 'top 80%'
        }
      });
    });

    return () => ctx.revert();
  }, [schemes]);

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
          setSchemes(response.data || []);
          setTotalPages(response.pages || 1);
          setTotalSchemes(response.total || 0);
        } else {
          setSchemes([]);
          setTotalPages(1);
          setTotalSchemes(0);
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
    setCurrentPage(1);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f4fdf8] via-emerald-50/30 to-white pt-20 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
   

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Filter Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <FilterSidebar
              filters={filters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Search and Sort Bar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-emerald-100">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search') + ' schemes...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {t('search')}
                </button>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">{t('sort')}:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-emerald-100 flex gap-2">
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
                onClick={() => {
                  setActiveTab('all');
                  setCurrentPage(1);
                }}
              >
                {t('allSchemes')}
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'state'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
                onClick={() => {
                  setActiveTab('state');
                  setCurrentPage(1);
                }}
              >
                {t('stateSchemes')}
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'central'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
                onClick={() => {
                  setActiveTab('central');
                  setCurrentPage(1);
                }}
              >
                {t('centralSchemes')}
              </button>
            </div>

            {/* Scheme Count */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-gray-700 text-center">
                We found <strong className="text-emerald-600 text-lg">{totalSchemes}</strong> schemes based on your preferences
              </p>
            </div>

            {/* Schemes List */}
            {loading ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 shadow-lg border border-emerald-100 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading schemes...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : schemes.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 shadow-lg border border-emerald-100 text-center">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  No schemes found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <>
                <div ref={schemesRef} className="space-y-4">
                  {schemes.map((scheme) => (
                    <div key={scheme._id} className="scheme-card-item">
                      <SchemeCard scheme={scheme} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Previous
                    </button>
                    
                    <span className="px-6 py-3 bg-white/80 backdrop-blur-xl rounded-xl border border-emerald-200 text-gray-700 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    </div>
  );
};

export default GovSchemesPage;

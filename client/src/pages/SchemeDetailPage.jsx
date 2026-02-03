import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSchemeById } from '../api/govSchemeApi';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('details');

  useEffect(() => {
    const loadScheme = async () => {
      try {
        setLoading(true);
        const response = await fetchSchemeById(id);
        if (response.success) {
          setScheme(response.data);
        }
      } catch (err) {
        setError('Failed to load scheme details');
        console.error('Error loading scheme:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScheme();
  }, [id]);

  const sections = [
    { id: 'details', label: 'Details' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'exclusions', label: 'Exclusions' },
    { id: 'applicationProcess', label: 'Application Process' },
    { id: 'documentsRequired', label: 'Documents Required' },
    { id: 'faq', label: 'Frequently Asked Questions' },
    { id: 'sources', label: 'Sources And References' },
    { id: 'feedback', label: 'Feedback' }
  ];

  const renderSectionContent = (sectionId) => {
    if (!scheme || !scheme.details) return <p className="text-gray-600">No information available</p>;

    switch (sectionId) {
      case 'details':
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{scheme.name}</h2>
            <div className="space-y-2">
              <p><strong className="text-gray-800">State:</strong> <span className="text-gray-600">{scheme.state || 'N/A'}</span></p>
              <p><strong className="text-gray-800">Type:</strong> <span className="text-gray-600">{scheme.type}</span></p>
              <p><strong className="text-gray-800">Description:</strong> <span className="text-gray-600">{scheme.shortDescription}</span></p>
              {scheme.category && scheme.category.length > 0 && (
                <p><strong className="text-gray-800">Category:</strong> <span className="text-gray-600">{scheme.category.join(', ')}</span></p>
              )}
            </div>
            {scheme.tags && scheme.tags.length > 0 && (
              <div className="mt-4">
                <strong className="text-gray-800 block mb-2">Tags:</strong>
                <div className="flex flex-wrap gap-2">
                  {scheme.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'benefits':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.benefits || '<p>No benefits information available</p>' }} />
        );
      case 'eligibility':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.eligibility || '<p>No eligibility information available</p>' }} />
        );
      case 'exclusions':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.exclusions || '<p>No exclusions information available</p>' }} />
        );
      case 'applicationProcess':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.applicationProcess || '<p>No application process information available</p>' }} />
        );
      case 'documentsRequired':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.documentsRequired || '<p>No documents information available</p>' }} />
        );
      case 'faq':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.faq || '<p>No FAQ available</p>' }} />
        );
      case 'sources':
        return (
          <div className="space-y-4">
            {scheme.details.sources ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scheme.details.sources }} />
            ) : (
              <p className="text-gray-600">No sources available</p>
            )}
            {scheme.schemeUrl && (
              <p>
                <strong className="text-gray-800">Official URL:</strong>{' '}
                <a href={scheme.schemeUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                  {scheme.schemeUrl}
                </a>
              </p>
            )}
          </div>
        );
      case 'feedback':
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Feedback functionality coming soon...</p>
          </div>
        );
      default:
        return <p className="text-gray-600">Content not available</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4fdf8] via-emerald-50/30 to-white pt-20 pb-8 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4fdf8] via-emerald-50/30 to-white pt-20 pb-8 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-red-200 max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error || 'Scheme not found'}</p>
          <button
            onClick={() => navigate('/gov-schemes')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Back to Schemes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fdf8] via-emerald-50/30 to-white pt-20 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/gov-schemes')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl border border-emerald-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr]">
            {/* Sidebar Navigation */}
            <aside className="bg-gradient-to-b from-emerald-50 to-green-50 p-4 md:p-0">
              <div className="md:sticky md:top-24 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-white text-emerald-600 font-semibold shadow-md border-l-4 border-emerald-500'
                        : 'text-gray-600 hover:bg-white/50 hover:text-emerald-600'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <main className="p-6 md:p-8 text-gray-700 leading-relaxed">
              {renderSectionContent(activeSection)}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailPage;

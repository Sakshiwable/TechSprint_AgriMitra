import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSchemeById } from '../api/govSchemeApi';
import './SchemeDetailPage.css';

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
    if (!scheme || !scheme.details) return <p>No information available</p>;

    switch (sectionId) {
      case 'details':
        return (
          <div>
            <h2>{scheme.name}</h2>
            <p><strong>State:</strong> {scheme.state || 'N/A'}</p>
            <p><strong>Type:</strong> {scheme.type}</p>
            <p><strong>Description:</strong> {scheme.shortDescription}</p>
            {scheme.category && scheme.category.length > 0 && (
              <p><strong>Category:</strong> {scheme.category.join(', ')}</p>
            )}
            {scheme.tags && scheme.tags.length > 0 && (
              <div className="detail-tags">
                <strong>Tags:</strong>
                {scheme.tags.map((tag, index) => (
                  <span key={index} className="detail-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      case 'benefits':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.benefits || '<p>No benefits information available</p>' }} />
        );
      case 'eligibility':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.eligibility || '<p>No eligibility information available</p>' }} />
        );
      case 'exclusions':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.exclusions || '<p>No exclusions information available</p>' }} />
        );
      case 'applicationProcess':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.applicationProcess || '<p>No application process information available</p>' }} />
        );
      case 'documentsRequired':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.documentsRequired || '<p>No documents information available</p>' }} />
        );
      case 'faq':
        return (
          <div dangerouslySetInnerHTML={{ __html: scheme.details.faq || '<p>No FAQ available</p>' }} />
        );
      case 'sources':
        return (
          <div>
            {scheme.details.sources ? (
              <div dangerouslySetInnerHTML={{ __html: scheme.details.sources }} />
            ) : (
              <p>No sources available</p>
            )}
            {scheme.schemeUrl && (
              <p>
                <strong>Official URL:</strong>{' '}
                <a href={scheme.schemeUrl} target="_blank" rel="noopener noreferrer">
                  {scheme.schemeUrl}
                </a>
              </p>
            )}
          </div>
        );
      case 'feedback':
        return (
          <div>
            <p>Feedback functionality coming soon...</p>
          </div>
        );
      default:
        return <p>Content not available</p>;
    }
  };

  if (loading) {
    return <div className="loading-container">Loading scheme details...</div>;
  }

  if (error || !scheme) {
    return (
      <div className="error-container">
        <p>{error || 'Scheme not found'}</p>
        <button onClick={() => navigate('/gov-schemes')}>Back to Schemes</button>
      </div>
    );
  }

  return (
    <div className="scheme-detail-page">
      <button className="back-button" onClick={() => navigate('/gov-schemes')}>
        ← Back
      </button>

      <div className="detail-container">
        {/* Sidebar Navigation */}
        <aside className="detail-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="detail-content">
          {renderSectionContent(activeSection)}
        </main>
      </div>
    </div>
  );
};

export default SchemeDetailPage;

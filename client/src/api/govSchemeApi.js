import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Fetch schemes with filters and pagination
 */
export const fetchMySchemes = async (filters = {}, page = 1, limit = 20, sort = 'relevance') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      ...filters
    });
    
    const response = await axios.get(`${API_URL}/api/gov-schemes/myschemes?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    throw error;
  }
};

/**
 * Fetch single scheme by ID
 */
export const fetchSchemeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/gov-schemes/myschemes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching scheme details:', error);
    throw error;
  }
};

/**
 * Fetch filter metadata
 */
export const fetchFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/gov-schemes/filters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filters:', error);
    throw error;
  }
};

/**
 * Trigger scraping (admin only)
 */
export const triggerScrape = async (type = 'all', token) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/gov-schemes/scrape`,
      { type },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error triggering scrape:', error);
    throw error;
  }
};

/**
 * Get scraping statistics (admin only)
 */
export const fetchScrapingStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/gov-schemes/scrape/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching scraping stats:', error);
    throw error;
  }
};

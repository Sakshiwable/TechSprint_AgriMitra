import Scheme from '../models/Scheme.js';
import FilterMetadata from '../models/FilterMetadata.js';
import translationOrchestrator from '../services/translationOrchestrator.js';

// @desc    Get all government schemes with filtering
// @route   GET /api/gov-schemes/myschemes
// @access  Public
export const getMySchemes = async (req, res) => {
    try {
        const { 
            state, 
            category, 
            type, 
            search, 
            limit = 50, 
            page = 1 
        } = req.query;
        const targetLang = req.userLanguage || 'en';
        
        const query = {};
        
        if (state && state !== 'all') {
            query.$or = [
                { state: new RegExp(state, 'i') },
                { state: 'All India' }
            ];
        }
        
        if (category) {
            query.category = { $in: [category] };
        }
        
        if (type) {
            query.type = type;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const schemes = await Scheme.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Scheme.countDocuments(query);
        
        // Translate schemes if not English
        let translatedSchemes = schemes;
        if (targetLang !== 'en') {
            translatedSchemes = await Promise.all(
                schemes.map(async (scheme) => {
                    const schemeObj = scheme.toObject();
                    
                    // Translate scheme name
                    if (scheme.schemeName) {
                        const translatedName = await translationOrchestrator.translateContent(
                            scheme.schemeName,
                            targetLang,
                            'scheme',
                            `${scheme._id}_name`
                        );
                        schemeObj.schemeName = translatedName.text;
                    }
                    
                    // Translate description if exists
                    if (scheme.description) {
                        const translatedDesc = await translationOrchestrator.translateContent(
                            scheme.description,
                            targetLang,
                            'scheme',
                            `${scheme._id}_desc`
                        );
                        schemeObj.description = translatedDesc.text;
                    }
                    
                    // Translate benefits if exists
                    if (scheme.benefits) {
                        const translatedBenefits = await translationOrchestrator.translateContent(
                            scheme.benefits,
                            targetLang,
                            'scheme',
                            `${scheme._id}_benefits`
                        );
                        schemeObj.benefits = translatedBenefits.text;
                    }
                    
                    // Translate eligibility if exists
                    if (scheme.eligibility) {
                        const translatedEligibility = await translationOrchestrator.translateContent(
                            scheme.eligibility,
                            targetLang,
                            'scheme',
                            `${scheme._id}_eligibility`
                        );
                        schemeObj.eligibility = translatedEligibility.text;
                    }
                    
                    // Translate how to apply if exists
                    if (scheme.howToApply) {
                        const translatedHowToApply = await translationOrchestrator.translateContent(
                            scheme.howToApply,
                            targetLang,
                            'scheme',
                            `${scheme._id}_howToApply`
                        );
                        schemeObj.howToApply = translatedHowToApply.text;
                    }
                    
                    return schemeObj;
                })
            );
        }
        
        res.json({
            success: true,
            count: translatedSchemes.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: translatedSchemes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get scheme by ID
// @route   GET /api/gov-schemes/myschemes/:id
// @access  Public
export const getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        
        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }
        
        res.json({
            success: true,
            data: scheme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get filter metadata for schemes
// @route   GET /api/gov-schemes/filters
// @access  Public
export const getFiltersMetadata = async (req, res) => {
    try {
        const filters = await FilterMetadata.find();
        
        // If no filters in DB, generate from schemes
        if (filters.length === 0) {
            const states = await Scheme.distinct('state');
            const categories = await Scheme.distinct('category');
            const types = await Scheme.distinct('type');
            
            return res.json({
                success: true,
                data: {
                    states: states.filter(Boolean),
                    categories: categories.flat().filter(Boolean),
                    types: types.filter(Boolean)
                }
            });
        }
        
        res.json({
            success: true,
            data: filters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Trigger scheme scraping (admin only)
// @route   POST /api/gov-schemes/scrape
// @access  Private/Admin
export const triggerScrape = async (req, res) => {
    try {
        // This would typically trigger the Python scraper
        // For now, return a message indicating the feature
        res.json({
            success: true,
            message: 'Scraping job triggered. Results will be updated in the database.',
            note: 'Connect this to your Python scraper service'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get scraping statistics (admin only)
// @route   GET /api/gov-schemes/scrape/stats
// @access  Private/Admin
export const getScrapingStats = async (req, res) => {
    try {
        const total = await Scheme.countDocuments();
        const successful = await Scheme.countDocuments({ scrapingStatus: 'success' });
        const failed = await Scheme.countDocuments({ scrapingStatus: 'failed' });
        const pending = await Scheme.countDocuments({ scrapingStatus: 'pending' });
        
        res.json({
            success: true,
            data: {
                total,
                successful,
                failed,
                pending,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

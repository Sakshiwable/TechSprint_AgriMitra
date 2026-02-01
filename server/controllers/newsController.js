import NewsAlert from '../models/NewsAlert.js';

// @desc    Get news alerts for a commodity
// @route   GET /api/news/:commodity
// @access  Public
export const getNewsAlerts = async (req, res) => {
    try {
        const { commodity } = req.params;
        const { days = 7, limit = 20 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const newsAlerts = await NewsAlert.find({
            commodity: new RegExp(commodity, 'i'),
            published_at: { $gte: startDate }
        })
        .sort({ published_at: -1 })
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: newsAlerts.length,
            data: newsAlerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get demand signals summary for a commodity
// @route   GET /api/news/signals/:commodity
// @access  Public
export const getDemandSignals = async (req, res) => {
    try {
        const { commodity } = req.params;
        const { days = 7 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        // Get recent news for the commodity
        const newsAlerts = await NewsAlert.find({
            commodity: new RegExp(commodity, 'i'),
            published_at: { $gte: startDate }
        });
        
        if (newsAlerts.length === 0) {
            return res.json({
                success: true,
                data: {
                    commodity,
                    overall_sentiment: 'neutral',
                    news_count: 0,
                    top_signals: [],
                    sentiment_breakdown: { bullish: 0, bearish: 0, neutral: 0 }
                }
            });
        }
        
        // Aggregate signals
        const allSignals = [];
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        
        newsAlerts.forEach(news => {
            allSignals.push(...(news.demand_signals || []));
            sentimentCounts[news.sentiment || 'neutral']++;
        });
        
        // Determine overall sentiment
        let overallSentiment = 'neutral';
        if (sentimentCounts.bearish > sentimentCounts.bullish) {
            overallSentiment = 'bearish';
        } else if (sentimentCounts.bullish > sentimentCounts.bearish) {
            overallSentiment = 'bullish';
        }
        
        // Get top signals (most frequent)
        const signalCounts = {};
        allSignals.forEach(signal => {
            signalCounts[signal] = (signalCounts[signal] || 0) + 1;
        });
        
        const topSignals = Object.entries(signalCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([signal]) => signal);
        
        res.json({
            success: true,
            data: {
                commodity,
                overall_sentiment: overallSentiment,
                news_count: newsAlerts.length,
                top_signals: topSignals,
                sentiment_breakdown: sentimentCounts,
                recent_headlines: newsAlerts.slice(0, 3).map(n => ({
                    headline: n.headline,
                    sentiment: n.sentiment,
                    published_at: n.published_at
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all active demand signals across commodities
// @route   GET /api/news/signals
// @access  Public
export const getAllDemandSignals = async (req, res) => {
    try {
        // Get all news with demand signals (removed date filter to ensure display)
        const newsWithSignals = await NewsAlert.find({
            demand_signals: { $exists: true, $ne: [] }
        })
        .select('commodity demand_signals sentiment fetched_at headline url')
        .sort({ fetched_at: -1 })
        .limit(100);
        
        res.json({
            success: true,
            count: newsWithSignals.length,
            data: newsWithSignals
        });
    } catch (error) {
        console.error('[NEWS API] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

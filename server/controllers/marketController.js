import MarketPrice from '../models/MarketPrice.js';
import translationOrchestrator from '../services/translationOrchestrator.js';

// @desc    Get latest market prices
// @route   GET /api/market/prices
// @access  Public
export const getMarketPrices = async (req, res) => {
    try {
        const { commodity, state, limit = 50 } = req.query;
        const targetLang = req.userLanguage || 'en';
        
        const query = {};
        if (commodity) query.commodity = new RegExp(commodity, 'i');
        if (state) query.state = new RegExp(state, 'i');
        
        const prices = await MarketPrice.find(query)
            .sort({ date: -1, scraped_at: -1 })
            .limit(parseInt(limit));

        // Translate if not English
        let data = prices;
        if (targetLang !== 'en') {
            data = await Promise.all(
                prices.map(async (price) => {
                    const priceObj = price.toObject();
                    
                    // Translate commodity name
                    if (price.commodity) {
                        const translatedCommodity = await translationOrchestrator.translateContent(
                            price.commodity,
                            targetLang,
                            'market_commodity',
                            `commodity_${price.commodity}`
                        );
                        priceObj.commodity = translatedCommodity.text;
                    }
                    
                    // Translate state name
                    if (price.state) {
                        const translatedState = await translationOrchestrator.translateContent(
                            price.state,
                            targetLang,
                            'market_state',
                            `state_${price.state}`
                        );
                        priceObj.state = translatedState.text;
                    }
                    
                    // Translate market name
                    if (price.market) {
                        const translatedMarket = await translationOrchestrator.translateContent(
                            price.market,
                            targetLang,
                            'market_name',
                            `market_${price.market}`
                        );
                        priceObj.market = translatedMarket.text;
                    }
                    
                    return priceObj;
                })
            );
        }
        
        res.json({
            success: true,
            count: prices.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get price history for a commodity
// @route   GET /api/market/prices/history/:commodity
// @access  Public
export const getPriceHistory = async (req, res) => {
    try {
        const { commodity } = req.params;
        const { state, days = 30 } = req.query;
        
        const query = { commodity: new RegExp(commodity, 'i') };
        if (state) query.state = new RegExp(state, 'i');
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        query.date = { $gte: startDate };
        
        const history = await MarketPrice.find(query)
            .sort({ date: 1 })
            .select('commodity state market modal_price min_price max_price date');
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get price statistics
// @route   GET /api/market/prices/stats/:commodity
// @access  Public
export const getPriceStats = async (req, res) => {
    try {
        const { commodity } = req.params;
        const { state } = req.query;
        
        const query = { commodity: new RegExp(commodity, 'i') };
        if (state) query.state = new RegExp(state, 'i');
        
        const prices = await MarketPrice.find(query)
            .sort({ date: -1 })
            .limit(30)
            .select('modal_price date');
        
        if (prices.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No price data found'
            });
        }
        
        const priceValues = prices.map(p => p.modal_price);
        const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
        const max = Math.max(...priceValues);
        const min = Math.min(...priceValues);
        
        // Calculate trend
        const recent = priceValues.slice(0, 7);
        const older = priceValues.slice(7, 14);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        let trend = 'STABLE';
        if (changePercent > 5) trend = 'RISING';
        else if (changePercent < -5) trend = 'FALLING';
        
        res.json({
            success: true,
            data: {
                commodity: prices[0].commodity,
                current_price: prices[0].modal_price,
                average_30_days: Math.round(average),
                max_price: max,
                min_price: min,
                trend,
                change_percent: Math.round(changePercent * 10) / 10,
                last_updated: prices[0].date
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Broadcast price update (called by Python)
// @route   POST /api/market/broadcast
// @access  Public (should add API key auth in production)
export const broadcastPriceUpdate = async (req, res) => {
    try {
        const priceData = req.body;
        
        // Get Socket.io instance from app
        const io = req.app.get('io');
        
        // Broadcast to all clients subscribed to this commodity
        io.to(`commodity_${priceData.commodity}`).emit('price_update', priceData);
        io.emit('price_update_all', priceData);
        
        res.json({ 
            success: true, 
            message: 'Price update broadcasted' 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

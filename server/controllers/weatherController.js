import WeatherData from '../models/WeatherData.js';

// @desc    Get current weather for a state
// @route   GET /api/weather/state/:state
// @access  Public
export const getWeatherByState = async (req, res) => {
    try {
        const { state } = req.params;
        
        // Get most recent weather data for the state
        const weatherData = await WeatherData.findOne({ state })
            .sort({ timestamp: -1 });
        
        if (!weatherData) {
            return res.status(404).json({
                success: false,
                error: 'No weather data found for this state'
            });
        }
        
        res.json({
            success: true,
            data: weatherData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get weather history for a state
// @route   GET /api/weather/history/:state
// @access  Public
export const getWeatherHistory = async (req, res) => {
    try {
        const { state } = req.params;
        const { days = 7 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const history = await WeatherData.find({
            state,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 });
        
        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get weather impact summary for all states
// @route   GET /api/weather/impact
// @access  Public
export const getWeatherImpact = async (req, res) => {
    try {
        // Get latest weather for all states (simple group by state)
        const allWeather = await WeatherData.aggregate([
            {
                $group: {
                    _id: '$state',
                    latestWeather: { $first: '$$ROOT' }
                }
            }
        ]);
        
        // Format response with complete data
        const impactSummary = allWeather.map(item => ({
            state: item._id,
            city: item.latestWeather.city,
            temperature: item.latestWeather.temperature,
            humidity: item.latestWeather.humidity,
            weather_condition: item.latestWeather.weather_description,
            rainfall_1h: item.latestWeather.rainfall_1h || 0,
            impact_analysis: item.latestWeather.impact_analysis
        }));
        
        res.json({
            success: true,
            data: impactSummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


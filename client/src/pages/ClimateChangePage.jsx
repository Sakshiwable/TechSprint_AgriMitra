import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, 
    TrendingUp, AlertTriangle, Leaf, Newspaper, Calendar,
    MapPin, Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';

const ClimateChangePage = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [climateNews, setClimateNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('All');

    const states = ['All', 'Maharashtra', 'Gujarat', 'Karnataka', 'Punjab', 'Uttar Pradesh'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch weather impact data
            const weatherRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/weather/impact`);
            setWeatherData(weatherRes.data?.data || []);

            // Fetch climate-related news
            const newsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/news/signals`);
            setClimateNews(newsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching climate data:', error);
        }
        setLoading(false);
    };

    const getWeatherIcon = (condition) => {
        const cond = condition?.toLowerCase() || '';
        if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (cond.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-400" />;
        if (cond.includes('clear') || cond.includes('sun')) return <Sun className="w-8 h-8 text-yellow-500" />;
        return <Cloud className="w-8 h-8 text-gray-400" />;
    };

    const getImpactColor = (impact) => {
        if (impact === 'negative') return 'text-red-600 bg-red-50';
        if (impact === 'positive') return 'text-green-600 bg-green-50';
        return 'text-gray-600 bg-gray-50';
    };

    const filteredWeather = selectedState === 'All' 
        ? weatherData 
        : weatherData.filter(w => w.state === selectedState);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-4">
                            <Leaf className="w-4 h-4" />
                            Climate Intelligence for Agriculture
                        </div>
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            जलवायु परिवर्तन विश्लेषण
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Real-time climate data, seasonal patterns, and agricultural impact analysis
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* State Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {states.map((state) => (
                            <button
                                key={state}
                                onClick={() => setSelectedState(state)}
                                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                                    selectedState === state
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border'
                                }`}
                            >
                                {state}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Current Weather Conditions */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Cloud className="w-6 h-6 text-blue-600" />
                                Current Weather Conditions
                            </h2>
                            
                            {filteredWeather.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredWeather.map((weather, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <h3 className="text-lg font-bold text-gray-800">{weather.state}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{weather.city}</p>
                                                </div>
                                                {getWeatherIcon(weather.weather_condition)}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <ThermometerSun className="w-5 h-5" />
                                                        <span className="text-sm">Temperature</span>
                                                    </div>
                                                    <span className="text-2xl font-bold text-gray-800">
                                                        {weather.temperature}°C
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Droplets className="w-5 h-5" />
                                                        <span className="text-sm">Humidity</span>
                                                    </div>
                                                    <span className="text-lg font-semibold text-gray-700">
                                                        {weather.humidity}%
                                                    </span>
                                                </div>

                                                {weather.rainfall_1h > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <CloudRain className="w-5 h-5" />
                                                            <span className="text-sm">Rainfall</span>
                                                        </div>
                                                        <span className="text-lg font-semibold text-blue-700">
                                                            {weather.rainfall_1h}mm
                                                        </span>
                                                    </div>
                                                )}

                                                {weather.impact_analysis && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                        <div className={`px-3 py-2 rounded-lg ${getImpactColor(weather.impact_analysis.overall_impact)}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Activity className="w-4 h-4" />
                                                                <span className="text-xs font-bold uppercase">
                                                                    {weather.impact_analysis.overall_impact} Impact
                                                                </span>
                                                            </div>
                                                            {weather.impact_analysis.factors && weather.impact_analysis.factors.length > 0 && (
                                                                <p className="text-xs">
                                                                    {weather.impact_analysis.factors.join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400 mt-4">
                                                Updated: {new Date(weather.fetched_at).toLocaleString('en-IN')}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                                    <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No weather data available for selected state</p>
                                </div>
                            )}
                        </section>

                        {/* Climate News & Alerts */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Newspaper className="w-6 h-6 text-blue-600" />
                                Climate-Related Agricultural News
                            </h2>

                            {climateNews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {climateNews.map((news, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                                                    <Leaf className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                                                        {news.headline}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                                        <span className="px-2 py-1 bg-gray-100 rounded">{news.commodity}</span>
                                                        {news.sentiment && (
                                                            <span className={`px-2 py-1 rounded ${
                                                                news.sentiment === 'bullish' ? 'bg-green-100 text-green-700' :
                                                                news.sentiment === 'bearish' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {news.sentiment}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {news.demand_signals && news.demand_signals.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {news.demand_signals.slice(0, 3).map((signal, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded"
                                                                >
                                                                    {signal}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {news.url && (
                                                        <a
                                                            href={news.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            Read more →
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                                    <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No climate news available at the moment</p>
                                </div>
                            )}
                        </section>

                        {/* Climate Impact Summary */}
                        <section className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Climate Change & Agriculture
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <TrendingUp className="w-8 h-8 mb-2" />
                                    <h3 className="font-semibold mb-1">Temperature Trends</h3>
                                    <p className="text-sm text-white/80">
                                        Monitor rising temperatures affecting crop cycles and yield
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <CloudRain className="w-8 h-8 mb-2" />
                                    <h3 className="font-semibold mb-1">Rainfall Patterns</h3>
                                    <p className="text-sm text-white/80">
                                        Track irregular rainfall and seasonal variations
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                    <Calendar className="w-8 h-8 mb-2" />
                                    <h3 className="font-semibold mb-1">Seasonal Forecasts</h3>
                                    <p className="text-sm text-white/80">
                                        Plan your farming activities based on climate predictions
                                    </p>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClimateChangePage;

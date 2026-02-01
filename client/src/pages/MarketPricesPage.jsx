import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Download, Filter, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';

const MarketPricesTablePage = () => {
    const { language } = useLanguage();
    const [allPrices, setAllPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedAPMC, setSelectedAPMC] = useState('');
    const [selectedCommodity, setSelectedCommodity] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Get unique values for filters
    const states = ['All', ...new Set(allPrices.map(p => p.state))].filter(Boolean).sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        if (a === 'Maharashtra') return -1;
        if (b === 'Maharashtra') return 1;
        return a.localeCompare(b);
    });
    
    const commodities = ['All', ...new Set(allPrices.map(p => p.commodity))].filter(Boolean).sort();
    
    const apmcs = selectedState && selectedState !== 'All' 
        ? ['All', ...new Set(allPrices.filter(p => p.state === selectedState).map(p => p.market))].filter(Boolean).sort()
        : ['All'];

    useEffect(() => {
        fetchPrices();
    }, [language]);

    useEffect(() => {
        applyFilters();
    }, [allPrices, selectedState, selectedAPMC, selectedCommodity, fromDate, toDate, searchTerm]);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/market/prices`, {
                params: { lang: language }
            });
            const prices = response.data?.data || [];
            
            // Sort to prioritize Maharashtra
            const sorted = prices.sort((a, b) => {
                if (a.state === 'Maharashtra' && b.state !== 'Maharashtra') return -1;
                if (a.state !== 'Maharashtra' && b.state === 'Maharashtra') return 1;
                return a.commodity.localeCompare(b.commodity);
            });
            
            setAllPrices(sorted);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching prices:', error);
            setAllPrices([]);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...allPrices];

        // State filter
        if (selectedState && selectedState !== 'All') {
            filtered = filtered.filter(p => p.state === selectedState);
        }

        // APMC filter
        if (selectedAPMC && selectedAPMC !== 'All') {
            filtered = filtered.filter(p => p.market === selectedAPMC);
        }

        // Commodity filter
        if (selectedCommodity && selectedCommodity !== 'All') {
            filtered = filtered.filter(p => p.commodity === selectedCommodity);
        }

        // Date filters
        if (fromDate) {
            const from = new Date(fromDate);
            filtered = filtered.filter(p => new Date(p.scraped_at) >= from);
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(p => new Date(p.scraped_at) <= to);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.commodity?.toLowerCase().includes(term) ||
                p.state?.toLowerCase().includes(term) ||
                p.market?.toLowerCase().includes(term)
            );
        }

        setFilteredPrices(filtered);
    };

    const resetFilters = () => {
        setSelectedState('');
        setSelectedAPMC('');
        setSelectedCommodity('');
        setFromDate('');
        setToDate('');
        setSearchTerm('');
    };

    const exportToCSV = () => {
        const headers = ['State', 'APMC', 'Commodity', 'Min Price', 'Modal Price', 'Max Price', 'Arrivals', 'Traded', 'Unit', 'Date'];
        const rows = filteredPrices.map(p => [
            p.state,
            p.market,
            p.commodity,
            p.min_price,
            p.modal_price,
            p.max_price,
            p.arrival_quantity || 0,
            p.traded_quantity || 0,
            p.unit || 'Quintal',
            new Date(p.scraped_at).toLocaleDateString('en-IN')
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mandi-prices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatTimeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">e-NAM Mandis Trade Details</h1>
                    <p className="text-green-50">Real-time market prices across India - Maharashtra Priority</p>
                </div>

                {/* Filter Panel */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 mb-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                        {/* State */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                            <select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedAPMC('');
                                }}
                                className="w-full p-2 border-2 border-green-400 rounded bg-white text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* APMC */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">APMC</label>
                            <select
                                value={selectedAPMC}
                                onChange={(e) => setSelectedAPMC(e.target.value)}
                                disabled={!selectedState || selectedState === 'All'}
                                className="w-full p-2 border-2 border-green-400 rounded bg-white text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
                            >
                                {apmcs.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        {/* Commodity */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Commodity</label>
                            <select
                                value={selectedCommodity}
                                onChange={(e) => setSelectedCommodity(e.target.value)}
                                className="w-full p-2 border-2 border-green-400 rounded bg-white text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">From date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full p-2 border-2 border-green-400 rounded bg-white text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">To date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full p-2 border-2 border-green-400 rounded bg-white text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        {/* Refresh Button */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 opacity-0">Action</label>
                            <button
                                onClick={fetchPrices}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search commodity, state, or market..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-green-400 rounded text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        
                        {(selectedState || selectedCommodity || selectedAPMC || fromDate || toDate || searchTerm) && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Last Updated:</span> {formatTimeSince(lastUpdated)} | 
                        <span className="ml-2 font-medium">Showing:</span> {filteredPrices.length} of {allPrices.length} records
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading market data...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-200 border-b-2 border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">State</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">APMC</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Commodity</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700" colSpan="3">
                                            Price in Rs.
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Commodity Arrivals</th>
                                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Commodity Traded</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Unit</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Date</th>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Min Price</th>
                                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Modal Price</th>
                                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Max Price</th>
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2"></th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPrices.length > 0 ? (
                                        filteredPrices.map((price, index) => {
                                            const isMaharashtra = price.state === 'Maharashtra';
                                            return (
                                                <tr 
                                                    key={index}
                                                    className={`hover:bg-gray-50 ${isMaharashtra ? 'bg-green-50' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-sm">
                                                        {price.state}
                                                        {isMaharashtra && (
                                                            <span className="ml-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">⭐</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-blue-700">{price.market}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{price.commodity}</td>
                                                    <td className="px-4 py-3 text-center text-sm">{price.min_price?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{price.modal_price?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-center text-sm">{price.max_price?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{price.arrival_quantity?.toLocaleString() || 0}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{price.traded_quantity?.toLocaleString() || 0}</td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-600">{price.unit || 'Qtl'}</td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                        {new Date(price.scraped_at).toLocaleDateString('en-IN')}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                                                <p className="text-lg mb-2">No data available</p>
                                                <p className="text-sm">Try adjusting your filters or refresh the data</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPricesTablePage;

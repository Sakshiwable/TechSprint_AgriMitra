import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MarketplacePage = () => {
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState({ commodity: '', state: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchListings();
    }, [filter]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.commodity) params.append('commodity', filter.commodity);
            if (filter.state) params.append('state', filter.state);
            
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/crops?${params.toString()}`
            );
            setListings(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);
        }
        setLoading(false);
    };

    const showInterest = async (listingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/crops/${listingId}/interest`,
                { offeredPrice: 0, message: 'Interested in buying' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert(`✅ Interest registered! Farmer Contact: ${response.data.data.farmerContact}`);
        } catch (error) {
            console.error('Error showing interest:', error);
            alert('❌ Error: ' + (error.response?.data?.error || 'Please login'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">बाजार (Marketplace)</h1>
                        <p className="text-lg text-gray-600">Buy Fresh Crops Directly from Farmers</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-listing')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        + Sell Crop
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <input
                            type="text"
                            placeholder="Search commodity..."
                            value={filter.commodity}
                            onChange={(e) => setFilter({...filter, commodity: e.target.value})}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Filter by state..."
                            value={filter.state}
                            onChange={(e) => setFilter({...filter, state: e.target.value})}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading listings...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
                                    <h3 className="text-2xl font-bold">{listing.commodity}</h3>
                                    <p className="text-sm opacity-90">{listing.location?.state}, {listing.location?.district}</p>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-3xl font-bold text-green-600">₹{listing.expectedPrice}</p>
                                            <p className="text-sm text-gray-500">per quintal</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{listing.quantity}</p>
                                            <p className="text-sm text-gray-500">quintals</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-semibold mr-2">Quality:</span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Grade {listing.quality}</span>
                                        </div>
                                        
                                        {listing.harvestDate && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-semibold mr-2">Harvest:</span>
                                                <span>{new Date(listing.harvestDate).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        )}

                                        {listing.location?.village && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-semibold mr-2">Village:</span>
                                                <span>{listing.location.village}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-semibold mr-2">Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                                listing.status === 'in_negotiation' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {listing.status}
                                            </span>
                                        </div>
                                    </div>

                                    {listing.description && (
                                        <p className="text-sm text-gray600 mb-4 line-clamp-2">{listing.description}</p>
                                    )}

                                    <button
                                        onClick={() => showInterest(listing._id)}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        📞 रुचि दिखाएं (Show Interest)
                                    </button>

                                    <p className="text-xs text-gray-400 mt-3 text-center">
                                        Posted {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No listings found</p>
                        <button
                            onClick={() => navigate('/create-listing')}
                            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                        >
                            Create First Listing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplacePage;

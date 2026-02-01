import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CreateListingPage = () => {
    const [formData, setFormData] = useState({
        commodity: 'Tomato',
        quantity: '',
        expectedPrice: '',
        state: '',
        district: '',
        village: '',
        harvestDate: '',
        quality: 'A',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const commodities = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Cotton', 'Chilli', 'Banana'];
    const commodityEmojis = {
        'Tomato': '🍅',
        'Onion': '🧅',
        'Potato': '🥔',
        'Wheat': '🌾',
        'Rice': '🌾',
        'Cotton': '🌱',
        'Chilli': '🌶️',
        'Banana': '🍌'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/crops`,
                { ...formData, location: { state: formData.state, district: formData.district, village: formData.village } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert('✅ सूची बनाई गई! (Listing Created!)');
            navigate('/marketplace');
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('❌ Error creating listing');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-4xl font-bold mb-2 text-gray-800">अपनी फसल बेचें</h1>
                <p className="text-lg text-gray-600 mb-8">Sell Your Crop Directly to Buyers</p>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                    {/* Commodity Selection */}
                    <div className="mb-6">
                        <label className="block text-2xl font-bold mb-4">फसल चुनें (Select Crop)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {commodities.map(comm => (
                                <button
                                    key={comm}
                                    type="button"
                                    onClick={() => setFormData({...formData, commodity: comm})}
                                    className={`p-6 border-4 rounded-lg text-center transition ${
                                        formData.commodity === comm
                                            ? 'border-green-600 bg-green-50 scale-105'
                                            : 'border-gray-300 hover:border-green-400'
                                    }`}
                                >
                                    <div className="text-4xl mb-2">{commodityEmojis[comm]}</div>
                                    <div className="text-lg font-semibold">{comm}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-6">
                        <label className="block text-2xl font-bold mb-2">मात्रा (Quantity in Quintals)</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            className="w-full p-4 text-2xl border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                            placeholder="50"
                            required
                        />
                    </div>

                    {/* Expected Price */}
                    <div className="mb-6">
                        <label className="block text-2xl font-bold mb-2">अपेक्षित मूल्य (Expected Price per Quintal)</label>
                        <input
                            type="number"
                            value={formData.expectedPrice}
                            onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                            className="w-full p-4 text-2xl border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                            placeholder="1200"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-2">💡 Tip: Check market prices before setting your rate</p>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-lg font-semibold mb-2">State</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({...formData, state: e.target.value})}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                placeholder="Maharashtra"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-semibold mb-2">District</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => setFormData({...formData, district: e.target.value})}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                placeholder="Pune"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-semibold mb-2">Village</label>
                            <input
                                type="text"
                                value={formData.village}
                                onChange={(e) => setFormData({...formData, village: e.target.value})}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                placeholder="Shirur"
                            />
                        </div>
                    </div>

                    {/* Harvest Date */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-2">Harvest Date</label>
                        <input
                            type="date"
                            value={formData.harvestDate}
                            onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                        />
                    </div>

                    {/* Quality */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-2">Quality</label>
                        <select
                            value={formData.quality}
                            onChange={(e) => setFormData({...formData, quality: e.target.value})}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                        >
                            <option value="A">Grade A - Premium</option>
                            <option value="B">Grade B - Good</option>
                            <option value="C">Grade C - Average</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold mb-2">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                            rows="3"
                            placeholder="Any additional information about your crop..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl p-4 rounded-lg font-bold hover:from-green-600 hover:to-teal-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : '✅ सूची बनाएं (Create Listing)'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateListingPage;

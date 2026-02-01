import CropListing from '../models/CropListing.js';

// @desc    Create new crop listing
// @route   POST /api/crops
// @access  Private (Farmer only)
export const createListing = async (req, res) => {
    try {
        const listing = await CropListing.create({
            farmer: req.user._id,
            ...req.body
        });
        
        // Broadcast new listing via Socket.io
        const io = req.app.get('io');
        io.emit('new_listing', {
            id: listing._id,
            commodity: listing.commodity,
            quantity: listing.quantity,
            expectedPrice: listing.expectedPrice,
            location: listing.location
        });
        
        res.status(201).json({
            success: true,
            data: listing
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all active listings
// @route   GET /api/crops
// @access  Public
export const getListings = async (req, res) => {
    try {
        const { commodity, state, status = 'active' } = req.query;
        
        const query = { status };
        if (commodity) query.commodity = new RegExp(commodity, 'i');
        if (state) query['location.state'] = new RegExp(state, 'i');
        
        const listings = await CropListing.find(query)
            .populate('farmer', 'name phone location')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single listing
// @route   GET /api/crops/:id
// @access  Public
export const getListing = async (req, res) => {
    try {
        const listing = await CropListing.findById(req.params.id)
            .populate('farmer', 'name phone location')
            .populate('interestedBuyers.buyer', 'name phone');
        
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        
        res.json({
            success: true,
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Show interest in a listing (Buyer)
// @route   POST /api/crops/:id/interest
// @access  Private (Buyer only)
export const showInterest = async (req, res) => {
    try {
        const { offeredPrice, message } = req.body;
        
        const listing = await CropListing.findById(req.params.id)
            .populate('farmer', 'name _id');
        
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        
        // Check if buyer already showed interest
        const alreadyInterested = listing.interestedBuyers.find(
            buyer => buyer.buyer.toString() === req.user._id.toString()
        );
        
        if (alreadyInterested) {
            return res.status(400).json({
                success: false,
                error: 'You have already shown interest'
            });
        }
        
        listing.interestedBuyers.push({
            buyer: req.user._id,
            offeredPrice,
            message
        });
        
        if (listing.status === 'active') {
            listing.status = 'in_negotiation';
        }
        
        await listing.save();
        
        // Notify farmer via Socket.io
        const io = req.app.get('io');
        io.to(`user_${listing.farmer._id}`).emit('new_interest', {
            listingId: listing._id,
            commodity: listing.commodity,
            buyer: {
                name: req.user.name,
                id: req.user._id
            },
            offeredPrice,
            message
        });
        
        res.json({
            success: true,
            message: 'Interest registered successfully',
            data: {
                farmerContact: listing.farmer.phone || listing.farmer.name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update listing status
// @route   PUT /api/crops/:id
// @access  Private (Farmer - owner only)
export const updateListing = async (req, res) => {
    try {
        let listing = await CropListing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        
        // Check ownership
        if (listing.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this listing'
            });
        }
        
        listing = await CropListing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            data: listing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete listing
// @route   DELETE /api/crops/:id
// @access  Private (Farmer - owner only)
export const deleteListing = async (req, res) => {
    try {
        const listing = await CropListing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        
        // Check ownership
        if (listing.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this listing'
            });
        }
        
        await listing.deleteOne();
        
        res.json({
            success: true,
            message: 'Listing deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get farmer's own listings
// @route   GET /api/crops/my/listings
// @access  Private (Farmer)
export const getMyListings = async (req, res) => {
    try {
        const listings = await CropListing.find({ farmer: req.user._id })
            .populate('interestedBuyers.buyer', 'name phone')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: listings.length,
            data: listings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

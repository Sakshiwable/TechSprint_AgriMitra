import Alert from '../models/Alert.js';

// @desc    Get alerts for user
// @route   GET /api/market-alerts
// @access  Private
export const getAlerts = async (req, res) => {
    try {
        const { type, severity, unreadOnly } = req.query;
        
        const query = {
            $or: [
                { targetUsers: req.user._id },
                { targetUsers: { $size: 0 } }, // Global alerts
                { targetStates: req.user.state }
            ]
        };
        
        if (type) query.type = type;
        if (severity) query.severity = severity;
        if (unreadOnly === 'true') {
            query['read_by.user'] = { $ne: req.user._id };
        }
        
        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create alert (Admin or Python service)
// @route   POST /api/market-alerts
// @access  Public (should add API key in production)
export const createAlert = async (req, res) => {
    try {
        const alert = await Alert.create(req.body);
        
        // Broadcast via Socket.io
        const io = req.app.get('io');
        
        if (alert.targetUsers && alert.targetUsers.length > 0) {
            // Send to specific users
            alert.targetUsers.forEach(userId => {
                io.to(`user_${userId}`).emit('new_market_alert', alert);
            });
        } else {
            // Global alert
            io.emit('new_market_alert', alert);
        }
        
        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Mark alert as read
// @route   PUT /api/market-alerts/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }
        
        // Check if already read
        const alreadyRead = alert.read_by.find(
            r => r.user.toString() === req.user._id.toString()
        );
        
        if (!alreadyRead) {
            alert.read_by.push({ user: req.user._id });
            await alert.save();
        }
        
        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Broadcast alert (called by Python)
// @route   POST /api/market-alerts/broadcast
// @access  Public (should add API key)
export const broadcastAlert = async (req, res) => {
    try {
        const alertData = req.body;
        
        // Create alert in database
        const alert = await Alert.create(alertData);
        
        // Broadcast via Socket.io
        const io = req.app.get('io');
        
        // Emit to commodity-specific rooms
        if (alert.commodity) {
            io.to(`commodity_${alert.commodity}`).emit('new_market_alert', alert);
        }
        
        // Emit globally
        io.emit('new_market_alert_global', alert);
        
        res.json({
            success: true,
            message: 'Alert broadcasted',
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get alert statistics
// @route   GET /api/market-alerts/stats
// @access  Private
export const getAlertStats = async (req, res) => {
    try {
        const total = await Alert.countDocuments({
            $or: [
                { targetUsers: req.user._id },
                { targetUsers: { $size: 0 } }
            ]
        });
        
        const unread = await Alert.countDocuments({
            $or: [
                { targetUsers: req.user._id },
                { targetUsers: { $size: 0 } }
            ],
            'read_by.user': { $ne: req.user._id }
        });
        
        const critical = await Alert.countDocuments({
            $or: [
                { targetUsers: req.user._id },
                { targetUsers: { $size: 0 } }
            ],
            severity: 'CRITICAL',
            'read_by.user': { $ne: req.user._id }
        });
        
        res.json({
            success: true,
            data: {
                total,
                unread,
                critical
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   PATCH /api/users/language
 * @desc    Update user's language preference
 * @access  Private
 */
router.patch('/language', protect, async (req, res) => {
  try {
    const { languagePreference } = req.body;
    
    // Validate language code
    const validLanguages = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu'];
    if (!validLanguages.includes(languagePreference)) {
      return res.status(400).json({ 
        message: 'Invalid language code',
        supportedLanguages: validLanguages
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        languagePreference,
        $push: {
          translationHistory: {
            to: languagePreference,
            timestamp: new Date()
          }
        }
      },
      { new: true, select: '-passwordHash' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Language preference updated successfully',
      languagePreference: user.languagePreference
    });
    
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Server error updating language preference' });
  }
});

/**
 * @route   GET /api/users/language
 * @desc    Get user's language preference
 * @access  Private
 */
router.get('/language', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('languagePreference autoDetectLanguage translationHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      languagePreference: user.languagePreference || 'en',
      autoDetectLanguage: user.autoDetectLanguage !== false,
      translationHistory: user.translationHistory || []
    });
    
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({ message: 'Server error fetching language preference' });
  }
});

export default router;

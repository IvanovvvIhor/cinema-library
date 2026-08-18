const profileService = require('../services/profile.service');

const getAchievements = async (req, res) => {
    try { res.json(await profileService.getAchievements(req.user.id)); } 
    catch (error) { res.status(500).json({ error: 'Failed to retrieve strategic achievements' }); }
};

const getProfile = async (req, res) => {
    try { res.json(await profileService.getProfile(req.user.id)); } 
    catch (error) { res.status(500).json({ error: 'Failed to retrieve profile data' }); }
};

const updateProfile = async (req, res) => {
    try { res.json({ message: 'Profile updated successfully', user: await profileService.updateProfile(req.user.id, req.body) }); } 
    catch (error) { res.status(400).json({ error: error.message }); }
};

const getAnalytics = async (req, res) => {
    try { res.json(await profileService.getAnalytics(req.user.id)); } 
    catch (error) { res.status(500).json({ error: 'Failed to aggregate analytical data' }); }
};

module.exports = { getAchievements, getProfile, updateProfile, getAnalytics };
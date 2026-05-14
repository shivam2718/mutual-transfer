const Router = require('express').Router;
const EmployeeProfile = require('../models/EmployeeProfile');

const { authMiddleware } = require('../middleware/auth');
const router = Router();

// create or update profile (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user && req.user.id;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const rest = req.body;
    let profile = await EmployeeProfile.findOne({ user });
    if (profile) {
      Object.assign(profile, rest);
      await profile.save();
    } else {
      profile = await EmployeeProfile.create({ user, ...rest });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get current user's profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await EmployeeProfile.findOne({ user: userId }).populate('user', 'name mobile');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await EmployeeProfile.findById(req.params.id).populate('user', 'name mobile');
    if (!profile) return res.status(404).json({ message: 'Not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

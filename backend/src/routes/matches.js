const Router = require('express').Router;
const { recommend } = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

// protected route: recommend matches for a profile
router.get('/recommend/:profileId', authMiddleware, recommend);

module.exports = router;

const Router = require('express').Router;
const { register, login, refreshToken, logout, revokeAll, googleAuth, googleCallback, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/revoke', revokeAll);
router.get('/me', authMiddleware, me);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;

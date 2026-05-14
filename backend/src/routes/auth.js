const Router = require('express').Router;
const { register, login, refreshToken, logout, revokeAll } = require('../controllers/authController');


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/revoke', revokeAll);

module.exports = router;

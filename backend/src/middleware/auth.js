const { verifyAccess } = require('../utils/jwt');
const User = require('../models/User');

function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    let token = null;
    if (auth.startsWith('Bearer ')) token = auth.slice(7);
    if (!token && req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'No access token' });
    const payload = verifyAccess(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorizeRole(role) {
  return async function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const user = await User.findById(req.user.id).select('role');
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      if (user.role !== role) return res.status(403).json({ message: 'Forbidden' });
      req.user.role = user.role;
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization failed' });
    }
  };
}

module.exports = { authMiddleware, authorizeRole };

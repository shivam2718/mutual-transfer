const { verifyAccess } = require('../utils/jwt');

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
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = { authMiddleware, authorizeRole };

const User = require('../models/User');
const RefreshTokenModel = require('../models/RefreshToken');
const EmployeeProfile = require('../models/EmployeeProfile');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const axios = require('axios');
const bcrypt = require('bcrypt');

const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE = (() => {
  // default 7 days
  const d = process.env.REFRESH_TOKEN_EXPIRES || '7d';
  // rough parse for '7d' or '15m'
  if (d.endsWith('d')) return parseInt(d) * 24 * 60 * 60 * 1000;
  if (d.endsWith('h')) return parseInt(d) * 60 * 60 * 1000;
  if (d.endsWith('m')) return parseInt(d) * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
})();

function cookieOptions(req) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  };
}

async function register(req, res) {
  const { name, mobile, email, password } = req.body;
  if (!mobile || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ mobile });
  if (exists) return res.status(409).json({ message: 'User exists' });
  const hashed = await hashPassword(password);
  const user = await User.create({ name, mobile, email, password: hashed });
  const access = signAccess({ id: user._id, role: user.role });
  const refresh = signRefresh({ id: user._id });
  const tokenHash = await bcrypt.hash(refresh, 10);
  await RefreshTokenModel.create({ user: user._id, tokenHash, ip: req.ip });
  res.cookie(COOKIE_NAME, refresh, cookieOptions(req));
  return res.json({ access, user: { id: user._id, name: user.name, mobile: user.mobile } });
}

async function login(req, res) {
  const { mobile, password } = req.body;
  const user = await User.findOne({ mobile });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const access = signAccess({ id: user._id, role: user.role });
  const refresh = signRefresh({ id: user._id });
  const tokenHash = await bcrypt.hash(refresh, 10);
  await RefreshTokenModel.create({ user: user._id, tokenHash, ip: req.ip });
  res.cookie(COOKIE_NAME, refresh, cookieOptions(req));
  return res.json({ access, user: { id: user._id, name: user.name, mobile: user.mobile } });
}

async function refreshToken(req, res) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const payload = verifyRefresh(token);
    // find matching stored hash
    const candidates = await RefreshTokenModel.find({ user: payload.id, revoked: false });
    let matched = null;
    for (const c of candidates) {
      // compare token with stored hash
      // eslint-disable-next-line no-await-in-loop
      const ok = await bcrypt.compare(token, c.tokenHash);
      if (ok) {
        matched = c;
        break;
      }
    }
    if (!matched) {
      // token reuse or not found; revoke all tokens for user
      await RefreshTokenModel.deleteMany({ user: payload.id });
      return res.status(401).json({ message: 'Invalid token' });
    }

    // rotate: remove old token and issue new
    await RefreshTokenModel.deleteOne({ _id: matched._id });
    const newRefresh = signRefresh({ id: payload.id });
    const newHash = await bcrypt.hash(newRefresh, 10);
    await RefreshTokenModel.create({ user: payload.id, tokenHash: newHash, ip: req.ip, replacedByToken: undefined });
    const currentUser = await User.findById(payload.id).select('role');
    const access = signAccess({ id: payload.id, role: currentUser?.role || 'user' });
    res.cookie(COOKIE_NAME, newRefresh, cookieOptions(req));
    return res.json({ access });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function logout(req, res) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (token) {
    // find and delete matching hashed token
    try {
      const candidates = await RefreshTokenModel.find({ revoked: false });
      for (const c of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await bcrypt.compare(token, c.tokenHash);
        if (ok) await RefreshTokenModel.deleteOne({ _id: c._id });
      }
    } catch (e) {
      // ignore
    }
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/'
  });
  return res.json({ ok: true });
}

async function me(req, res) {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId).select('name email mobile provider verified role');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const profile = await EmployeeProfile.findOne({ user: userId }).select(
    'fullName email mobile department designation railwayZone division currentStation desiredStation photoUrl verified'
  );

  return res.json({ user, profile });
}

// revoke all tokens for a user (useful for admin or password reset)
async function revokeAll(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  await RefreshTokenModel.deleteMany({ user: userId });
  return res.json({ ok: true });
}

module.exports = { register, login, refreshToken, logout, revokeAll, me };

// Google OAuth handlers
async function googleAuth(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.');
  }
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return res.redirect(url);
}

async function googleCallback(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).json({ message: 'Missing code' });
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const access_token = tokenRes.data.access_token;
    // fetch user info
    const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${access_token}` } });
    const profile = userInfoRes.data; // contains sub, email, name, picture

    // find or create user
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      // create user with placeholder mobile
      const mobilePlaceholder = `google:${profile.sub}`;
      user = await User.create({
        name: profile.name || profile.email,
        email: profile.email,
        mobile: mobilePlaceholder,
        provider: 'google',
        googleId: profile.sub,
        verified: true
      });
    } else if (!user.googleId || user.provider !== 'google') {
      // Existing local/email user signing in with Google: link provider metadata.
      user.googleId = user.googleId || profile.sub;
      user.provider = 'google';
      user.verified = true;
      await user.save();
    }

    // ensure employee profile exists
    let emp = await EmployeeProfile.findOne({ user: user._id });
    if (!emp) {
      emp = await EmployeeProfile.create({ user: user._id, fullName: user.name, email: user.email, photoUrl: profile.picture, verified: true });
    }

    // issue tokens
    const access = signAccess({ id: user._id, role: user.role });
    const refresh = signRefresh({ id: user._id });
    const tokenHash = await bcrypt.hash(refresh, 10);
    await RefreshTokenModel.create({ user: user._id, tokenHash, ip: req.ip });

    // set cookie and redirect to frontend with access in query
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.cookie(COOKIE_NAME, refresh, cookieOptions(req));
    return res.redirect(`${frontend}/oauth/callback?access=${encodeURIComponent(access)}`);
  } catch (err) {
    console.error('Google OAuth error', err.response ? err.response.data : err.message);
    return res.status(500).json({ message: 'OAuth error' });
  }
}

module.exports.googleAuth = googleAuth;
module.exports.googleCallback = googleCallback;

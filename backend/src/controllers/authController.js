const User = require('../models/User');
const RefreshTokenModel = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
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
    const access = signAccess({ id: payload.id });
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
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ ok: true });
}

// revoke all tokens for a user (useful for admin or password reset)
async function revokeAll(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  await RefreshTokenModel.deleteMany({ user: userId });
  return res.json({ ok: true });
}

module.exports = { register, login, refreshToken, logout, revokeAll };

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  revoked: { type: Boolean, default: false },
  replacedByToken: { type: String },
  ip: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

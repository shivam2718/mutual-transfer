const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true },
    mobile: { type: String, required: true, unique: true, index: true },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    password: {
      type: String,
      required: function () {
        return this.provider === 'local';
      }
    },
    googleId: { type: String, sparse: true, index: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

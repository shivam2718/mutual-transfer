const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  profileA: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  profileB: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  score: { type: Number, required: true },
  label: { type: String },
  createdAt: { type: Date, default: Date.now }
});

MatchSchema.index({ profileA: 1, profileB: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);

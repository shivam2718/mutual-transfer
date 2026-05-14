const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String },
    employeeId: { type: String, index: true },
    mobile: { type: String },
    email: { type: String },
    railwayZone: { type: String },
    division: { type: String },
    department: { type: String },
    designation: { type: String },
    payLevel: { type: String },
    currentStation: { type: String },
    desiredStation: { type: String },
    state: { type: String },
    yearsOfService: { type: Number },
    category: { type: String },
    gender: { type: String },
    bio: { type: String },
    photoUrl: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ProfileSchema.index({ currentStation: 1, desiredStation: 1 });

module.exports = mongoose.model('EmployeeProfile', ProfileSchema);

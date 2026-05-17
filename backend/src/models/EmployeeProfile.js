const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String },
    employeeId: { type: String, index: true, unique: true, sparse: true },
    mobile: { type: String },
    email: { type: String },
    railwayZone: { type: String },
    division: { type: String },
    department: { type: String },
    branch: { type: String },
    designation: { type: String },
    payLevel: { type: String },
    postingType: { type: String },
    runningStaffType: { type: String },
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
// ensure unique index on employeeId (sparse so documents without employeeId are allowed)
ProfileSchema.index({ employeeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('EmployeeProfile', ProfileSchema);

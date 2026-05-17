const mongoose = require('mongoose')

const transferRequestSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxLength: 500
    },
    initiatorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile'
    },
    recipientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile'
    },
    acceptedAt: Date,
    rejectedAt: Date,
    withdrawnAt: Date
  },
  { timestamps: true }
)

// Index for quick lookups
transferRequestSchema.index({ initiator: 1, recipient: 1 }, { unique: true })
transferRequestSchema.index({ recipient: 1, status: 1 })
transferRequestSchema.index({ initiator: 1, status: 1 })

module.exports = mongoose.model('TransferRequest', transferRequestSchema)

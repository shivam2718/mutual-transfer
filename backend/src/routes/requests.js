const Router = require('express').Router
const TransferRequest = require('../models/TransferRequest')
const EmployeeProfile = require('../models/EmployeeProfile')
const BlockedUser = require('../models/BlockedUser')
const { authMiddleware } = require('../middleware/auth')

const router = Router()

// Create a new transfer request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const initiatorId = req.user.id
    const { recipientId, message } = req.body

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' })
    }

    if (initiatorId === recipientId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' })
    }

    const isBlocked = await BlockedUser.findOne({
      blocker: recipientId,
      blocked: initiatorId
    })

    if (isBlocked) {
      return res.status(403).json({ message: 'You are blocked by this user' })
    }

    // Check if request already exists
    const existing = await TransferRequest.findOne({
      initiator: initiatorId,
      recipient: recipientId,
      status: { $in: ['pending', 'accepted'] }
    })

    if (existing) {
      return res.status(400).json({ message: 'Request already exists' })
    }

    // Get profiles
    const [initiatorProfile, recipientProfile] = await Promise.all([
      EmployeeProfile.findOne({ user: initiatorId }),
      EmployeeProfile.findOne({ user: recipientId })
    ])

    const request = await TransferRequest.create({
      initiator: initiatorId,
      recipient: recipientId,
      message,
      initiatorProfile: initiatorProfile?._id,
      recipientProfile: recipientProfile?._id
    })

    const populated = await request.populate([
      { path: 'initiator', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'initiatorProfile' },
      { path: 'recipientProfile' }
    ])

    res.status(201).json(populated)
  } catch (err) {
    console.error('Create request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all requests for current user (both sent and received)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { status, type } = req.query // type: 'sent' or 'received'

    let query = {}
    if (status) query.status = status

    let requests
    if (type === 'sent') {
      requests = await TransferRequest.find({ ...query, initiator: userId })
        .populate([
          { path: 'recipient', select: 'name email' },
          { path: 'recipientProfile' }
        ])
        .sort({ createdAt: -1 })
    } else if (type === 'received') {
      requests = await TransferRequest.find({ ...query, recipient: userId })
        .populate([
          { path: 'initiator', select: 'name email' },
          { path: 'initiatorProfile' }
        ])
        .sort({ createdAt: -1 })
    } else {
      // Get both
      requests = await TransferRequest.find({
        ...query,
        $or: [{ initiator: userId }, { recipient: userId }]
      })
        .populate([
          { path: 'initiator', select: 'name email' },
          { path: 'recipient', select: 'name email' },
          { path: 'initiatorProfile' },
          { path: 'recipientProfile' }
        ])
        .sort({ createdAt: -1 })
    }

    res.json(requests)
  } catch (err) {
    console.error('Get requests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Block a user from sending requests
router.post('/blocks', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id
    const { blockedUserId } = req.body

    if (!blockedUserId) {
      return res.status(400).json({ message: 'Blocked user ID is required' })
    }

    if (blockerId === blockedUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' })
    }

    const blockedRecord = await BlockedUser.findOneAndUpdate(
      { blocker: blockerId, blocked: blockedUserId },
      { blocker: blockerId, blocked: blockedUserId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate({ path: 'blocked', select: 'name email' })

    res.status(201).json(blockedRecord)
  } catch (err) {
    console.error('Block user error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// List blocked users for current user
router.get('/blocks', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id
    const blockedUsers = await BlockedUser.find({ blocker: blockerId })
      .populate({ path: 'blocked', select: 'name email' })
      .sort({ createdAt: -1 })

    res.json(blockedUsers)
  } catch (err) {
    console.error('Get blocked users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Unblock a previously blocked user
router.delete('/blocks/:blockedUserId', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id
    const { blockedUserId } = req.params

    const removed = await BlockedUser.findOneAndDelete({
      blocker: blockerId,
      blocked: blockedUserId
    })

    if (!removed) {
      return res.status(404).json({ message: 'Blocked user not found' })
    }

    res.json({ message: 'User unblocked successfully' })
  } catch (err) {
    console.error('Unblock user error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single request
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await TransferRequest.findById(req.params.id)
      .populate([
        { path: 'initiator', select: 'name email' },
        { path: 'recipient', select: 'name email' },
        { path: 'initiatorProfile' },
        { path: 'recipientProfile' }
      ])

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Check authorization
    if (request.initiator._id.toString() !== req.user.id && request.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.json(request)
  } catch (err) {
    console.error('Get single request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Accept a transfer request
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const request = await TransferRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Only recipient can accept
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only recipient can accept' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request cannot be accepted' })
    }

    request.status = 'accepted'
    request.acceptedAt = new Date()
    await request.save()

    const populated = await request.populate([
      { path: 'initiator', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'initiatorProfile' },
      { path: 'recipientProfile' }
    ])

    res.json(populated)
  } catch (err) {
    console.error('Accept request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reject a transfer request
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const request = await TransferRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Only recipient can reject
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only recipient can reject' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request cannot be rejected' })
    }

    request.status = 'rejected'
    request.rejectedAt = new Date()
    await request.save()

    const populated = await request.populate([
      { path: 'initiator', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'initiatorProfile' },
      { path: 'recipientProfile' }
    ])

    res.json(populated)
  } catch (err) {
    console.error('Reject request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Withdraw a transfer request
router.put('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const request = await TransferRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Only initiator can withdraw
    if (request.initiator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only initiator can withdraw' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request cannot be withdrawn' })
    }

    request.status = 'withdrawn'
    request.withdrawnAt = new Date()
    await request.save()

    const populated = await request.populate([
      { path: 'initiator', select: 'name email' },
      { path: 'recipient', select: 'name email' },
      { path: 'initiatorProfile' },
      { path: 'recipientProfile' }
    ])

    res.json(populated)
  } catch (err) {
    console.error('Withdraw request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router

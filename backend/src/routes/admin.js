const express = require('express');
const { authMiddleware, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const TransferRequest = require('../models/TransferRequest');

const router = express.Router();

// Protect all admin routes with auth and adminAuth
router.use(authMiddleware, authorizeRole('admin'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ role: 'user', verified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;

    const totalProfiles = await EmployeeProfile.countDocuments();
    const completeProfiles = await EmployeeProfile.countDocuments({
      $expr: {
        $gt: [
          { $size: { $filter: { input: { $objectToArray: '$$ROOT' }, as: 'item', cond: { $ne: ['$$item.v', null] } } } },
          10
        ]
      }
    });

    const totalRequests = await TransferRequest.countDocuments();
    const pendingRequests = await TransferRequest.countDocuments({ status: 'pending' });
    const acceptedRequests = await TransferRequest.countDocuments({ status: 'accepted' });
    const rejectedRequests = await TransferRequest.countDocuments({ status: 'rejected' });

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        admins: totalAdmins
      },
      profiles: {
        total: totalProfiles,
        complete: completeProfiles
      },
      transfers: {
        total: totalRequests,
        pending: pendingRequests,
        accepted: acceptedRequests,
        rejected: rejectedRequests
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profile = await EmployeeProfile.findOne({ user: req.params.id });
    const sentRequests = await TransferRequest.countDocuments({ initiator: req.params.id });
    const receivedRequests = await TransferRequest.countDocuments({ recipient: req.params.id });

    res.json({
      user,
      profile,
      stats: {
        sentRequests,
        receivedRequests
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/verify - Verify a user
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/unverify - Unverify a user
router.put('/users/:id/unverify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User unverified', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deleting the admin making the request
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up related data
    await EmployeeProfile.deleteOne({ user: req.params.id });
    await TransferRequest.deleteMany({
      $or: [{ initiator: req.params.id }, { recipient: req.params.id }]
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/requests - List all transfer requests
router.get('/requests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};
    const requests = await TransferRequest.find(filter)
      .populate('initiator', 'name email mobile')
      .populate('recipient', 'name email mobile')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await TransferRequest.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/requests/:id - Get request details
router.get('/requests/:id', async (req, res) => {
  try {
    const request = await TransferRequest.findById(req.params.id)
      .populate('initiator')
      .populate('recipient');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/activity - Recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = 20;

    const recentUsers = await User.find()
      .select('name email verified createdAt updatedAt')
      .limit(limit)
      .sort({ createdAt: -1 });

    const recentRequests = await TransferRequest.find()
      .populate('initiator', 'name')
      .populate('recipient', 'name')
      .select('status message createdAt')
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      recentUsers,
      recentRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

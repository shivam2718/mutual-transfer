const Router = require('express').Router
const { authMiddleware } = require('../middleware/auth')
const {
  findMutualMatches,
  findPartialMatches,
  getTopMatches,
  getMatchStats,
  isMutualMatch
} = require('../utils/matchingAlgorithm')

const router = Router()

// Get top matches for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 20
    const matchType = req.query.type // 'mutual', 'partial', or undefined for all

    let matches

    if (matchType === 'mutual') {
      matches = await findMutualMatches(userId)
    } else if (matchType === 'partial') {
      matches = await findPartialMatches(userId)
    } else {
      matches = await getTopMatches(userId, limit)
    }

    // Format response
    const formattedMatches = matches.slice(0, limit).map((match) => ({
      _id: match.profile._id,
      fullName: match.profile.fullName,
      email: match.profile.email,
      user: match.profile.user,
      currentStation: match.profile.currentStation,
      desiredStation: match.profile.desiredStation,
      railwayZone: match.profile.railwayZone,
      department: match.profile.department,
      designation: match.profile.designation,
      payLevel: match.profile.payLevel,
      photoUrl: match.profile.photoUrl,
      score: match.score,
      matchType: match.matchType
    }))

    res.json(formattedMatches)
  } catch (err) {
    console.error('Get matches error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get match statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const stats = await getMatchStats(userId)
    res.json(stats)
  } catch (err) {
    console.error('Get stats error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Check if two users are mutual matches
router.get('/check/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const otherUserId = req.params.otherUserId
    const isMutual = await isMutualMatch(userId, otherUserId)
    res.json({ isMutual })
  } catch (err) {
    console.error('Check mutual error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// protected route: recommend matches for a profile (legacy)
router.get('/recommend/:profileId', authMiddleware, async (req, res) => {
  try {
    // Use the new matching algorithm
    const matches = await getTopMatches(req.user.id, 10)
    res.json(matches)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router


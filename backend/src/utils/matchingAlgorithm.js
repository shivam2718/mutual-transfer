/**
 * Matching Algorithm for RailMutual
 * Finds mutual transfer matches based on railway employees' preferences
 */

const EmployeeProfile = require('../models/EmployeeProfile')

function normalizeField(value) {
  return String(value || '').trim().toLowerCase()
}

function isExactTransferMatch(userProfile, candidateProfile) {
  return (
    normalizeField(userProfile.currentStation) === normalizeField(candidateProfile.desiredStation) &&
    normalizeField(userProfile.desiredStation) === normalizeField(candidateProfile.currentStation) &&
    normalizeField(userProfile.department) === normalizeField(candidateProfile.department) &&
    normalizeField(userProfile.designation) === normalizeField(candidateProfile.designation) &&
    normalizeField(userProfile.payLevel) === normalizeField(candidateProfile.payLevel)
  )
}

/**
 * Find all mutual matches for a user
 * A mutual match is when:
 * - User A wants to go to Station X where User B currently is
 * - User B wants to go to Station Y where User A currently is
 * @param {String} userId - The user ID to find matches for
 * @returns {Array} Array of mutual match objects
 */
async function findMutualMatches(userId) {
  try {
    // Get the current user's profile
    const userProfile = await EmployeeProfile.findOne({ user: userId })
    if (!userProfile) return []

    // Find users with matching criteria:
    // 1. Current station matches user's desired station
    // 2. User's current station matches their desired station
    const matchingProfiles = await EmployeeProfile.find({
      currentStation: userProfile.desiredStation,
      desiredStation: userProfile.currentStation,
      user: { $ne: userId } // Exclude self
    }).populate('user', 'name email')

    const exactMatches = matchingProfiles.filter((profile) => isExactTransferMatch(userProfile, profile))

    // Score and rank matches
    const scoredMatches = exactMatches.map((profile) => ({
      profile,
      score: calculateMatchScore(userProfile, profile),
      matchType: 'MUTUAL_EXACT' // Exact mutual match
    }))

    return scoredMatches.sort((a, b) => b.score - a.score)
  } catch (err) {
    console.error('Error finding mutual matches:', err)
    return []
  }
}

/**
 * Find partial matches (same zone, department, or similar stations)
 * @param {String} userId - The user ID
 * @returns {Array} Array of partial match objects
 */
async function findPartialMatches(userId) {
  return []
}

/**
 * Calculate match score for mutual matches
 * Factors: zone compatibility, department match, pay level similarity, designation overlap
 */
function calculateMatchScore(userProfile, candidateProfile) {
  let score = 100 // Base score for exact mutual match

  // Same zone bonus
  if (userProfile.railwayZone === candidateProfile.railwayZone) {
    score += 10
  }

  // Same department bonus
  if (userProfile.department === candidateProfile.department) {
    score += 15
  }

  // Similar pay levels (within 2 levels)
  const payDiff = Math.abs(parseInt(userProfile.payLevel) - parseInt(candidateProfile.payLevel))
  if (payDiff <= 2) {
    score += 5
  }

  // Same category bonus
  if (userProfile.category === candidateProfile.category) {
    score += 5
  }

  // Same gender preference (optional, for compatibility)
  if (userProfile.gender === candidateProfile.gender) {
    score += 2
  }

  return score
}

/**
 * Calculate match score for partial matches
 */
function calculatePartialMatchScore(userProfile, candidateProfile) {
  let score = 30 // Base score for partial match

  // Same zone bonus
  if (userProfile.railwayZone === candidateProfile.railwayZone) {
    score += 20
  }

  // Same department bonus
  if (userProfile.department === candidateProfile.department) {
    score += 30
  }

  // Similar pay levels
  const payDiff = Math.abs(parseInt(userProfile.payLevel) - parseInt(candidateProfile.payLevel))
  if (payDiff <= 1) {
    score += 10
  } else if (payDiff <= 2) {
    score += 5
  }

  // Same category bonus
  if (userProfile.category === candidateProfile.category) {
    score += 10
  }

  // Years of service similarity (bonus if close in experience)
  const yearsDiff = Math.abs(userProfile.yearsOfService - candidateProfile.yearsOfService)
  if (yearsDiff <= 2) {
    score += 5
  }

  return score
}

/**
 * Get all potential matches with ranking
 * Combines mutual and partial matches
 */
async function getTopMatches(userId, limit = 20) {
  try {
    const mutualMatches = await findMutualMatches(userId)

    return mutualMatches.slice(0, limit)
  } catch (err) {
    console.error('Error getting top matches:', err)
    return []
  }
}

/**
 * Check if two users are a mutual match
 */
async function isMutualMatch(userId1, userId2) {
  try {
    const profile1 = await EmployeeProfile.findOne({ user: userId1 })
    const profile2 = await EmployeeProfile.findOne({ user: userId2 })

    if (!profile1 || !profile2) return false

    return isExactTransferMatch(profile1, profile2)
  } catch (err) {
    console.error('Error checking mutual match:', err)
    return false
  }
}

/**
 * Get match statistics for a user
 */
async function getMatchStats(userId) {
  try {
    const userProfile = await EmployeeProfile.findOne({ user: userId })
    if (!userProfile) return { mutual: 0, partial: 0, total: 0 }

    const mutual = await findMutualMatches(userId)

    return {
      mutual: mutual.length,
      partial: 0,
      total: mutual.length
    }
  } catch (err) {
    console.error('Error getting match stats:', err)
    return { mutual: 0, partial: 0, total: 0 }
  }
}

module.exports = {
  findMutualMatches,
  findPartialMatches,
  getTopMatches,
  isMutualMatch,
  getMatchStats,
  calculateMatchScore,
  calculatePartialMatchScore
}

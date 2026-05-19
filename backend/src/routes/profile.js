const Router = require('express').Router;
const EmployeeProfile = require('../models/EmployeeProfile');
const { buildNearbyStationConditions } = require('../utils/stationProximity');
const { getStationSummaries } = require('../utils/stationCatalog');

const { authMiddleware } = require('../middleware/auth');
const router = Router();

function regexFilter(value) {
  return { $regex: value, $options: 'i' };
}

// search and filter profiles (public)
router.get('/', async (req, res) => {
  try {
    const query = {};
    const andConditions = [];
    
    // Build filter query from request params
    if (req.query.fullName) query.fullName = regexFilter(req.query.fullName);
    if (req.query.employeeId) query.employeeId = regexFilter(req.query.employeeId);
    if (req.query.mobile) query.mobile = regexFilter(req.query.mobile);
    if (req.query.email) query.email = regexFilter(req.query.email);
    if (req.query.railwayZone) query.railwayZone = req.query.railwayZone;
    if (req.query.division) query.division = regexFilter(req.query.division);
    if (req.query.department) query.department = req.query.department;
    if (req.query.designation) {
      query.designation = regexFilter(req.query.designation);
    }
    if (req.query.desiredStation) {
      const includeNearbyDesiredStations = String(req.query.includeNearbyDesiredStations).toLowerCase() === 'true';
      const nearbyRadiusKm = Number(req.query.nearbyRadiusKm || 0);

      if (includeNearbyDesiredStations && nearbyRadiusKm > 0) {
        const nearbyConditions = buildNearbyStationConditions(req.query.desiredStation, nearbyRadiusKm);
        if (nearbyConditions.length > 0) {
          andConditions.push({
            $or: [
              { desiredStation: regexFilter(req.query.desiredStation) },
              ...nearbyConditions
            ]
          });
        } else {
          query.desiredStation = regexFilter(req.query.desiredStation);
        }
      } else {
        query.desiredStation = regexFilter(req.query.desiredStation);
      }
    }
    if (req.query.currentStation) {
      const includeNearbyCurrentStations = String(req.query.includeNearbyCurrentStations).toLowerCase() === 'true';
      const nearbyRadiusKm = Number(req.query.nearbyRadiusKm || 0);

      if (includeNearbyCurrentStations && nearbyRadiusKm > 0) {
        const nearbyConditions = buildNearbyStationConditions(req.query.currentStation, nearbyRadiusKm);
        if (nearbyConditions.length > 0) {
          // Transform nearby conditions from desiredStation to currentStation
          const currentStationOrConditions = [
            { currentStation: regexFilter(req.query.currentStation) },
            ...nearbyConditions.map(cond => ({
              currentStation: cond.desiredStation
            }))
          ];
          andConditions.push({ $or: currentStationOrConditions });
        } else {
          query.currentStation = regexFilter(req.query.currentStation);
        }
      } else {
        query.currentStation = regexFilter(req.query.currentStation);
      }
    }
    if (req.query.payLevel) query.payLevel = req.query.payLevel;
    if (req.query.state) query.state = regexFilter(req.query.state);
    if (req.query.yearsOfService) query.yearsOfService = Number(req.query.yearsOfService);
    if (req.query.category) query.category = req.query.category;
    if (req.query.gender) query.gender = req.query.gender;
    if (req.query.verified === 'true') query.verified = true;
    if (req.query.verified === 'false') query.verified = false;

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const profiles = await EmployeeProfile.find(query)
      .populate('user', 'name email mobile verified provider')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(profiles);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stations', async (_req, res) => {
  try {
    const stations = getStationSummaries();
    res.json(stations);
  } catch (err) {
    console.error('Station catalog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// create or update profile (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user && req.user.id;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const rest = req.body;
    let profile = await EmployeeProfile.findOne({ user });
    if (profile) {
      Object.assign(profile, rest);
      await profile.save();
    } else {
      profile = await EmployeeProfile.create({ user, ...rest });
    }
    res.json(profile);
  } catch (err) {
    // handle duplicate employeeId (unique index) error
    if (err && err.code === 11000) {
      const dupField = Object.keys(err.keyValue || {}).join(', ') || 'field';
      return res.status(409).json({ message: `Duplicate ${dupField}` });
    }
    console.error('Profile save error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get current user's profile (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await EmployeeProfile.findOne({ user: userId }).populate('user', 'name mobile');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await EmployeeProfile.findById(req.params.id).populate('user', 'name mobile');
    if (!profile) return res.status(404).json({ message: 'Not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

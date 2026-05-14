const EmployeeProfile = require('../models/EmployeeProfile');
const MatchModel = require('../models/Match');

function scoreMatch(a, b) {
  let score = 0;
  let matches = 0;
  if (a.designation && b.designation && a.designation === b.designation) { matches++; }
  if (a.department && b.department && a.department === b.department) { matches++; }
  if (a.payLevel && b.payLevel && a.payLevel === b.payLevel) { matches++; }
  if (matches === 3) score = 100;
  else if (matches === 2) score = 80;
  else if (matches === 1) score = 60;
  else score = 40;
  return { score, matches };
}

module.exports.scoreMatch = scoreMatch;

// Find mutual matches for a given profile id
async function recommend(req, res) {
  try {
    const { profileId } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = Math.min(parseInt(req.query.limit || '20'), 100);
    const subject = await EmployeeProfile.findById(profileId).lean();
    if (!subject) return res.status(404).json({ message: 'Profile not found' });

    // Find candidates whose currentStation == subject.desiredStation and desiredStation == subject.currentStation
    const candidates = await EmployeeProfile.find({
      _id: { $ne: subject._id },
      currentStation: subject.desiredStation,
      desiredStation: subject.currentStation
    }).lean();

    const results = candidates.map((c) => {
      const { score, matches } = scoreMatch(subject, c);
      const label = score === 100 ? 'Perfect Mutual Match' : (score === 80 ? 'Near Match' : (score === 60 ? 'Partial Match' : 'Low Match'));
      return {
        profile: c,
        score,
        matches,
        label
      };
    });

    results.sort((a, b) => b.score - a.score);

    // persist top N matches (idempotent create/update)
    const toSave = results.slice(0, limit);
    for (const r of toSave) {
      try {
        await MatchModel.updateOne({ profileA: subject._id, profileB: r.profile._id }, { $set: { score: r.score, label: r.label } }, { upsert: true });
      } catch (e) {
        // ignore unique race
      }
    }

    const start = (page - 1) * limit;
    const pageResults = results.slice(start, start + limit);
    return res.json({ total: results.length, page, limit, data: pageResults });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { recommend };

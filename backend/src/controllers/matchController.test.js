const { scoreMatch } = require('./matchController');

describe('scoreMatch', () => {
  test('returns 100 for 3 matches', () => {
    const a = { designation: 'X', department: 'D', payLevel: '7' };
    const b = { designation: 'X', department: 'D', payLevel: '7' };
    const { score, matches } = scoreMatch(a, b);
    expect(matches).toBe(3);
    expect(score).toBe(100);
  });

  test('returns 80 for 2 matches', () => {
    const a = { designation: 'X', department: 'D', payLevel: '7' };
    const b = { designation: 'X', department: 'D', payLevel: '6' };
    const { score, matches } = scoreMatch(a, b);
    expect(matches).toBe(2);
    expect(score).toBe(80);
  });

  test('returns 60 for 1 match', () => {
    const a = { designation: 'X', department: 'D', payLevel: '7' };
    const b = { designation: 'Y', department: 'D', payLevel: '6' };
    const { score, matches } = scoreMatch(a, b);
    expect(matches).toBe(1);
    expect(score).toBe(60);
  });

  test('returns 40 for 0 matches', () => {
    const a = { designation: 'X', department: 'D', payLevel: '7' };
    const b = { designation: 'Y', department: 'Z', payLevel: '6' };
    const { score, matches } = scoreMatch(a, b);
    expect(matches).toBe(0);
    expect(score).toBe(40);
  });
});

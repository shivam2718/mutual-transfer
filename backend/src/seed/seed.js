const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const { hashPassword } = require('../utils/hash');

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo for seeding');

  // clear collections
  await User.deleteMany({});
  await EmployeeProfile.deleteMany({});

  const users = [
    { name: 'Amit Kumar', mobile: '9000000001', email: 'amit@example.com' },
    { name: 'Suresh Singh', mobile: '9000000002', email: 'suresh@example.com' },
    { name: 'Pooja Verma', mobile: '9000000003', email: 'pooja@example.com' }
  ];

  for (const u of users) {
    const pwd = await hashPassword('Password123');
    const created = await User.create({ ...u, password: pwd });
    // create matching profiles
    const profileData = {
      user: created._id,
      fullName: u.name,
      employeeId: `EMP${Math.floor(Math.random() * 10000)}`,
      mobile: u.mobile,
      email: u.email,
      railwayZone: 'Eastern',
      division: 'Patna',
      department: 'Operations',
      designation: 'Assistant Loco Pilot',
      payLevel: '7',
      currentStation: u === users[0] ? 'Patna' : (u === users[1] ? 'Delhi' : 'Patna'),
      desiredStation: u === users[0] ? 'Delhi' : (u === users[1] ? 'Patna' : 'Delhi'),
      state: 'Bihar',
      yearsOfService: 8,
      category: 'General',
      gender: 'Male',
      bio: 'Demo profile'
    };
    await EmployeeProfile.create(profileData);
  }
  const profiles = await EmployeeProfile.find({}).lean();
  console.log('Seeding completed');
  console.log('Created users and profiles:');
  for (const p of profiles) {
    console.log(`- profileId: ${p._id} | name: ${p.fullName} | mobile: ${p.mobile}`);
  }

  console.log('\nSample curl commands (use values above):');
  console.log('1) Login to get access token (cookies also set):');
  console.log("curl -i -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{\"mobile\":\"9000000001\",\"password\":\"Password123\"}' -c cookiejar.txt");
  console.log('2) Use access token from response to call matches (replace ACCESS_TOKEN and PROFILE_ID):');
  console.log("curl -H 'Authorization: Bearer ACCESS_TOKEN' http://localhost:4000/api/matches/recommend/PROFILE_ID");
  console.log('3) Or use cookie-based refresh flow by posting to /api/auth/refresh with cookiejar:');
  console.log("curl -b cookiejar.txt -c cookiejar.txt -X POST http://localhost:4000/api/auth/refresh");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

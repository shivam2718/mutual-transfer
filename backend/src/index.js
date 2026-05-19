const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const { rateLimiter } = require('./middleware/rateLimit');

const baseEnvPath = path.join(__dirname, '..', '.env');
const localEnvPath = path.join(__dirname, '..', '.env.local');

dotenv.config({ path: baseEnvPath });
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

const app = express();
const server = http.createServer(app);

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ]
    .filter(Boolean)
    .flatMap((origin) => String(origin).split(',').map((value) => value.trim()).filter(Boolean))
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', require('./routes/matches'));

const frontendDistPath = path.join(__dirname, '..', 'public');
const serveFrontend = process.env.SERVE_FRONTEND !== 'false' && fs.existsSync(frontendDistPath);

if (serveFrontend) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join', (room) => socket.join(room));
  socket.on('message', (payload) => io.to(payload.to).emit('message', payload));
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;

async function start() {
  const mongo = process.env.MONGO_URI;
  if (!mongo) throw new Error('MONGO_URI required');
  await mongoose.connect(mongo);
  try {
    await require('./models/EmployeeProfile').syncIndexes();
    console.log('EmployeeProfile indexes synced');
  } catch (err) {
    console.warn('Index sync warning:', err && err.message ? err.message : err);
  }
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

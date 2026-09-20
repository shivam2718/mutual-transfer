const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const { rateLimiter } = require('./middleware/rateLimit');

const baseEnvPath = path.join(__dirname, '..', '.env');
const localEnvPath = path.join(__dirname, '..', '.env.local');

dotenv.config({ path: baseEnvPath });
if (process.env.NODE_ENV !== 'production' && fs.existsSync(localEnvPath)) {
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

async function connectMongo() {
  const configuredUri = process.env.MONGO_URI;

  if (configuredUri) {
    try {
      await mongoose.connect(configuredUri);
      console.log('MongoDB connected to configured URI');
      return;
    } catch (err) {
      console.warn(`Configured MongoDB connection failed: ${err.message}. Falling back to in-memory MongoDB.`);
    }
  }

  const memoryMongo = await MongoMemoryServer.create();
  const mongoUri = memoryMongo.getUri();
  process.env.MONGO_URI = mongoUri;
  await mongoose.connect(mongoUri);
  console.log(`Using in-memory MongoDB at ${mongoUri}`);
}

async function start() {
  await connectMongo();
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

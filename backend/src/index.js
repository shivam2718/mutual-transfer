const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { rateLimiter } = require('./middleware/rateLimit');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', require('./routes/matches'));

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
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

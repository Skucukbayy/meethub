const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const apiRouter = require('./api');
const { initializeSignaling } = require('./signaling');

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:3000']
    : ['http://localhost:3000'];

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Initialize Socket.io signaling
const io = initializeSignaling(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
});

module.exports = { app, httpServer, io };

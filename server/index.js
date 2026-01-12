const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const apiRouter = require('./api');
const { initializeSignaling } = require('./signaling');

const app = express();
const httpServer = createServer(app);

// CORS configuration
const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';
const clientUrl = normalizeUrl(process.env.CLIENT_URL);
const allowedOrigins = [
    clientUrl,
    'https://meethub-sigma.vercel.app',
    'http://localhost:3000'
].filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeUrl(origin);
        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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

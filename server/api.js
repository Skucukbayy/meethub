const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('./auth');
const database = require('./db');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await database.users.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const result = await database.users.create(email, hashedPassword, name);

        // Generate token
        const token = generateToken(result.lastInsertRowid);

        res.status(201).json({
            token,
            user: {
                id: result.lastInsertRowid,
                email,
                name,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await database.users.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info (protected)
 */
router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await database.users.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * POST /api/rooms
 * Create a new room (protected)
 */
router.post('/rooms', authMiddleware, async (req, res) => {
    try {
        const { name, maxParticipants = 20 } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Room name is required' });
        }

        if (maxParticipants < 2 || maxParticipants > 20) {
            return res.status(400).json({ error: 'Max participants must be between 2 and 20' });
        }

        const roomId = uuidv4();
        await database.rooms.create(roomId, name, req.userId, maxParticipants);

        const room = await database.rooms.findById(roomId);

        res.status(201).json({ room });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

/**
 * GET /api/rooms
 * Get user's rooms (protected)
 */
router.get('/rooms', authMiddleware, async (req, res) => {
    try {
        const rooms = await database.rooms.findByCreator(req.userId);
        res.json({ rooms });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ error: 'Failed to get rooms' });
    }
});

/**
 * GET /api/rooms/:id
 * Get room details
 */
router.get('/rooms/:id', async (req, res) => {
    try {
        const room = await database.rooms.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (!room.is_active) {
            return res.status(410).json({ error: 'Room is no longer active' });
        }

        // Get active participant count
        const participantCount = await database.participants.getActiveCount(room.id);

        res.json({
            room: {
                ...room,
                activeParticipants: participantCount.count,
            },
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ error: 'Failed to get room' });
    }
});

module.exports = router;

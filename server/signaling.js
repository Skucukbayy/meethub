const { Server } = require('socket.io');
const { verifyToken } = require('./auth');
const database = require('./db');

// Store active rooms and their participants
const activeRooms = new Map();

function initializeSignaling(httpServer) {
    const normalizeUrl = (url) => url ? url.replace(/\/+$/, '') : '';
    const clientUrl = normalizeUrl(process.env.CLIENT_URL);
    const allowedOrigins = [
        clientUrl,
        'https://meethub-sigma.vercel.app',
        'http://localhost:3000'
    ].filter(Boolean);

    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                const normalizedOrigin = normalizeUrl(origin);
                if (allowedOrigins.includes(normalizedOrigin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return next(new Error('Invalid token'));
        }

        socket.userId = decoded.userId;
        next();
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        /**
         * Join a room
         */
        socket.on('join-room', async ({ roomId, userName }) => {
            try {
                // Verify room exists
                const room = await database.rooms.findById(roomId);
                if (!room || !room.is_active) {
                    socket.emit('error', { message: 'Room not found or inactive' });
                    return;
                }

                // Check participant limit
                const participantCount = await database.participants.getActiveCount(roomId);
                if (participantCount.count >= room.max_participants) {
                    socket.emit('error', { message: 'Room is full' });
                    return;
                }

                // Add to room
                socket.join(roomId);
                socket.roomId = roomId;
                socket.userName = userName;

                // Track active participants
                if (!activeRooms.has(roomId)) {
                    activeRooms.set(roomId, new Map());
                }
                activeRooms.get(roomId).set(socket.id, {
                    userId: socket.userId,
                    userName,
                    peerId: socket.id,
                });

                // Add to database
                try {
                    await database.participants.add(roomId, socket.userId);
                } catch (error) {
                    // Ignore duplicate entry errors
                    console.log('Participant already in room');
                }

                // Get all participants in room
                const participants = Array.from(activeRooms.get(roomId).values());

                // Notify user they joined
                socket.emit('room-joined', {
                    roomId,
                    participants: participants.filter(p => p.peerId !== socket.id),
                });

                // Notify others
                socket.to(roomId).emit('user-joined', {
                    userId: socket.userId,
                    userName,
                    peerId: socket.id,
                });

                console.log(`User ${userName} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        /**
         * Leave room
         */
        socket.on('leave-room', () => {
            handleLeaveRoom(socket);
        });

        /**
         * WebRTC Signaling: Offer
         */
        socket.on('offer', ({ to, offer }) => {
            socket.to(to).emit('offer', {
                from: socket.id,
                offer,
            });
        });

        /**
         * WebRTC Signaling: Answer
         */
        socket.on('answer', ({ to, answer }) => {
            socket.to(to).emit('answer', {
                from: socket.id,
                answer,
            });
        });

        /**
         * WebRTC Signaling: ICE Candidate
         */
        socket.on('ice-candidate', ({ to, candidate }) => {
            socket.to(to).emit('ice-candidate', {
                from: socket.id,
                candidate,
            });
        });

        /**
         * Media control: Toggle audio
         */
        socket.on('toggle-audio', ({ enabled }) => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-audio-toggled', {
                    peerId: socket.id,
                    enabled,
                });
            }
        });

        /**
         * Media control: Toggle video
         */
        socket.on('toggle-video', ({ enabled }) => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-video-toggled', {
                    peerId: socket.id,
                    enabled,
                });
            }
        });

        /**
         * Screen sharing started
         */
        socket.on('screen-share-started', () => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-screen-share-started', {
                    peerId: socket.id,
                    userName: socket.userName,
                });
            }
        });

        /**
         * Screen sharing stopped
         */
        socket.on('screen-share-stopped', () => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit('user-screen-share-stopped', {
                    peerId: socket.id,
                });
            }
        });

        /**
         * Disconnect
         */
        socket.on('disconnect', () => {
            handleLeaveRoom(socket);
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    /**
     * Helper: Handle leaving room
     */
    async function handleLeaveRoom(socket) {
        if (socket.roomId) {
            const roomId = socket.roomId;

            // Remove from active participants
            if (activeRooms.has(roomId)) {
                activeRooms.get(roomId).delete(socket.id);

                // Clean up empty rooms
                if (activeRooms.get(roomId).size === 0) {
                    activeRooms.delete(roomId);
                }
            }

            // Update database
            try {
                await database.participants.remove(roomId, socket.userId);
            } catch (error) {
                console.error('Error removing participant:', error);
            }

            // Notify others
            socket.to(roomId).emit('user-left', {
                peerId: socket.id,
                userName: socket.userName,
            });

            socket.leave(roomId);
            socket.roomId = null;
        }
    }

    return io;
}

module.exports = { initializeSignaling };

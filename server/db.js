const { Pool } = require('pg');

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
    // PostgreSQL for production
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });

    db = {
        query: (text, params) => pool.query(text, params),
        pool
    };
} else {
    // SQLite for development
    const Database = require('better-sqlite3');
    const path = require('path');
    const sqlite = new Database(path.join(__dirname, '../database.sqlite'));

    sqlite.pragma('foreign_keys = ON');

    // Create tables for SQLite
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creator_id INTEGER NOT NULL,
      max_participants INTEGER DEFAULT 20,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS room_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      left_at DATETIME,
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

    db = {
        sqlite,
        prepare: (sql) => sqlite.prepare(sql)
    };
}

// User operations
const users = {
    async create(email, password, name) {
        if (isProduction) {
            const result = await db.query(
                'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
                [email, password, name]
            );
            return { lastInsertRowid: result.rows[0].id };
        } else {
            const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
            return stmt.run(email, password, name);
        }
    },

    async findByEmail(email) {
        if (isProduction) {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } else {
            const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
            return stmt.get(email);
        }
    },

    async findById(id) {
        if (isProduction) {
            const result = await db.query(
                'SELECT id, email, name, created_at FROM users WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } else {
            const stmt = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?');
            return stmt.get(id);
        }
    }
};

// Room operations
const rooms = {
    async create(id, name, creatorId, maxParticipants) {
        if (isProduction) {
            await db.query(
                'INSERT INTO rooms (id, name, creator_id, max_participants) VALUES ($1, $2, $3, $4)',
                [id, name, creatorId, maxParticipants]
            );
        } else {
            const stmt = db.prepare('INSERT INTO rooms (id, name, creator_id, max_participants) VALUES (?, ?, ?, ?)');
            stmt.run(id, name, creatorId, maxParticipants);
        }
    },

    async findById(id) {
        if (isProduction) {
            const result = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
            return result.rows[0];
        } else {
            const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
            return stmt.get(id);
        }
    },

    async findByCreator(creatorId) {
        if (isProduction) {
            const result = await db.query(
                'SELECT * FROM rooms WHERE creator_id = $1 AND is_active = true ORDER BY created_at DESC',
                [creatorId]
            );
            return result.rows;
        } else {
            const stmt = db.prepare('SELECT * FROM rooms WHERE creator_id = ? AND is_active = 1 ORDER BY created_at DESC');
            return stmt.all(creatorId);
        }
    },

    async updateStatus(isActive, id) {
        if (isProduction) {
            await db.query('UPDATE rooms SET is_active = $1 WHERE id = $2', [isActive, id]);
        } else {
            const stmt = db.prepare('UPDATE rooms SET is_active = ? WHERE id = ?');
            stmt.run(isActive, id);
        }
    }
};

// Room participant operations
const participants = {
    async add(roomId, userId) {
        if (isProduction) {
            await db.query(
                'INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)',
                [roomId, userId]
            );
        } else {
            const stmt = db.prepare('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)');
            stmt.run(roomId, userId);
        }
    },

    async remove(roomId, userId) {
        if (isProduction) {
            await db.query(
                'UPDATE room_participants SET left_at = CURRENT_TIMESTAMP WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL',
                [roomId, userId]
            );
        } else {
            const stmt = db.prepare('UPDATE room_participants SET left_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ? AND left_at IS NULL');
            stmt.run(roomId, userId);
        }
    },

    async getActiveCount(roomId) {
        if (isProduction) {
            const result = await db.query(
                'SELECT COUNT(*) as count FROM room_participants WHERE room_id = $1 AND left_at IS NULL',
                [roomId]
            );
            return result.rows[0];
        } else {
            const stmt = db.prepare('SELECT COUNT(*) as count FROM room_participants WHERE room_id = ? AND left_at IS NULL');
            return stmt.get(roomId);
        }
    },

    async getList(roomId) {
        if (isProduction) {
            const result = await db.query(
                'SELECT u.id, u.name, u.email, rp.joined_at FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = $1 AND rp.left_at IS NULL',
                [roomId]
            );
            return result.rows;
        } else {
            const stmt = db.prepare('SELECT u.id, u.name, u.email, rp.joined_at FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? AND rp.left_at IS NULL');
            return stmt.all(roomId);
        }
    }
};

module.exports = {
    db,
    users,
    rooms,
    participants,
    isProduction
};

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function migrate() {
    try {
        console.log('🔄 Starting database migration...');

        // Create users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Users table created');

        // Create rooms table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        creator_id INTEGER NOT NULL REFERENCES users(id),
        max_participants INTEGER DEFAULT 20,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Rooms table created');

        // Create room_participants table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(36) NOT NULL REFERENCES rooms(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP
      );
    `);
        console.log('✅ Room participants table created');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

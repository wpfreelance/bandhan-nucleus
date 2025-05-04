import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Setup WebSocket for Neon
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // Only allow POST requests and only in development
  if (req.method !== 'POST' || process.env.NODE_ENV !== 'development') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to the database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    console.log('Pushing schema to database...');
    
    // For simplicity, we're using direct schema push instead of migrations
    // In production, you would use proper migrations
    
    // First, let's create the enums if they don't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
          CREATE TYPE status AS ENUM ('pending', 'verified', 'rejected');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('admin', 'student');
        END IF;
      END$$;
    `);
    
    // Create or update the tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        full_name VARCHAR(256),
        email VARCHAR(256) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(256),
        role role NOT NULL DEFAULT 'student',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(256) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        contact_person VARCHAR(256),
        contact_email VARCHAR(256),
        contact_phone VARCHAR(20),
        admin_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        school_id INTEGER REFERENCES schools(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        father_name VARCHAR(200),
        class VARCHAR(20),
        section VARCHAR(10),
        roll_number VARCHAR(20),
        gender VARCHAR(10),
        date_of_birth TIMESTAMP,
        address TEXT,
        email VARCHAR(256),
        phone VARCHAR(20) NOT NULL,
        selfie_url TEXT,
        status status DEFAULT 'pending',
        verified_at TIMESTAMP,
        verified_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS discount_applications (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        service_id VARCHAR(256) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    
    // Add columns if they don't exist
    await pool.query(`
      DO $$
      BEGIN
        -- Add username column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
          ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
        END IF;
        
        -- Add full_name column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
          ALTER TABLE users ADD COLUMN full_name VARCHAR(256);
        END IF;
      END$$;
    `);
    
    console.log('Schema push complete!');
    
    await pool.end();
    
    res.status(200).json({ message: 'Database schema updated successfully' });
    
  } catch (error) {
    console.error('Error updating database schema:', error);
    res.status(500).json({ 
      message: 'Error updating database schema', 
      error: error.message 
    });
  }
}
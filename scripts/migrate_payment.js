
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@localhost:5432/venkteshwar',
});

async function migrate() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("DATABASE_URL not found in .env");
            // Try to see if SUPABASE_URL is there, maybe constructing it? 
            // Usually Supabase provides a direct connection string.
            // Let's print what we found (masked)
            console.log("Env keys found:", Object.keys(process.env).filter(k => !k.startsWith('npm_')));
        }

        const client = await pool.connect();

        // Add columns if they don't exist
        await client.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS order_id VARCHAR(100);
    `);

        console.log('Migration successful: Added payment columns to students table.');
        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();

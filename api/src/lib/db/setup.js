import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const { Pool } = pg;
const db = new Pool();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDB = async () => {
    try {
        console.log('Connecting to PostgreSQL...');
        await db.query('SELECT 1');
        console.log('PostgreSQL connected successfully.');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

        for (const stmt of statements) {
            try {
                await db.query(stmt);
            } catch (err) {
                // Ignore "relation already exists" error or "type already exists"
                if (err.code !== '42710' && err.code !== '42711') {
                    console.error('Error executing statement:', stmt);
                    throw err;
                }
            }
        }
        console.log('Schema verified successfully.');

        console.log('Checking for existing data...');
        const { rows } = await db.query('SELECT COUNT(*) FROM products');
        if (parseInt(rows[0].count, 10) > 0) {
            console.log('Seeding skipped: Database already contains data.');
        } else {
            const seedPath = path.join(__dirname, 'seed.sql');
            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf8');
                console.log('Running seed...');
                await db.query(seedSql);
                console.log('Seeding completed successfully.');
            } else {
                console.log('Seed file not found, skipping seeding.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exit(1);
    }
};

setupDB();

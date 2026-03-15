import pg from "pg";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const db = new Pool();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connectDB = async () => {
    const time = new Date().toLocaleTimeString("tr-TR", { hour12: false });
    try {
        await db.query("SELECT 1");
        console.log(`[DB - ${time}] PostgreSQL connected`);

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

        for (const stmt of statements) {
            try {
                await db.query(stmt);
            } catch (err) {
                if (err.code !== '42710') {
                    throw err;
                }
            }
        }

        console.log(`[DB - ${time}] Schema verified`);
    } catch (error) {
        console.error(
            `[DB - ${time}] PostgreSQL connection failed:`,
            error.message,
        );
        process.exit(1);
    }
};

export const runSeed = async () => {
    const time = new Date().toLocaleTimeString("tr-TR", { hour12: false });
    try {
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await db.query(seedSql);
        console.log(`[DB - ${time}] Seeding completed`);
    } catch (error) {
        console.error(`[DB - ${time}] Seeding failed:`, error.message);
        throw error;
    }
};

export default db;

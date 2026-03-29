import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const db = new Pool();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connectDB = async () => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    try {
        await db.query('SELECT 1');
        console.log(`[DB - ${time}] PostgreSQL connected`);
    } catch (error) {
        console.error(
            `[DB - ${time}] PostgreSQL connection failed:`,
            error.message,
        );
        process.exit(1);
    }
};

export default db;

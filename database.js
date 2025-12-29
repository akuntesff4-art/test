const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/bugs.db';

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log('📦 Connected to SQLite database');
            
            // Create tables
            db.serialize(() => {
                // Bugs table
                db.run(`CREATE TABLE IF NOT EXISTS bugs (
                    id TEXT PRIMARY KEY,
                    target TEXT NOT NULL,
                    bug_type TEXT NOT NULL,
                    payload TEXT,
                    status TEXT DEFAULT 'pending',
                    success_count INTEGER DEFAULT 0,
                    fail_count INTEGER DEFAULT 0,
                    created_at INTEGER NOT NULL,
                    completed_at INTEGER
                )`);
                
                // Logs table
                db.run(`CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    data TEXT,
                    timestamp INTEGER NOT NULL
                )`);
                
                // WhatsApp sessions
                db.run(`CREATE TABLE IF NOT EXISTS whatsapp_sessions (
                    id TEXT PRIMARY KEY,
                    phone TEXT,
                    status TEXT,
                    last_active INTEGER,
                    created_at INTEGER NOT NULL
                )`);
                
                // Users table (if needed)
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE,
                    password_hash TEXT,
                    role TEXT DEFAULT 'user',
                    created_at INTEGER NOT NULL
                )`);
            });
            
            resolve();
        });
    });
}

// Log bug
function logBug(bugData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO bugs (id, target, bug_type, payload, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            bugData.id,
            bugData.target,
            bugData.bug_type,
            bugData.payload,
            bugData.status || 'pending',
            bugData.timestamp || Date.now(),
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
        
        stmt.finalize();
    });
}

// Update bug status
function updateBugStatus(bugId, updateData) {
    return new Promise((resolve, reject) => {
        const updates = [];
        const values = [];
        
        if (updateData.status) {
            updates.push('status = ?');
            values.push(updateData.status);
        }
        
        if (updateData.success_count !== undefined) {
            updates.push('success_count = ?');
            values.push(updateData.success_count);
        }
        
        if (updateData.fail_count !== undefined) {
            updates.push('fail_count = ?');
            values.push(updateData.fail_count);
        }
        
        if (updateData.completed_at !== undefined) {
            updates.push('completed_at = ?');
            values.push(updateData.completed_at);
        }
        
        if (updates.length === 0) {
            resolve(false);
            return;
        }
        
        values.push(bugId);
        
        const query = `UPDATE bugs SET ${updates.join(', ')} WHERE id = ?`;
        
        db.run(query, values, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

// Get bug logs
function getBugLogs(limit = 50) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM bugs ORDER BY created_at DESC LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}

// Add system log
function addLog(type, message, data = null) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO logs (type, message, data, timestamp) VALUES (?, ?, ?, ?)`,
            [type, message, JSON.stringify(data), Date.now()],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

module.exports = {
    initDatabase,
    logBug,
    updateBugStatus,
    getBugLogs,
    addLog
};
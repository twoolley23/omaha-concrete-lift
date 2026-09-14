'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'leads.db');
const dbPath = process.env.LEADS_DB_PATH || DEFAULT_DB_PATH;

// Ensure the containing directory exists (matters for both the default
// ./data path and any custom LEADS_DB_PATH pointed at a mounted volume).
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    service_type TEXT NOT NULL,
    zip_or_city TEXT NOT NULL,
    description TEXT,
    preferred_contact_method TEXT,
    consent_text_version TEXT NOT NULL,
    consent_timestamp TEXT NOT NULL,
    source_ip TEXT,
    user_agent TEXT
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO leads (
    id, created_at, name, phone, email, service_type, zip_or_city,
    description, preferred_contact_method, consent_text_version,
    consent_timestamp, source_ip, user_agent
  ) VALUES (
    @id, @created_at, @name, @phone, @email, @service_type, @zip_or_city,
    @description, @preferred_contact_method, @consent_text_version,
    @consent_timestamp, @source_ip, @user_agent
  )
`);

function insertLead(lead) {
  insertStmt.run(lead);
}

function countLeads() {
  return db.prepare('SELECT COUNT(*) AS c FROM leads').get().c;
}

module.exports = { db, insertLead, countLeads, dbPath };

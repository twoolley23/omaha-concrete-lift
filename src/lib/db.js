'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'leads.db');
const dbPath = process.env.LEADS_DB_PATH || DEFAULT_DB_PATH;

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
    marketing_sms_consent INTEGER DEFAULT 0,
    project_update_sms_consent INTEGER DEFAULT 0,
    consent_version TEXT NOT NULL DEFAULT 'v2-2026-09-14',
    consent_timestamp TEXT NOT NULL,
    source_ip TEXT,
    user_agent TEXT
  );
`);

try {
  const colInfo = db.prepare("PRAGMA table_info('leads')").all();
  const existingCols = new Set(colInfo.map((c) => c.name));
  if (!existingCols.has('marketing_sms_consent')) {
    db.exec("ALTER TABLE leads ADD COLUMN marketing_sms_consent INTEGER DEFAULT 0;");
  }
  if (!existingCols.has('project_update_sms_consent')) {
    db.exec("ALTER TABLE leads ADD COLUMN project_update_sms_consent INTEGER DEFAULT 0;");
  }
  if (!existingCols.has('consent_version')) {
    db.exec("ALTER TABLE leads ADD COLUMN consent_version TEXT NOT NULL DEFAULT 'v2-2026-09-14';");
  }
} catch (err) {
  console.error('DB migration note:', err.message);
}

const insertStmt = db.prepare(`
  INSERT INTO leads (
    id, created_at, name, phone, email, service_type, zip_or_city,
    description, preferred_contact_method,
    marketing_sms_consent, project_update_sms_consent,
    consent_version, consent_timestamp, source_ip, user_agent
  ) VALUES (
    @id, @created_at, @name, @phone, @email, @service_type, @zip_or_city,
    @description, @preferred_contact_method,
    @marketing_sms_consent, @project_update_sms_consent,
    @consent_version, @consent_timestamp, @source_ip, @user_agent
  )
`);

function insertLead(lead) {
  insertStmt.run(lead);
}

function countLeads() {
  return db.prepare('SELECT COUNT(*) AS c FROM leads').get().c;
}

module.exports = { db, insertLead, countLeads, dbPath };

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function initDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      full_name TEXT,
      phone_number TEXT,
      mother_tongue TEXT,
      neet_roll_number TEXT,
      role TEXT DEFAULT 'student'
    );
    
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      college_name TEXT,
      application_year TEXT,
      admission_letter_path TEXT,
      income_certificate_path TEXT,
      twelfth_marksheet_path TEXT,
      neet_score_path TEXT,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (student_id) REFERENCES users (id)
    );
  `);

  try {
    await db.exec('ALTER TABLE users ADD COLUMN phone_number TEXT');
  } catch (err) {
    // Column might already exist, safe to ignore
  }

  try {
    await db.exec('ALTER TABLE users ADD COLUMN mother_tongue TEXT');
  } catch (err) {
    // Column might already exist, safe to ignore
  }

  try {
    await db.exec('ALTER TABLE applications ADD COLUMN twelfth_marksheet_path TEXT');
    await db.exec('ALTER TABLE applications ADD COLUMN neet_score_path TEXT');
  } catch (err) {
    // Columns might already exist, safe to ignore
  }

  // Seed Admin User if not exists
  const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin@vktrust.org']);
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await db.run(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      ['admin@vktrust.org', hash, 'Trust Board Admin', 'admin']
    );
  }

  return db;
}

module.exports = { initDB };

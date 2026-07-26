const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = 'vk_trust_scholarship_2026';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

// Setup Multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = new Date().getFullYear().toString();
    const dest = path.join('uploads', year);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest + '/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB limit
});

let db;

initDB().then(database => {
  db = database;
  console.log('Database initialized');
}).catch(err => {
  console.error('Failed to initialize database', err);
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Endpoints ---

app.post('/api/auth/apply', upload.fields([
  { name: 'admissionLetter', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'twelfthMarksheet', maxCount: 1 },
  { name: 'neetScore', maxCount: 1 }
]), async (req, res) => {
  try {
    const { email, fullName, phoneNumber, motherTongue, neetRollNumber, collegeName } = req.body;
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Insert Applicant (no password needed anymore)
    const userResult = await db.run(
      'INSERT INTO users (email, password_hash, full_name, phone_number, mother_tongue, neet_roll_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, '', fullName, phoneNumber, motherTongue, neetRollNumber, 'applicant']
    );

    const studentId = userResult.lastID;

    // Get file paths
    const admissionLetterPath = req.files['admissionLetter'] ? req.files['admissionLetter'][0].path.replace(/\\/g, '/') : '';
    const incomeCertificatePath = req.files['incomeCertificate'] ? req.files['incomeCertificate'][0].path.replace(/\\/g, '/') : '';
    const twelfthMarksheetPath = req.files['twelfthMarksheet'] ? req.files['twelfthMarksheet'][0].path.replace(/\\/g, '/') : '';
    const neetScorePath = req.files['neetScore'] ? req.files['neetScore'][0].path.replace(/\\/g, '/') : '';

    // Create Application
    await db.run(
      'INSERT INTO applications (student_id, college_name, application_year, admission_letter_path, income_certificate_path, twelfth_marksheet_path, neet_score_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, collegeName, new Date().getFullYear().toString(), admissionLetterPath, incomeCertificatePath, twelfthMarksheetPath, neetScorePath, 'Pending']
    );

    // Send Email
    try {
      const nodemailer = require('nodemailer');
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'vbktrust@gmail.com',
          pass: process.env.EMAIL_PASS || 'app_password_here'
        }
      });
      
      await transporter.sendMail({
        from: '"Vasudeo Korgaonkar Trust" <vbktrust@gmail.com>',
        to: email,
        subject: "Scholarship Application Received",
        text: `Dear ${fullName},\n\nYour application for the Vasudeo Korgaonkar Trust Scholarship has been received successfully.\n\nCollege: ${collegeName}\n\nWe will review your documents and contact you regarding the next steps.\n\nRegards,\nVasudeo Korgaonkar Trust`
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size limit exceeded (Max 2MB)' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});



// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role, message: 'Admin login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Endpoints ---

// Get all applications
app.get('/api/admin/applications', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    const applications = await db.all(`
      SELECT a.id, a.status, a.college_name, a.application_year, a.admission_letter_path, a.income_certificate_path, a.twelfth_marksheet_path, a.neet_score_path,
             u.full_name, u.email, u.phone_number, u.mother_tongue, u.neet_roll_number 
      FROM applications a
      JOIN users u ON a.student_id = u.id
    `);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status
app.patch('/api/admin/applications/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  try {
    const { status } = req.body;
    await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Student Endpoints ---



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

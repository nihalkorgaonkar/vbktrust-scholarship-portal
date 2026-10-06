import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, CheckCircle, FileText, Upload, Calendar, Award,
  GraduationCap, Clock, AlertCircle, LogOut, ArrowRight, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './StudentRecordsPage.css';

const StudentRecordsPage = () => {
  const navigate = useNavigate();

  // Verification state
  const [credentials, setCredentials] = useState({
    email: localStorage.getItem('vbk_student_email') || '',
    neetRoll: localStorage.getItem('vbk_student_neet') || ''
  });
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state for new annual record
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    academicYear: '',
    yearOfStudy: '',
    semester: '',
    examinationDetails: '',
    percentage: '',
    grade: '',
    remarks: ''
  });
  const [marksheetFile, setMarksheetFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const marksheetRef = useRef(null);

  // If credentials already stored, auto-verify
  useEffect(() => {
    if (credentials.email && credentials.neetRoll) {
      handleLookup(credentials.email, credentials.neetRoll);
    }
  }, []);

  const handleLookup = async (email, neetRoll) => {
    const e = email.trim();
    const n = neetRoll.trim();
    if (!e || !n) {
      setError('Please provide both your registered email address and NEET roll number.');
      return;
    }

    setVerifying(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/annual-records?student_email=${encodeURIComponent(e)}&neet_roll=${encodeURIComponent(n)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify student credentials.');
      }

      setVerifiedStudent(data.student);
      setRecords(data.records || []);
      localStorage.setItem('vbk_student_email', e);
      localStorage.setItem('vbk_student_neet', n);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not find your student record.');
      setVerifiedStudent(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vbk_student_email');
    localStorage.removeItem('vbk_student_neet');
    setVerifiedStudent(null);
    setRecords([]);
    setCredentials({ email: '', neetRoll: '' });
    setError('');
    setSuccessMsg('');
    setShowForm(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Marksheet file size must be under 2 MB.');
        return;
      }
      setMarksheetFile(file);
      setError('');
    }
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.yearOfStudy) {
      setError('Academic Year and Year of Study are mandatory fields.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      let marksheetPath = null;
      if (marksheetFile) {
        const ext = marksheetFile.name.split('.').pop();
        const fileName = `annual_records/${verifiedStudent.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data: uData, error: uErr } = await supabase.storage.from('uploads').upload(fileName, marksheetFile);
        if (uErr) throw uErr;
        marksheetPath = uData.path;
      }

      const res = await fetch('/api/annual-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: credentials.email,
          neet_roll: credentials.neetRoll,
          academic_year: formData.academicYear,
          year_of_study: formData.yearOfStudy,
          semester: formData.semester,
          examination_details: formData.examinationDetails,
          percentage: formData.percentage,
          grade: formData.grade,
          remarks: formData.remarks,
          marksheet_path: marksheetPath
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit annual record.');

      setSuccessMsg(`Academic record for ${formData.academicYear} submitted successfully! Your historical records have been updated.`);
      setFormData({
        academicYear: '',
        yearOfStudy: '',
        semester: '',
        examinationDetails: '',
        percentage: '',
        grade: '',
        remarks: ''
      });
      setMarksheetFile(null);
      setShowForm(false);

      // Refresh list
      handleLookup(credentials.email, credentials.neetRoll);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error submitting academic record. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="student-records-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="records-hero text-center">
          <div className="hero-badge">
            <GraduationCap size={16} /> Annual Academic Portal
          </div>
          <h1 className="hero-title">Student Academic Records</h1>
          <p className="hero-subtitle">
            Vasudeo Balkrishna Korgaonkar Trust — Medical Scholarship Scheme
          </p>
          <p className="hero-desc">
            Scholarship recipients and applicants are required to submit their academic progress, marks, and examination marksheets at the conclusion of every academic year to maintain their historical record with the Trust.
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Success Banner ── */}
        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Phase 1: Student Verification ── */}
        {!verifiedStudent ? (
          <div className="verification-card card">
            <div className="card-header">
              <ShieldCheck size={28} className="icon-shield" />
              <div>
                <h2>Access Your Academic Records</h2>
                <p>Enter the registered email and NEET roll number used during your scholarship application.</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLookup(credentials.email, credentials.neetRoll); }}>
              <div className="form-group">
                <label className="form-label">Registered Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@example.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NEET Roll Number <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 50012345"
                  value={credentials.neetRoll}
                  onChange={(e) => setCredentials(prev => ({ ...prev, neetRoll: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-cta btn-block" disabled={verifying}>
                {verifying ? 'Verifying Student Details…' : 'Verify & Access Academic Records'}
              </button>

              <div className="new-applicant-note text-center mt-4">
                <span>Not applied yet? </span>
                <button type="button" className="link-button" onClick={() => navigate('/register')}>
                  Submit Initial Scholarship Application <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── Phase 2: Student Dashboard ── */
          <div className="records-dashboard">
            {/* Student Profile Card */}
            <div className="student-profile-card card">
              <div className="student-profile-main">
                <div className="student-avatar">
                  {verifiedStudent.full_name?.charAt(0) || 'S'}
                </div>
                <div className="student-details">
                  <h2>{verifiedStudent.full_name}</h2>
                  <p className="student-meta">
                    <strong>College:</strong> {verifiedStudent.college_name} | <strong>NEET Roll:</strong> {verifiedStudent.neet_roll_number}
                  </p>
                  <p className="student-email">{verifiedStudent.email}</p>
                </div>
              </div>
              <div className="profile-actions">
                <span className={`status-badge status-${(verifiedStudent.status || 'pending').toLowerCase()}`}>
                  {verifiedStudent.status}
                </span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout} title="Switch Account">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="records-action-bar">
              <div>
                <h3>Academic Submissions History ({records.length})</h3>
                <p className="action-subtitle">Previous annual submissions are safely preserved below and cannot be overwritten.</p>
              </div>
              <button
                className={`btn ${showForm ? 'btn-outline' : 'btn-cta'}`}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel Submission' : '+ Submit This Year’s Academic Record'}
              </button>
            </div>

            {/* New Annual Record Submission Form */}
            {showForm && (
              <div className="new-record-card card fade-in">
                <div className="card-header-simple">
                  <Plus size={20} className="icon-plus" />
                  <h4>Submit Annual Academic Update</h4>
                </div>
                <p className="form-instruction">
                  Please provide your academic achievements, examination scores, and marksheet for the current year of study.
                </p>

                <form onSubmit={handleSubmitRecord}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Academic Year <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 2024-2025"
                        value={formData.academicYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year of Study <span className="required">*</span></label>
                      <select
                        className="form-input"
                        value={formData.yearOfStudy}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                        required
                      >
                        <option value="">Select Year of Study</option>
                        <option value="1st Year MBBS">1st Year MBBS</option>
                        <option value="2nd Year MBBS">2nd Year MBBS</option>
                        <option value="3rd Year MBBS (Part I)">3rd Year MBBS (Part I)</option>
                        <option value="3rd Year MBBS (Part II)">3rd Year MBBS (Part II)</option>
                        <option value="Final Year MBBS">Final Year MBBS</option>
                        <option value="Compulsory Rotatory Internship">Compulsory Rotatory Internship</option>
                        <option value="Post-Graduate / Other">Post-Graduate / Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Semester / Term</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Semester 2 / Annual Exam"
                        value={formData.semester}
                        onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Examination Details</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. MUHS Winter 2024 Board Exams"
                        value={formData.examinationDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, examinationDetails: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Marks / Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-input"
                        placeholder="e.g. 74.50"
                        value={formData.percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grade / Class Result</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Distinction / First Class / Pass"
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marksheet / Scorecard Document</label>
                    <div
                      className={`upload-zone-compact ${marksheetFile ? 'success' : ''}`}
                      onClick={() => marksheetRef.current?.click()}
                    >
                      <Upload size={24} className="upload-icon" />
                      <div className="upload-text">
                        {marksheetFile ? (
                          <span className="success-text"><CheckCircle size={16} /> {marksheetFile.name}</span>
                        ) : (
                          <span>Click to upload marksheet (PDF / JPG / PNG, max 2 MB)</span>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={marksheetRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Achievements / Remarks</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      placeholder="Mention any awards, medals, clinical distinctions, or activities during this academic year..."
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>

                  <div className="form-actions-right">
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-cta" disabled={uploading}>
                      {uploading ? 'Submitting Record…' : 'Submit & Save Academic Record'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Historical Records List */}
            {records.length === 0 ? (
              <div className="empty-records card text-center">
                <BookOpen size={44} className="icon-empty" />
                <h3>No Annual Records Submitted Yet</h3>
                <p>Click the button above to submit your marksheet and academic progress for the current academic year.</p>
              </div>
            ) : (
              <div className="records-timeline">
                {records.map((rec, index) => (
                  <div key={rec.id} className="record-card card">
                    <div className="record-header">
                      <div className="record-year-badge">
                        <Calendar size={15} /> {rec.academic_year}
                      </div>
                      <h4 className="record-study-year">{rec.year_of_study}</h4>
                      {rec.percentage && (
                        <div className="record-percentage">
                          <Award size={15} /> {rec.percentage}% {rec.grade ? `(${rec.grade})` : ''}
                        </div>
                      )}
                    </div>

                    <div className="record-body">
                      {rec.semester && (
                        <p className="record-detail"><strong>Term:</strong> {rec.semester}</p>
                      )}
                      {rec.examination_details && (
                        <p className="record-detail"><strong>Examination:</strong> {rec.examination_details}</p>
                      )}
                      {rec.remarks && (
                        <p className="record-remarks">"{rec.remarks}"</p>
                      )}
                    </div>

                    <div className="record-footer">
                      <span className="record-timestamp">
                        <Clock size={13} /> Submitted: {new Date(rec.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {rec.marksheet_path ? (
                        <a
                          href={getFileUrl(rec.marksheet_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <FileText size={14} /> View Marksheet
                        </a>
                      ) : (
                        <span className="text-secondary text-sm">No marksheet attached</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentRecordsPage;

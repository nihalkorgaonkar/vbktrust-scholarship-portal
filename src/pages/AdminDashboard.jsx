import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, XCircle, Clock, Search, Download,
  Trash2, ChevronDown, ChevronUp, Plus, BookOpen, Upload, User,
  MapPin, IndianRupee, ShieldCheck, GraduationCap, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

// ─── Annual Records Sub-Panel ──────────────────────────────────────────────
const AnnualRecordsPanel = ({ app, token, getFileUrl }) => {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState({ academic_year: '', year_of_study: '', semester: '', examination_details: '', percentage: '', grade: '', remarks: '' });
  const [uploading, setUploading] = useState(false);
  const [marksheetFile, setMarksheetFile] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const marksheetRef = useRef(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/annual-records?student_id=${app.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setRecords(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [app.user_id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let marksheetPath = null;
      if (marksheetFile) {
        const ext  = marksheetFile.name.split('.').pop();
        const name = `records/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: uData, error: uErr } = await supabase.storage.from('uploads').upload(name, marksheetFile);
        if (uErr) throw uErr;
        marksheetPath = uData.path;
      }
      await fetch('/api/annual-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: app.user_id, ...form, marksheet_path: marksheetPath })
      });
      setForm({ academic_year: '', year_of_study: '', semester: '', examination_details: '', percentage: '', grade: '', remarks: '' });
      setMarksheetFile(null);
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      alert('Failed to add record: ' + err.message);
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this annual record?')) return;
    await fetch('/api/annual-records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    fetchRecords();
  };

  return (
    <div className="records-panel">
      <div className="records-panel-header">
        <div className="records-title"><BookOpen size={16} /> Academic Records History ({records.length})</div>
        <button className="btn-sm btn-approve" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> Add Year's Record
        </button>
      </div>

      {showForm && (
        <form className="add-record-form" onSubmit={handleAdd}>
          <div className="rec-form-row">
            <input className="form-input" placeholder="Academic Year (e.g. 2024-25)" required
              value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} />
            <select className="form-input" required value={form.year_of_study}
              onChange={e => setForm(f => ({ ...f, year_of_study: e.target.value }))}>
              <option value="">Year of Study</option>
              {['1st Year MBBS', '2nd Year MBBS', '3rd Year MBBS (Part I)', '3rd Year MBBS (Part II)', 'Final Year MBBS', 'Internship'].map(y => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <input className="form-input" placeholder="Semester / Term"
              value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
            <input className="form-input" placeholder="Exam Details (e.g. MUHS Winter 2024)"
              value={form.examination_details} onChange={e => setForm(f => ({ ...f, examination_details: e.target.value }))} />
          </div>
          <div className="rec-form-row">
            <input className="form-input" placeholder="Percentage (e.g. 74.5)" type="number" step="0.01" min="0" max="100"
              value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} />
            <input className="form-input" placeholder="Grade / Result (e.g. Distinction, Pass)"
              value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
            <input className="form-input" placeholder="Achievements / Remarks"
              value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          </div>
          <div className="rec-form-row" style={{ alignItems: 'center' }}>
            <button type="button" className="upload-btn" onClick={() => marksheetRef.current.click()}>
              <Upload size={14} /> {marksheetFile ? marksheetFile.name : 'Upload Marksheet (PDF/JPG)'}
            </button>
            <input ref={marksheetRef} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setMarksheetFile(e.target.files?.[0] || null)} />
            <button type="submit" className="btn-sm btn-approve" disabled={uploading}>
              {uploading ? 'Saving…' : 'Save Record'}
            </button>
            <button type="button" className="btn-sm btn-reject" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p className="rec-loading">Loading records…</p> : records.length === 0
        ? <p className="rec-empty">No annual records submitted yet.</p>
        : (
          <table className="rec-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Year of Study</th>
                <th>Semester</th>
                <th>Exam</th>
                <th>%</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th>Marksheet</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.academic_year}</strong></td>
                  <td>{r.year_of_study}</td>
                  <td>{r.semester || '—'}</td>
                  <td>{r.examination_details || '—'}</td>
                  <td>{r.percentage ? `${r.percentage}%` : '—'}</td>
                  <td>{r.grade || '—'}</td>
                  <td>{r.remarks || '—'}</td>
                  <td>
                    {r.marksheet_path
                      ? <a href={getFileUrl(r.marksheet_path)} target="_blank" rel="noreferrer" className="btn-icon" title="View Marksheet"><FileText size={16} /></a>
                      : '—'}
                  </td>
                  <td>
                    <button className="btn-icon" title="Delete Record" style={{ color: '#ef4444' }} onClick={() => handleDelete(r.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
};

// ─── Comprehensive Student Profile Panel ──────────────────────────────────
const StudentFullProfile = ({ app, token, getFileUrl }) => {
  const [activeTab, setActiveTab] = useState('details');

  const docList = [
    { key: app.admission_letter_path, label: 'Medical Admission Letter', required: true },
    { key: app.income_certificate_path, label: 'Family Income Certificate', required: true },
    { key: app.twelfth_marksheet_path, label: '12th Marksheet', required: true },
    { key: app.neet_score_path, label: 'NEET Scorecard', required: true },
    { key: app.writeup_document_path, label: 'Statement of Purpose (Write-up)', required: true },
    { key: app.academic_achievements_path, label: 'Academic Achievements Document', required: true },
    { key: app.aadhaar_card_path, label: 'Aadhaar Card Document', required: true },
    { key: app.pan_card_path, label: 'PAN Card Document', required: false },
    { key: app.wards_pan_card_path, label: "Ward's / Parent's PAN Card", required: false },
  ];

  return (
    <div className="student-expanded-card">
      <div className="expanded-tabs">
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <User size={15} /> Full Application Details &amp; Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <GraduationCap size={15} /> Annual Academic Records
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="expanded-body">
          <div className="details-grid">

            {/* 1. Personal & Contact */}
            <div className="details-card">
              <h5><User size={15} /> Personal &amp; Identification</h5>
              <div className="detail-item"><span>Full Legal Name:</span> <strong>{app.full_name || 'N/A'}</strong></div>
              <div className="detail-item"><span>Email Address:</span> <strong>{app.email || 'N/A'}</strong></div>
              <div className="detail-item"><span>Phone Number:</span> <strong>{app.phone_number || 'N/A'}</strong></div>
              <div className="detail-item"><span>Gender:</span> <strong>{app.gender || 'Not specified'}</strong></div>
              <div className="detail-item"><span>Date of Birth:</span> <strong>{app.date_of_birth || 'Not specified'}</strong></div>
              <div className="detail-item"><span>Mother Tongue:</span> <strong>{app.mother_tongue || 'N/A'}</strong></div>
              <div className="detail-item"><span>Disability Status:</span> <strong>{app.disability_status || 'None / Not applicable'}</strong></div>
              <div className="detail-item"><span>Orphan Status:</span> <strong>{app.is_orphan ? 'Yes' : 'No'}</strong></div>
            </div>

            {/* 2. Identity Cards */}
            <div className="details-card">
              <h5><ShieldCheck size={15} /> Government ID Numbers</h5>
              <div className="detail-item"><span>Aadhaar Card Number:</span> <strong>{app.aadhaar_number || 'N/A'}</strong></div>
              <div className="detail-item"><span>Student PAN Number:</span> <strong>{app.pan_number || 'N/A'}</strong></div>
              <div className="detail-item"><span>Ward's / Parent's PAN:</span> <strong>{app.wards_pan_number || 'N/A'}</strong></div>
              <div className="detail-item"><span>Family Occupation:</span> <strong>{app.family_occupation || 'N/A'}</strong></div>
              <div className="detail-item"><span>Father's Annual Income:</span> <strong>₹{app.father_annual_income ? Number(app.father_annual_income).toLocaleString('en-IN') : '0'}</strong></div>
              <div className="detail-item"><span>Mother's Annual Income:</span> <strong>₹{app.mother_annual_income ? Number(app.mother_annual_income).toLocaleString('en-IN') : '0'}</strong></div>
              <div className="detail-item"><span>Receiving Other Scholarship:</span> <strong>{app.other_scholarship ? 'Yes' : 'No'}</strong></div>
              {app.other_scholarship && (
                <div className="detail-item"><span>Other Scholarship Details:</span> <strong>{app.other_scholarship_details}</strong></div>
              )}
            </div>

            {/* 3. Addresses */}
            <div className="details-card">
              <h5><MapPin size={15} /> Residential Addresses</h5>
              <div className="detail-item address-block">
                <span>Postal / Correspondence Address:</span>
                <p>{app.postal_address || 'N/A'}</p>
              </div>
              <div className="detail-item address-block">
                <span>Permanent Address:</span>
                <p>{app.permanent_address || 'N/A'}</p>
              </div>
            </div>

            {/* 4. Academic Details */}
            <div className="details-card">
              <h5><GraduationCap size={15} /> NEET &amp; Medical College</h5>
              <div className="detail-item"><span>College Name:</span> <strong>{app.college_name || 'N/A'}</strong></div>
              <div className="detail-item"><span>NEET Roll Number:</span> <strong>{app.neet_roll_number || 'N/A'}</strong></div>
              <div className="detail-item"><span>NEET All India Rank:</span> <strong>{app.neet_rank || 'N/A'}</strong></div>
              <div className="detail-item"><span>Application Year:</span> <strong>{app.application_year || 'N/A'}</strong></div>
              <div className="detail-item"><span>Current Status:</span> <strong>{app.status}</strong></div>
            </div>

          </div>

          {/* Reason for Scholarship / Write-up */}
          {app.reason_for_scholarship && (
            <div className="statement-box">
              <h5>Why should the Trust offer this Scholarship? (Student's Statement)</h5>
              <p>"{app.reason_for_scholarship}"</p>
            </div>
          )}

          {/* Uploaded Documents Grid */}
          <div className="documents-section">
            <h5>Uploaded Student Documents</h5>
            <div className="doc-grid">
              {docList.map(doc => (
                <div key={doc.label} className={`doc-card ${doc.key ? 'available' : 'missing'}`}>
                  <FileText size={22} className="doc-icon" />
                  <div className="doc-meta">
                    <span className="doc-name">{doc.label}</span>
                    <span className="doc-status">{doc.key ? 'Uploaded' : (doc.required ? 'Missing' : 'Not Provided')}</span>
                  </div>
                  {doc.key ? (
                    <a href={getFileUrl(doc.key)} target="_blank" rel="noreferrer" className="btn-sm btn-approve doc-link">
                      <Eye size={13} /> View
                    </a>
                  ) : (
                    <span className="doc-link disabled">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <AnnualRecordsPanel app={app} token={token} getFileUrl={getFileUrl} />
      )}
    </div>
  );
};

// ─── Main Admin Dashboard ──────────────────────────────────────────────────
const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expanded, setExpanded]         = useState(null); // id of expanded application
  const navigate = useNavigate();

  const token = () => localStorage.getItem('adminToken');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    if (!token()) { navigate('/admin'); return; }
    try {
      const response = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate('/admin');
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      const formattedData = data.map(app => ({
        ...app,
        user_id:          app.users?.id,
        full_name:        app.users?.full_name,
        email:            app.users?.email,
        phone_number:     app.users?.phone_number,
        gender:           app.users?.gender,
        date_of_birth:    app.users?.date_of_birth,
        aadhaar_number:   app.users?.aadhaar_number,
        pan_number:       app.users?.pan_number,
        wards_pan_number: app.users?.wards_pan_number,
        mother_tongue:    app.users?.mother_tongue,
        family_occupation:app.users?.family_occupation,
        postal_address:   app.users?.postal_address,
        permanent_address:app.users?.permanent_address,
        neet_roll_number: app.users?.neet_roll_number,
        neet_rank:        app.users?.neet_rank,
        disability_status:app.users?.disability_status,
        is_orphan:        app.users?.is_orphan,
        father_annual_income: app.users?.father_annual_income,
        mother_annual_income: app.users?.mother_annual_income,
        other_scholarship:    app.users?.other_scholarship,
        other_scholarship_details: app.users?.other_scholarship_details,
        aadhaar_card_path:    app.users?.aadhaar_card_path,
        pan_card_path:        app.users?.pan_card_path,
        wards_pan_card_path:  app.users?.wards_pan_card_path,
        reason_for_scholarship: app.reason_for_scholarship
      }));
      setApplications(formattedData);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userId) => {
    if (!window.confirm('Delete this application and all associated student documents? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ id, userId })
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchApplications();
    } catch (err) {
      alert('Failed to delete application. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      if (data.success && data.emailSent === false) {
        alert('Status updated, but the notification email failed: ' + data.error);
      }
      fetchApplications();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '#';
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleExportCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Gender', 'DOB', 'Aadhaar No', 'PAN No', "Ward's PAN No",
      'Mother Tongue', 'Disability Status', 'Orphan', 'Postal Address', 'Permanent Address',
      'Family Occupation', "Father's Income", "Mother's Income", 'Other Scholarship', 'Other Scholarship Details',
      'NEET Roll No.', 'NEET Rank', 'Medical College', 'Reason for Scholarship', 'Status'
    ];
    const rows = filteredApplications.map(app => [
      `"${app.full_name || ''}"`, `"${app.email || ''}"`, `"${app.phone_number || ''}"`,
      `"${app.gender || ''}"`, `"${app.date_of_birth || ''}"`,
      `"${app.aadhaar_number || ''}"`, `"${app.pan_number || ''}"`, `"${app.wards_pan_number || ''}"`,
      `"${app.mother_tongue || ''}"`, `"${app.disability_status || ''}"`,
      `"${app.is_orphan ? 'Yes' : 'No'}"`,
      `"${(app.postal_address || '').replace(/"/g, '""')}"`,
      `"${(app.permanent_address || '').replace(/"/g, '""')}"`,
      `"${app.family_occupation || ''}"`,
      `"${app.father_annual_income || ''}"`, `"${app.mother_annual_income || ''}"`,
      `"${app.other_scholarship ? 'Yes' : 'No'}"`,
      `"${(app.other_scholarship_details || '').replace(/"/g, '""')}"`,
      `"${app.neet_roll_number || ''}"`, `"${app.neet_rank || ''}"`,
      `"${app.college_name || ''}"`,
      `"${(app.reason_for_scholarship || '').replace(/"/g, '""')}"`,
      `"${app.status}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `Scholarship_Applications_${new Date().getFullYear()}.csv`;
    a.click();
  };

  if (loading) return <div className="admin-dashboard container"><p>Loading dashboard…</p></div>;

  const filteredApplications = applications.filter(app => {
    const name = (app.full_name || '').toLowerCase();
    const roll = (app.neet_roll_number || '').toLowerCase();
    const college = (app.college_name || '').toLowerCase();
    const q    = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || roll.includes(q) || college.includes(q);
    const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-dashboard container">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h2>Scholarship Applications</h2>
          <p className="subtitle">Review and manage MBBS scholarship requests — Nair College &amp; partner colleges.</p>
        </div>
        <button className="btn btn-outline" onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin'); }}>
          Logout Admin
        </button>
      </div>

      <div className="admin-controls flex gap-4 mb-6 items-center">
        <div className="search-bar flex-1" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Search size={20} style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
          <input type="text" placeholder="Search by applicant name, NEET roll number, or college…"
            className="flex-1" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto', marginBottom: 0 }}
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button className="btn btn-cta flex items-center gap-2" style={{ marginBottom: 0 }} onClick={handleExportCSV}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card dashboard-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Contact</th>
                <th>NEET Details</th>
                <th>Medical College</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">No applications found matching your criteria.</td></tr>
              ) : filteredApplications.map(app => (
                <React.Fragment key={app.id}>
                  <tr>
                    <td>
                      <div className="font-medium">{app.full_name}</div>
                      {app.gender && <div className="text-sm text-secondary">Gender: {app.gender}</div>}
                      {app.mother_tongue && <div className="text-sm text-secondary">Lang: {app.mother_tongue}</div>}
                      {app.disability_status && <div className="text-sm text-secondary">🦽 {app.disability_status}</div>}
                      {app.is_orphan && <div className="text-sm text-secondary">Orphan: Yes</div>}
                      {app.family_occupation && <div className="text-sm text-secondary">Occ: {app.family_occupation}</div>}
                      {(app.father_annual_income || app.mother_annual_income) && (
                        <div className="text-sm text-secondary">
                          Income — Father: ₹{app.father_annual_income || 0} | Mother: ₹{app.mother_annual_income || 0}
                        </div>
                      )}
                      {app.other_scholarship && (
                        <div className="text-sm text-secondary">Other Scholarship: {app.other_scholarship_details || 'Yes'}</div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm">{app.email}</div>
                      <div className="text-sm text-secondary">{app.phone_number}</div>
                    </td>
                    <td>
                      <div>{app.neet_roll_number}</div>
                      {app.neet_rank && <div className="text-sm text-secondary">AIR Rank: {app.neet_rank}</div>}
                    </td>
                    <td>{app.college_name}</td>
                    <td>
                      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        {[
                          [app.admission_letter_path, 'Admission Letter'],
                          [app.income_certificate_path, 'Income Certificate'],
                          [app.twelfth_marksheet_path, '12th Marksheet'],
                          [app.neet_score_path, 'NEET Scorecard'],
                          [app.writeup_document_path, 'Statement of Purpose'],
                          [app.academic_achievements_path, 'Academic Achievements'],
                          [app.aadhaar_card_path, 'Aadhaar Card'],
                          [app.pan_card_path, 'PAN Card'],
                          [app.wards_pan_card_path, "Ward's PAN Card"],
                        ].map(([path, label]) => path && (
                          <a key={label} href={getFileUrl(path)} target="_blank" rel="noreferrer"
                            className="btn-icon" title={label}><FileText size={17} /></a>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase()}`}>
                        {app.status === 'Approved' && <CheckCircle size={13} />}
                        {app.status === 'Rejected' && <XCircle size={13} />}
                        {app.status === 'Pending'  && <Clock size={13} />}
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons flex gap-2">
                        <button className="btn-sm btn-approve"
                          onClick={() => handleStatusChange(app.id, 'Approved')}
                          disabled={app.status === 'Approved'}>Approve</button>
                        <button className="btn-sm btn-reject"
                          onClick={() => handleStatusChange(app.id, 'Rejected')}
                          disabled={app.status === 'Rejected'}>Reject</button>
                        <button
                          className={`btn-sm ${expanded === app.id ? 'btn-cta' : 'btn-outline'}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="View Full Student Details"
                          onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                          <Eye size={14} /> {expanded === app.id ? 'Hide Details' : 'View Full Details'}
                        </button>
                        <button className="btn-icon" title="Delete Application"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDelete(app.id, app.user_id)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === app.id && (
                    <tr className="records-row">
                      <td colSpan="7">
                        <StudentFullProfile app={app} token={token()} getFileUrl={getFileUrl} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

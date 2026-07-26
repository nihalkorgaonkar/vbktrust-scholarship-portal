import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Search, Download } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }

    try {
      const response = await fetch('/api/admin/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Applicant Name', 'Email', 'Phone Number', 'Mother Tongue', 'Family Occupation', 'NEET Roll Number', 'NEET Score File', 'Medical College', 'Status'];
    
    const csvRows = [];
    csvRows.push(headers.join(','));

    filteredApplications.forEach(app => {
      const row = [
        `"${app.full_name}"`,
        `"${app.email}"`,
        `"${app.phone_number || ''}"`,
        `"${app.mother_tongue || ''}"`,
        `"${app.family_occupation || ''}"`,
        `"${app.neet_roll_number || ''}"`,
        `"${app.neet_score_path || ''}"`,
        `"${app.college_name || ''}"`,
        `"${app.status}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scholarship_Applications_${new Date().getFullYear()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="admin-dashboard container"><p>Loading dashboard...</p></div>;

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.neet_roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-dashboard container">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h2>Scholarship Applications</h2>
          <p className="subtitle">Review and manage MBBS scholarship requests.</p>
        </div>
        <button className="btn btn-outline" onClick={() => {
          localStorage.removeItem('adminToken');
          navigate('/admin');
        }}>
          Logout Admin
        </button>
      </div>

      <div className="admin-controls flex gap-4 mb-6 items-center">
        <div className="search-bar flex-1" style={{display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
          <Search className="search-icon" size={20} style={{color: '#94a3b8', marginRight: '0.5rem'}} />
          <input 
            type="text" 
            placeholder="Search by Name or NEET Roll No..." 
            className="flex-1"
            style={{border: 'none', background: 'transparent', outline: 'none', width: '100%'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="form-input" 
          style={{width: 'auto', marginBottom: 0}}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button className="btn btn-cta flex items-center gap-2" style={{marginBottom: 0}} onClick={handleExportCSV}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card dashboard-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Contact</th>
                <th>NEET Roll No.</th>
                <th>Medical College</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No applications found matching criteria.</td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="font-medium">{app.full_name}</div>
                      {app.mother_tongue && <div className="text-sm text-secondary">Lang: {app.mother_tongue}</div>}
                      {app.family_occupation && <div className="text-sm text-secondary">Occ: {app.family_occupation}</div>}
                    </td>
                    <td>
                      <div className="text-sm">{app.email}</div>
                      <div className="text-sm text-secondary">{app.phone_number}</div>
                    </td>
                    <td>{app.neet_roll_number}</td>
                    <td>{app.college_name}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`http://localhost:3001/${app.admission_letter_path}`} target="_blank" rel="noreferrer" className="btn-icon" title="View Admission Letter">
                          <FileText size={18} />
                        </a>
                        <a href={`http://localhost:3001/${app.income_certificate_path}`} target="_blank" rel="noreferrer" className="btn-icon" title="View Income Certificate">
                          <FileText size={18} />
                        </a>
                        {app.twelfth_marksheet_path && (
                          <a href={`http://localhost:3001/${app.twelfth_marksheet_path}`} target="_blank" rel="noreferrer" className="btn-icon" title="View 12th Marksheet">
                            <FileText size={18} />
                          </a>
                        )}
                        {app.neet_score_path && (
                          <a href={`http://localhost:3001/${app.neet_score_path}`} target="_blank" rel="noreferrer" className="btn-icon" title="View NEET Scorecard">
                            <FileText size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase()}`}>
                        {app.status === 'Approved' && <CheckCircle size={14} />}
                        {app.status === 'Rejected' && <XCircle size={14} />}
                        {app.status === 'Pending' && <Clock size={14} />}
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons flex gap-2">
                        <button 
                          className="btn-sm btn-approve"
                          onClick={() => handleStatusChange(app.id, 'Approved')}
                          disabled={app.status === 'Approved'}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-sm btn-reject"
                          onClick={() => handleStatusChange(app.id, 'Rejected')}
                          disabled={app.status === 'Rejected'}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin-dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card card">
        <div className="admin-login-header text-center">
          <div className="admin-login-icon">
            <ShieldCheck size={36} />
          </div>
          <h2>Trust Board Member Login</h2>
          <p>Administrative Access Only</p>
        </div>
        
        {error && <div className="error-message text-center mb-4" style={{color: 'var(--error-color)'}}>{error}</div>}

        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label className="admin-form-label">Admin Email</label>
            <input 
              type="email" 
              className="admin-form-input" 
              placeholder="admin@vktrust.org" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="admin-form-label">Password</label>
            <input 
              type="password" 
              className="admin-form-input" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-admin btn-full mt-6" disabled={loading}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

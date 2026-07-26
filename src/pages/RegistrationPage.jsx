import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, FileText, IndianRupee } from 'lucide-react';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    motherTongue: '',
    neetRollNumber: '',
    collegeName: ''
  });
  const [documents, setDocuments] = useState({
    admissionLetter: null,
    incomeCertificate: null,
    twelfthMarksheet: null,
    neetScore: null
  });
  const [loading, setLoading] = useState(false);
  const admissionRef = useRef(null);
  const incomeRef = useRef(null);
  const twelfthRef = useRef(null);
  const neetRef = useRef(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isStep1Valid = formData.email && formData.phoneNumber;
  const isStep2Valid = formData.fullName && formData.motherTongue && formData.neetRollNumber && formData.collegeName;
  const isStep3Valid = documents.admissionLetter && documents.incomeCertificate && documents.twelfthMarksheet && documents.neetScore;

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !isStep1Valid) return setError('Please fill all fields');
    if (step === 2 && !isStep2Valid) return setError('Please fill all fields');
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        setError('File size should be less than 2MB');
        return;
      }
      setDocuments(prev => ({ ...prev, [type]: e.target.files[0] }));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!isStep3Valid) {
      setError('Please upload all required documents');
      return;
    }
    setLoading(true);
    setError('');

    const submitData = new FormData();
    submitData.append('email', formData.email);
    submitData.append('fullName', formData.fullName);
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('motherTongue', formData.motherTongue);
    submitData.append('neetRollNumber', formData.neetRollNumber);
    submitData.append('collegeName', formData.collegeName);
    submitData.append('admissionLetter', documents.admissionLetter);
    submitData.append('incomeCertificate', documents.incomeCertificate);
    submitData.append('twelfthMarksheet', documents.twelfthMarksheet);
    submitData.append('neetScore', documents.neetScore);

    try {
      const response = await fetch('/api/auth/apply', {
        method: 'POST',
        body: submitData
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Application submitted successfully! Please check your email for confirmation.');
        setStep(4);
      } else {
        setError(data.error || 'Application failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page container">
      <div className="registration-card card">
        <h2 className="text-center">Scholarship Application</h2>
        <p className="text-center subtitle-text">Vasudeo Korgaonkar Trust MBBS Scholarship</p>
        
        {step < 4 && (
          <div className="wizard-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        )}

        {error && <div className="error-message text-center mb-4">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); step === 3 ? handleSubmit() : nextStep(e); }}>
          {step === 1 && (
            <div className="wizard-step fade-in">
              <h3>Account Details</h3>
              <p className="step-desc">Enter contact details for communication.</p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phoneNumber" className="form-input" value={formData.phoneNumber} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-step fade-in">
              <h3>Academic Information</h3>
              <p className="step-desc">Provide your medical admission details.</p>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mother Tongue</label>
                <select name="motherTongue" className="form-input" value={formData.motherTongue} onChange={handleInputChange} required>
                  <option value="">Select Mother Tongue</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Konkani">Konkani</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">NEET Roll Number</label>
                <input type="text" name="neetRollNumber" className="form-input" value={formData.neetRollNumber} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Medical college name where admission is granted</label>
                <input type="text" name="collegeName" className="form-input" value={formData.collegeName} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-step fade-in">
              <h3>Required Documents</h3>
              <p className="text-secondary mb-4">Please upload scanned copies of original documents (Max 2MB per file).</p>
              
              <div className={`upload-zone ${documents.admissionLetter ? 'success' : ''}`} onClick={() => admissionRef.current.click()}>
                <FileText size={40} className="upload-icon" />
                <div className="upload-text">
                  <p className="upload-title">Medical College Admission Letter</p>
                  {documents.admissionLetter ? <span className="success-text"><CheckCircle size={16} /> {documents.admissionLetter.name}</span> : <span className="upload-subtitle">Click to upload (PDF/JPG)</span>}
                </div>
                <input type="file" ref={admissionRef} style={{display: 'none'}} onChange={(e) => handleFileChange(e, 'admissionLetter')} accept=".pdf,.jpg,.jpeg,.png" />
              </div>

              <div className={`upload-zone mt-4 ${documents.incomeCertificate ? 'success' : ''}`} onClick={() => incomeRef.current.click()}>
                <IndianRupee size={40} className="upload-icon" />
                <div className="upload-text">
                  <p className="upload-title">Family Income Certificate</p>
                  {documents.incomeCertificate ? <span className="success-text"><CheckCircle size={16} /> {documents.incomeCertificate.name}</span> : <span className="upload-subtitle">Click to upload (PDF/JPG)</span>}
                </div>
                <input type="file" ref={incomeRef} style={{display: 'none'}} onChange={(e) => handleFileChange(e, 'incomeCertificate')} accept=".pdf,.jpg,.jpeg,.png" />
              </div>

              <div className={`upload-zone mt-4 ${documents.twelfthMarksheet ? 'success' : ''}`} onClick={() => twelfthRef.current.click()}>
                <FileText size={40} className="upload-icon" />
                <div className="upload-text">
                  <p className="upload-title">12th Marksheet</p>
                  {documents.twelfthMarksheet ? <span className="success-text"><CheckCircle size={16} /> {documents.twelfthMarksheet.name}</span> : <span className="upload-subtitle">Click to upload (PDF/JPG)</span>}
                </div>
                <input type="file" ref={twelfthRef} style={{display: 'none'}} onChange={(e) => handleFileChange(e, 'twelfthMarksheet')} accept=".pdf,.jpg,.jpeg,.png" />
              </div>

              <div className={`upload-zone mt-4 ${documents.neetScore ? 'success' : ''}`} onClick={() => neetRef.current.click()}>
                <FileText size={40} className="upload-icon" />
                <div className="upload-text">
                  <p className="upload-title">NEET Scorecard</p>
                  {documents.neetScore ? <span className="success-text"><CheckCircle size={16} /> {documents.neetScore.name}</span> : <span className="upload-subtitle">Click to upload (PDF/JPG)</span>}
                </div>
                <input type="file" ref={neetRef} style={{display: 'none'}} onChange={(e) => handleFileChange(e, 'neetScore')} accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content text-center py-8">
              <div className="text-success mb-4" style={{fontSize: '4rem'}}>✓</div>
              <h3>Application Submitted!</h3>
              <p className="text-secondary mt-2">{successMessage}</p>
              <button type="button" className="btn btn-outline mt-6" onClick={() => navigate('/')}>Return to Home</button>
            </div>
          )}

          {step < 4 && (
            <div className="form-actions mt-6">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button type="submit" className="btn btn-primary">
                  Next Step
                </button>
              ) : (
                <button type="submit" className="btn btn-cta" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;

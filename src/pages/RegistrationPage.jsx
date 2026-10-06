import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, FileText, IndianRupee, User, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 – Contact
    email: '',
    phoneNumber: '',
    // Step 2 – Personal
    fullName: '',
    gender: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    panNumber: '',
    wardsPanNumber: '',
    motherTongue: '',
    otherLanguage: '',
    disabilityStatus: '',
    isOrphan: '',
    // Step 3 – Address & Family
    postalAddress: '',
    permanentAddress: '',
    sameAsPostal: false,
    familyOccupation: '',
    fatherAnnualIncome: '',
    motherAnnualIncome: '',
    otherScholarship: '',
    otherScholarshipDetails: '',
    // Step 4 – Academic
    neetRollNumber: '',
    neetRank: '',
    collegeName: '',
    otherCollegeName: '',
    reasonForScholarship: ''
  });

  const [documents, setDocuments] = useState({
    admissionLetter: null,
    incomeCertificate: null,
    twelfthMarksheet: null,
    neetScore: null,
    writeupDocument: null,
    academicAchievements: null,
    aadhaarCard: null,
    panCard: null,
    wardsPanCard: null
  });

  const [loading, setLoading] = useState(false);
  const admissionRef    = useRef(null);
  const incomeRef       = useRef(null);
  const twelfthRef      = useRef(null);
  const neetRef         = useRef(null);
  const writeupRef      = useRef(null);
  const achievementsRef = useRef(null);
  const aadhaarRef      = useRef(null);
  const panRef          = useRef(null);
  const wardsPanRef     = useRef(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'sameAsPostal') {
      setFormData(prev => ({
        ...prev,
        sameAsPostal: checked,
        permanentAddress: checked ? prev.postalAddress : prev.permanentAddress
      }));
    } else if (name === 'postalAddress' && formData.sameAsPostal) {
      setFormData(prev => ({
        ...prev,
        postalAddress: value,
        permanentAddress: value
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validation per step
  const isStep1Valid = formData.email && formData.phoneNumber;
  const isLanguageValid = formData.motherTongue !== 'Other' || formData.otherLanguage;
  const isStep2Valid =
    formData.fullName && formData.gender && formData.aadhaarNumber &&
    formData.motherTongue && isLanguageValid;
  const isStep3Valid =
    formData.postalAddress && formData.permanentAddress &&
    formData.familyOccupation && formData.fatherAnnualIncome &&
    formData.isOrphan && formData.otherScholarship;
  const isStep4Valid =
    formData.neetRollNumber && formData.neetRank && formData.collegeName &&
    formData.reasonForScholarship;
  const isStep5Valid =
    documents.admissionLetter && documents.incomeCertificate &&
    documents.twelfthMarksheet && documents.neetScore &&
    documents.writeupDocument && documents.academicAchievements &&
    documents.aadhaarCard;

  const TOTAL_STEPS = 5;

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !isStep1Valid) return setError('Please fill in all required fields.');
    if (step === 2 && !isStep2Valid) return setError('Please fill in all required fields.');
    if (step === 3 && !isStep3Valid) return setError('Please fill in all required fields.');
    if (step === 4 && !isStep4Valid) return setError('Please fill in all required fields.');
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        setError('File size must be less than 2 MB.');
        return;
      }
      setDocuments(prev => ({ ...prev, [type]: e.target.files[0] }));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!isStep5Valid) {
      setError('Please upload all required documents.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const uploadFile = async (file) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
        if (error) throw error;
        return data.path;
      };

      const [
        admissionLetterPath, incomeCertificatePath, twelfthMarksheetPath,
        neetScorePath, writeupDocumentPath, academicAchievementsPath,
        aadhaarCardPath, panCardPath, wardsPanCardPath
      ] = await Promise.all([
        uploadFile(documents.admissionLetter),
        uploadFile(documents.incomeCertificate),
        uploadFile(documents.twelfthMarksheet),
        uploadFile(documents.neetScore),
        uploadFile(documents.writeupDocument),
        uploadFile(documents.academicAchievements),
        uploadFile(documents.aadhaarCard),
        uploadFile(documents.panCard),
        uploadFile(documents.wardsPanCard)
      ]);

      const studentId = crypto.randomUUID();
      const finalLanguage = formData.motherTongue === 'Other' ? formData.otherLanguage : formData.motherTongue;

      // Insert User
      let userPayload = {
        id: studentId,
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth || null,
        aadhaar_number: formData.aadhaarNumber,
        pan_number: formData.panNumber || null,
        wards_pan_number: formData.wardsPanNumber || null,
        mother_tongue: finalLanguage,
        disability_status: formData.disabilityStatus || null,
        is_orphan: formData.isOrphan === 'Yes',
        postal_address: formData.postalAddress,
        permanent_address: formData.permanentAddress,
        family_occupation: formData.familyOccupation,
        father_annual_income: formData.fatherAnnualIncome ? parseFloat(formData.fatherAnnualIncome) : null,
        mother_annual_income: formData.motherAnnualIncome ? parseFloat(formData.motherAnnualIncome) : null,
        other_scholarship: formData.otherScholarship === 'Yes',
        other_scholarship_details: formData.otherScholarshipDetails || null,
        neet_roll_number: formData.neetRollNumber,
        neet_rank: formData.neetRank ? parseInt(formData.neetRank, 10) : null,
        aadhaar_card_path: aadhaarCardPath,
        pan_card_path: panCardPath || null,
        wards_pan_card_path: wardsPanCardPath || null
      };

      const userInsertRes = await supabase.from('users').insert([userPayload]);
      if (userInsertRes.error) {
        if (userInsertRes.error.code === '23505') throw new Error('This email address is already registered.');
        if (userInsertRes.error.message?.includes('schema cache') || userInsertRes.error.message?.includes('column')) {
          console.warn('Retrying user insert with baseline columns:', userInsertRes.error.message);
          const baselinePayload = {
            id: studentId,
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            mother_tongue: finalLanguage,
            postal_address: formData.postalAddress,
            permanent_address: formData.permanentAddress,
            family_occupation: formData.familyOccupation,
            neet_roll_number: formData.neetRollNumber
          };
          const retryRes = await supabase.from('users').insert([baselinePayload]);
          if (retryRes.error) throw retryRes.error;
        } else {
          throw userInsertRes.error;
        }
      }

      const finalCollegeName = formData.collegeName === 'Other' ? formData.otherCollegeName : formData.collegeName;

      // Insert Application
      let appPayload = {
        student_id: studentId,
        college_name: finalCollegeName,
        application_year: new Date().getFullYear().toString(),
        admission_letter_path: admissionLetterPath,
        income_certificate_path: incomeCertificatePath,
        twelfth_marksheet_path: twelfthMarksheetPath,
        neet_score_path: neetScorePath,
        writeup_document_path: writeupDocumentPath,
        academic_achievements_path: academicAchievementsPath,
        reason_for_scholarship: formData.reasonForScholarship,
        status: 'Pending'
      };

      const appInsertRes = await supabase.from('applications').insert([appPayload]);
      if (appInsertRes.error) {
        if (appInsertRes.error.message?.includes('reason_for_scholarship') || appInsertRes.error.message?.includes('schema cache')) {
          console.warn('Retrying application insert without reason_for_scholarship:', appInsertRes.error.message);
          delete appPayload.reason_for_scholarship;
          const retryAppRes = await supabase.from('applications').insert([appPayload]);
          if (retryAppRes.error) throw retryAppRes.error;
        } else {
          throw appInsertRes.error;
        }
      }

      // Send confirmation email
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, fullName: formData.fullName, collegeName: finalCollegeName })
      }).catch(err => console.error('Email API failed:', err));

      setSuccessMessage('Application submitted successfully! Please check your email for confirmation.');
      setStep(6);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Submission failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const UploadZone = ({ docKey, refObj, title, subtitle, icon: Icon = FileText, accept = '.pdf,.jpg,.jpeg,.png' }) => (
    <div
      className={`upload-zone ${documents[docKey] ? 'success' : ''}`}
      onClick={() => refObj.current.click()}
    >
      <Icon size={38} className="upload-icon" />
      <div className="upload-text">
        <p className="upload-title">{title}</p>
        {documents[docKey]
          ? <span className="success-text"><CheckCircle size={14} /> {documents[docKey].name}</span>
          : <span className="upload-subtitle">{subtitle || 'Click to upload (PDF / JPG / PNG, max 2 MB)'}</span>
        }
      </div>
      <input type="file" ref={refObj} style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, docKey)} accept={accept} />
    </div>
  );

  return (
    <div className="registration-page">
      <div className="registration-card card">
        <h2 className="text-center">Scholarship Application</h2>
        <p className="text-center subtitle-text">Vasudeo Balkrishna Korgaonkar Trust — MBBS Scholarship</p>

        {/* Eligibility notice on step 1 only */}
        {step === 1 && (
          <div className="eligibility-notice">
            <h4>Eligibility &amp; Guidelines</h4>
            <ul>
              <li>The Trust will sponsor <strong>2 Scholarships</strong>. Open to open-category students from financially poor families.</li>
              <li>The Trust would prefer students from <strong>Maharashtra</strong>; at least one should be of <strong>Marathi Mother Tongue</strong>.</li>
              <li>Students from <strong>G.S. Medical College, Grand Medical College, Sion Hospital Medical College, and Nair Hospital College</strong> may apply.</li>
              <li>Selected candidates should commit to at least <strong>the first 5 years of practicing medicine in India</strong>.</li>
              <li>After that, if they wish to go abroad for employment, they are morally obliged to sponsor at least one student from poor homes in either medicine, pure sciences, or technology in consultation with the Trust.</li>
              <li>Candidates are expected to <strong>volunteer and participate</strong> in Trust activities such as medical camps in rural and tribal areas.</li>
            </ul>
          </div>
        )}

        {/* Step Progress */}
        {step < 6 && (
          <div className="wizard-progress">
            {[1, 2, 3, 4, 5].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`progress-step ${step >= s ? 'active' : ''}`}>{s}</div>
                {i < 4 && <div className={`progress-line ${step > s ? 'active' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && <div className="error-message text-center mb-4">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); step === TOTAL_STEPS ? handleSubmit() : nextStep(e); }}>

          {/* ── Step 1: Contact Details ── */}
          {step === 1 && (
            <div className="wizard-step fade-in">
              <h3>Contact Details</h3>
              <p className="step-desc">Enter your email and phone number for all communications.</p>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input type="tel" name="phoneNumber" className="form-input" value={formData.phoneNumber} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {/* ── Step 2: Personal Information ── */}
          {step === 2 && (
            <div className="wizard-step fade-in">
              <h3>Personal Information</h3>
              <p className="step-desc">Provide your personal and identification details.</p>

              <div className="form-group">
                <label className="form-label">Full Legal Name <span className="required">*</span></label>
                <input type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender <span className="required">*</span></label>
                  <select name="gender" className="form-input" value={formData.gender} onChange={handleInputChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dateOfBirth" className="form-input" value={formData.dateOfBirth} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Card Number <span className="required">*</span></label>
                <input type="text" name="aadhaarNumber" className="form-input" maxLength="12" placeholder="12-digit Aadhaar number" value={formData.aadhaarNumber} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PAN Card Number</label>
                  <input type="text" name="panNumber" className="form-input" maxLength="10" placeholder="ABCDE1234F" value={formData.panNumber} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ward's PAN Card Number</label>
                  <input type="text" name="wardsPanNumber" className="form-input" maxLength="10" placeholder="Parent / Guardian PAN" value={formData.wardsPanNumber} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mother Tongue <span className="required">*</span></label>
                <select name="motherTongue" className="form-input" value={formData.motherTongue} onChange={handleInputChange} required>
                  <option value="">Select Mother Tongue</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Konkani">Konkani</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {formData.motherTongue === 'Other' && (
                <div className="form-group fade-in mt-2">
                  <label className="form-label">Specify Language <span className="required">*</span></label>
                  <input type="text" name="otherLanguage" className="form-input" value={formData.otherLanguage} onChange={handleInputChange} required />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Disability / Special Category</label>
                <select name="disabilityStatus" className="form-input" value={formData.disabilityStatus} onChange={handleInputChange}>
                  <option value="">None / Not applicable</option>
                  <option value="Blind / Visually Impaired">Blind / Visually Impaired</option>
                  <option value="Physical Disability">Physical Disability</option>
                  <option value="Hearing Impaired">Hearing Impaired</option>
                  <option value="Other Disability">Other Disability / Special Category</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 3: Address & Family Background ── */}
          {step === 3 && (
            <div className="wizard-step fade-in">
              <h3>Address &amp; Family Background</h3>
              <p className="step-desc">Provide your address and financial background details.</p>

              <div className="form-group">
                <label className="form-label">Postal Address <span className="required">*</span></label>
                <textarea name="postalAddress" className="form-input" rows="3" value={formData.postalAddress} onChange={handleInputChange} required />
              </div>
              <div className="form-group checkbox-group">
                <input type="checkbox" id="sameAsPostal" name="sameAsPostal" checked={formData.sameAsPostal} onChange={handleInputChange} />
                <label htmlFor="sameAsPostal">Permanent address is the same as postal address</label>
              </div>
              <div className="form-group">
                <label className="form-label">Permanent Address <span className="required">*</span></label>
                <textarea name="permanentAddress" className="form-input" rows="3" value={formData.permanentAddress} onChange={handleInputChange} disabled={formData.sameAsPostal} required />
              </div>

              <div className="form-group">
                <label className="form-label">Family Occupation <span className="required">*</span></label>
                <input type="text" name="familyOccupation" className="form-input" value={formData.familyOccupation} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Father's Annual Income (₹) <span className="required">*</span></label>
                  <input type="number" name="fatherAnnualIncome" className="form-input" min="0" placeholder="e.g. 120000" value={formData.fatherAnnualIncome} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mother's Annual Income (₹)</label>
                  <input type="number" name="motherAnnualIncome" className="form-input" min="0" placeholder="e.g. 0" value={formData.motherAnnualIncome} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Are you an orphan? <span className="required">*</span></label>
                <div className="radio-group">
                  {['Yes', 'No'].map(v => (
                    <label key={v} className="radio-label">
                      <input type="radio" name="isOrphan" value={v} checked={formData.isOrphan === v} onChange={handleInputChange} required />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Are you receiving any other scholarship? <span className="required">*</span></label>
                <div className="radio-group">
                  {['Yes', 'No'].map(v => (
                    <label key={v} className="radio-label">
                      <input type="radio" name="otherScholarship" value={v} checked={formData.otherScholarship === v} onChange={handleInputChange} required />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              {formData.otherScholarship === 'Yes' && (
                <div className="form-group fade-in mt-2">
                  <label className="form-label">Scholarship Name / Details <span className="required">*</span></label>
                  <input type="text" name="otherScholarshipDetails" className="form-input" placeholder="Name and amount of the other scholarship" value={formData.otherScholarshipDetails} onChange={handleInputChange} required />
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Academic Information ── */}
          {step === 4 && (
            <div className="wizard-step fade-in">
              <h3>Academic Information</h3>
              <p className="step-desc">Provide your NEET details and college admission information.</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">NEET Roll Number <span className="required">*</span></label>
                  <input type="text" name="neetRollNumber" className="form-input" value={formData.neetRollNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">NEET Rank <span className="required">*</span></label>
                  <input type="number" name="neetRank" className="form-input" min="1" placeholder="e.g. 12500" value={formData.neetRank} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Medical College where Admission is Granted <span className="required">*</span></label>
                <select name="collegeName" className="form-input" value={formData.collegeName} onChange={handleInputChange} required>
                  <option value="">Select Medical College</option>
                  <option value="G.S. Medical College">G.S. Medical College</option>
                  <option value="Grand Medical College">Grand Medical College</option>
                  <option value="Sion Hospital Medical College">Sion Hospital Medical College</option>
                  <option value="Nair Hospital College">Nair Hospital College</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {formData.collegeName === 'Other' && (
                <div className="form-group fade-in mt-2">
                  <label className="form-label">Specify College Name <span className="required">*</span></label>
                  <input type="text" name="otherCollegeName" className="form-input" placeholder="Enter full college name" value={formData.otherCollegeName} onChange={handleInputChange} required />
                </div>
              )}

              <div className="form-group mt-4">
                <label className="form-label">Why should the Trust offer you this scholarship? <span className="required">*</span></label>
                <textarea name="reasonForScholarship" className="form-input" rows="5"
                  placeholder="Briefly explain your financial need, academic merit, and future goals in medicine."
                  value={formData.reasonForScholarship} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {/* ── Step 5: Document Uploads ── */}
          {step === 5 && (
            <div className="wizard-step fade-in">
              <h3>Required Documents</h3>
              <p className="text-secondary mb-4">Please upload clear scanned copies of original documents. Maximum file size: <strong>2 MB</strong> per file.</p>

              <div className="upload-section-label">Identity Documents</div>
              <UploadZone docKey="aadhaarCard"    refObj={aadhaarRef}      title="Aadhaar Card *"           subtitle="Front and back of your Aadhaar card (PDF/JPG)" />
              <UploadZone docKey="panCard"        refObj={panRef}          title="PAN Card"                  subtitle="Your personal PAN card (optional)" />
              <UploadZone docKey="wardsPanCard"   refObj={wardsPanRef}     title="Ward's / Parent's PAN Card" subtitle="Parent or guardian's PAN card (optional)" />

              <div className="upload-section-label">Academic Documents</div>
              <UploadZone docKey="admissionLetter"     refObj={admissionRef}    title="Medical College Admission Letter *" />
              <UploadZone docKey="twelfthMarksheet"    refObj={twelfthRef}      title="12th Marksheet *" />
              <UploadZone docKey="neetScore"           refObj={neetRef}         title="NEET Scorecard *" />
              <UploadZone docKey="academicAchievements" refObj={achievementsRef} title="Academic Achievements *" subtitle="Certificates, prizes, or other achievements (PDF/JPG)" />

              <div className="upload-section-label">Financial Documents</div>
              <UploadZone docKey="incomeCertificate" refObj={incomeRef} title="Family Income Certificate *" icon={IndianRupee} />

              <div className="upload-section-label">Statement of Purpose</div>
              <UploadZone docKey="writeupDocument" refObj={writeupRef} title="Statement of Purpose *"
                subtitle="A written statement explaining why you deserve this scholarship (PDF/DOC)"
                accept=".pdf,.doc,.docx" />
            </div>
          )}

          {/* ── Step 6: Success ── */}
          {step === 6 && (
            <div className="step-content text-center py-8">
              <div className="text-success mb-4" style={{ fontSize: '4rem' }}>✓</div>
              <h3>Application Submitted!</h3>
              <p className="text-secondary mt-2">{successMessage}</p>
              <button type="button" className="btn btn-outline mt-6" onClick={() => navigate('/')}>Return to Home</button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="form-actions mt-6">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  Previous
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button type="submit" className="btn btn-primary">
                  Next Step →
                </button>
              ) : (
                <button type="submit" className="btn btn-cta" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Application'}
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

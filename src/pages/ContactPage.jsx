import React, { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">We are here to assist you with any inquiries regarding the scholarship</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          
          <div className="contact-info-panel">
            <h2>Get in Touch</h2>
            <p className="intro-text">
              If you have any questions about the Vasudeo Korgaonkar Trust Scholarship, 
              eligibility, or the application process, please reach out to us.
            </p>

            <div className="info-block">
              <div className="info-icon">
                <MapPin size={22} />
              </div>
              <div className="info-content">
                <h3>Registered Office</h3>
                <p>Flat 87, E Building Woodland apt,<br/>
                Gandhi Bhavan Road, Kothrud,<br/>
                Pune City, Pune,<br/>
                Maharashtra - 411038</p>
              </div>
            </div>

            <div className="info-block">
              <div className="info-icon">
                <Mail size={22} />
              </div>
              <div className="info-content">
                <h3>Email Address</h3>
                <p><a href="mailto:admin@vbktrust.org">admin@vbktrust.org</a></p>
              </div>
            </div>

            <div className="info-block">
              <div className="info-icon">
                <Phone size={22} />
              </div>
              <div className="info-content">
                <h3>Phone</h3>
                <p>Available during regular office hours.</p>
              </div>
            </div>
          </div>

          <div className="contact-form-panel card">
            <h2 style={{color: 'var(--primary-color)'}}>Send a Message</h2>
            <p className="form-subtitle">Fill out the form and we'll get back to you shortly.</p>
            
            {submitted ? (
              <div className="contact-success">
                <div className="success-icon">
                  <CheckCircle size={40} />
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
                <button className="btn btn-outline" onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows="5" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
                </div>

                <button type="submit" className="btn-send">Send Message</button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;

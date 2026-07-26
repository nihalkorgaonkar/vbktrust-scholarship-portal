import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, HeartHandshake, BookOpen } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">Empowering the Next Generation of Medical Professionals</h1>
          <p className="hero-subtitle">
            The Vasudeo Korgaonkar Trust provides exclusive financial scholarships to deserving MBBS students, ensuring that financial constraints never stand in the way of a medical calling.
          </p>
          <div className="hero-actions">
            <button className="btn btn-cta btn-lg" onClick={() => navigate('/register')}>
              Apply for Scholarship
            </button>
            <button className="btn btn-outline btn-lg" style={{backgroundColor: 'white'}} onClick={() => {
              document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features bg-light">
        <div className="container">
          <h2 className="section-title text-center">Our Commitment</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon"><GraduationCap size={32} /></div>
              <h3>MBBS Focus</h3>
              <p>We exclusively fund students pursuing an MBBS degree, addressing the high costs of medical education.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon"><HeartHandshake size={32} /></div>
              <h3>Empathetic Support</h3>
              <p>We understand the dedication required for medicine and strive to make the financial process as seamless as possible.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon"><BookOpen size={32} /></div>
              <h3>Merit & Need Based</h3>
              <p>Scholarships are awarded based on a holistic review of academic merit and financial need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container about-content">
          <div className="about-image-placeholder">
            <div className="placeholder-text">Campus / Medical Students Imagery</div>
          </div>
          <div className="about-text">
            <h2 className="section-title">The Legacy of Vasudeo Korgaonkar</h2>
            <p>
              The Vasudeo Korgaonkar Trust was established with a singular, noble vision: to ensure that the brightest minds have the opportunity to heal the world, regardless of their financial background.
            </p>
            <p>
              Recognizing the immense societal value of doctors and the often prohibitive costs of an MBBS education, the Trust dedicates its resources entirely to funding medical students. We believe that investing in a medical student today is an investment in the health and well-being of countless communities tomorrow.
            </p>
            <button className="btn btn-primary mt-4">Read Full History</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

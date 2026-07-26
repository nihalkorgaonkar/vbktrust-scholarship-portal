import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, HeartHandshake, BookOpen } from 'lucide-react';
import './LandingPage.css';

import founderImg from '../assets/founder.png';

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
          <div className="about-image-wrapper">
            <img src={founderImg} alt="Vasudeo Balkrishna Korgaonkar" className="about-image" />
          </div>
          <div className="about-text">
            <h2 className="section-title">Dedicated to Vasudeo Korgaonkar</h2>
            <p>
              <strong>Vasudeo Balkrishna Korgaonkar (1901-1972)</strong> was a dedicated ex-municipal corporator, freedom fighter, and Congressman who truly loved his country. He served as the Chairman of the Improvements Committee and held the esteemed government post of Justice of Peace (Addhikar).
            </p>
            <p>
              During the British era, he fought courageously for the nation's independence, even serving time unfairly in Nashik Jail. An extremely disciplined and principled social worker, he fought for his country until the end. 
            </p>
            <p>
              His commitment to upliftment extended to his own family, as he helped the entire Korgaonkar ancestry secure education and occupation in Mumbai. The Vasudeo Korgaonkar Trust carries forward his noble legacy by ensuring the brightest minds have the opportunity to heal the world, regardless of their financial background.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

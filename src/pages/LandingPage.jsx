import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, HeartHandshake, BookOpen, TreePine, Eye } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <p className="hero-welcome">Welcome To the</p>
          <h1 className="hero-title">Vasudeo Balkrishna Korgaonkar Trust</h1>
          <p className="hero-sanskrit">बहुजन हिताय बहुजन सुखाय</p>
          <p className="hero-subtitle">In the interest and wellbeing of all</p>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/images/image1.jpg" alt="Tree plantation" />
              <p className="gallery-caption">Greening India</p>
            </div>
            <div className="gallery-item">
              <img src="/images/cradle.jpg" alt="Marathi baby in cradle" />
              <p className="gallery-caption">Promoting Marathi Language</p>
            </div>
            <div className="gallery-item">
              <img src="/images/disability.jpg" alt="Helping the blind and disabled" />
              <p className="gallery-caption">Helping physically handicapped</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title text-center">About Us</h2>

          <div className="about-block">
            <div className="about-block-text">
              <h3>Our History</h3>
              <p>
                This Trust was set up in January of 2025. Before this, since 2016, the promotor of this trust was doing the charitable activities of the Trust as a private individual in memory of his late brother, Dr. Subhash Korgaonkar, alumni of the G.S. Medical college, Mumbai. The name of the Trust is in the memory of promotor's late father, a social activist and a freedom fighter.
              </p>
              <p>
                We dedicate our work to all those freedom fighters, countless in numbers, who selflessly fought for India's Independence from British colonial rule. The name of the Trust is only symbolic — a label for the sacrifice of those wonderful people.
              </p>
            </div>
            <div className="about-block-image">
              <img src="/images/image2.jpg" alt="Doctors treating patients" />
            </div>
          </div>

          <div className="about-block reverse">
            <div className="about-block-text">
              <h3>Our Activities</h3>
              <ul className="activities-list">
                <li><strong>Medical Sponsorship:</strong> To sponsor open category medical students from financially poor families based on merit alone, in memory of Dr Subhash Korgaonkar.</li>
                <li><strong>Environmental & Cultural:</strong> To promote Marathi Language and plant trees in memory of Shri Ravindra Korgaonkar, brother of the promoter. The planting of the trees will also be in loving memory of Shri Vasudeo Balkrishna Korgaonkar, his late brothers and their wives.</li>
                <li><strong>Disability Support:</strong> To Support the activities related to blind and other disabled persons in the fond memory of late Nalini Vasudeo Korgaonkar, promoter's blind sister.</li>
              </ul>
              <p className="note-text">
                Above is a broad outline and not the exhaustive list of the Trust activities.
              </p>
            </div>
            <div className="about-block-image">
              <img src="/images/image1.jpg" alt="Tree plantation" />
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Info Section */}
      <section className="scholarship-section">
        <div className="container">
          <h2 className="section-title text-center">Empowering the brightest medical students in India</h2>
          
          <div className="empowering-content" style={{maxWidth: '700px', margin: '0 auto', textAlign: 'left'}}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>VBK TRUST</h3>
            <ul className="activities-list" style={{marginBottom: '2rem'}}>
              <li>Empowering the brightest medical students in India</li>
              <li>Greening India</li>
              <li>Promoting Marathi Language</li>
              <li>Helping physically handicapped</li>
            </ul>
            
            <p className="note-text" style={{fontWeight: 'bold', color: 'var(--secondary-text)', marginBottom: '2rem', textAlign: 'center'}}>
              Before applying, candidates are expected to understand the ethos of the Trust. So carefully study the information about the Trust.
            </p>
            
            <div className="text-center">
              <button className="btn btn-cta btn-lg" onClick={() => navigate('/register')}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

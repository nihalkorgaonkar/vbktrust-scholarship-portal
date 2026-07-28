import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  const trustees = [
    { name: 'Mr. Sharad Vasudeo Korgaonkar', role: 'Chairman' },
    { name: 'Mrs. Archana Sachin Patne', role: 'Secretary' },
    { name: 'Mrs. Ashwini Amol Harmalkar', role: 'Treasurer' },
    { name: 'Mr. Bhagyesh Shripad Mane', role: 'Trustee' }
  ];

  const advisors = [
    { name: 'Dr. Dhangauri Shenvi', role: 'Advisor' },
    { name: 'Mr. Avinash Ravindra Korgaonkar', role: 'Advisor' },
    { name: 'Mr. Mohan Russell Korgaonkar', role: 'Advisor' }
  ];

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1 className="hero-title">About the Trust</h1>
          <p className="hero-subtitle">Empowering the next generation of medical professionals</p>
        </div>
      </div>

      <div className="container">
        <section className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-card">
            <p className="section-text">
              The Vasudeo Korgaonkar Trust was established with a singular vision: to ensure that 
              talented and driven students are not held back from their medical dreams due to 
              financial constraints. By providing fully-funded MBBS scholarships, we aim to nurture 
              exceptional individuals who demonstrate academic brilliance, leadership, and a 
              deep-rooted commitment to public health.
            </p>
          </div>
          
          <h2 className="section-title" style={{marginTop: '4rem'}}>Our Impact & History</h2>
          <div className="mission-card">
            <p className="section-text">
              Since our inception, we have been deeply committed to educational and social upliftment. 
              <strong> We have successfully supported 10 medical students to date</strong>, helping them achieve 
              their dreams of becoming doctors. Additionally, our trust actively works to <strong>support 
              visually impaired students</strong> with educational resources, and we are committed to 
              <strong> organizing tree plantation drives</strong> to promote environmental sustainability.
            </p>
          </div>
        </section>
      </div>

      <section className="board-section">
        <div className="container">
          <h2 className="section-title">Board of Trustees</h2>
          <div className="members-grid">
            {trustees.map((member, index) => (
              <div key={index} className="member-card">
                <div className="member-avatar">
                  {member.name.split(' ')[0].charAt(0)}
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="advisors-section">
          <h2 className="section-title">Advisory Board</h2>
          <div className="members-grid">
            {advisors.map((member, index) => (
              <div key={index} className="member-card">
                <div className="member-avatar advisor-avatar">
                  {member.name.split(' ')[0].charAt(0)}
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

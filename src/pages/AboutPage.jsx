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
          <div className="about-content-wrapper">
            <div className="about-text-content">
              <h2 className="section-title" style={{textAlign: 'left'}}>Our History</h2>
              <div className="mission-card">
                <p className="section-text">
                  This Trust was set up in January of 2025. Before this, since 2016, the promotor of this trust was doing the charitable activities of the Trust as a private individual in memory of his late brother, Dr. Subhash Korgaonkar, alumni of the G.S. Medical college, Mumbai. The name of the Trust is in the memory of promotor's late father, a social activist and a freedom fighter.
                </p>
                <p className="section-text" style={{marginTop: '1rem'}}>
                  We dedicate our work to all those freedom fighters, countless in numbers, who selflessly fought for India's Independence from British colonial rule. The name of the Trust is only symbolic - a label for the sacrifice of those wonderful people.
                </p>
              </div>
            </div>
            <div className="about-image-content">
              <img src="/images/image2.jpg" alt="Doctors treating patients" className="about-image" />
            </div>
          </div>
          
          <div className="about-content-wrapper reverse" style={{marginTop: '4rem'}}>
            <div className="about-text-content">
              <h2 className="section-title" style={{textAlign: 'left'}}>Our Activities</h2>
              <div className="mission-card">
                <ul className="activities-list">
                  <li><strong>Medical Sponsorship:</strong> To sponsor open category medical students from financially poor families based on merit alone, in memory of Dr Subhash Korgaonkar.</li>
                  <li><strong>Environmental & Cultural:</strong> To promote Marathi Language and plant trees in memory of Shri Ravindra Korgaonkar, brother of the promoter. The planting of the trees will also be in loving memory of Shri Vasudeo Balkrishna Korgaonkar, his late brothers and their wives.</li>
                  <li><strong>Disability Support:</strong> To Support the activities related to blind and other disabled persons in the fond memory of late Nalini Vasudeo Korgaonkar, promoter's blind sister.</li>
                </ul>
                <p className="section-text" style={{marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--secondary-text)'}}>
                  Above is a broad outline and not the exhaustive list of the Trust activities.
                </p>
              </div>
            </div>
            <div className="about-image-content">
              <img src="/images/image1.jpg" alt="Tree plantation" className="about-image" />
            </div>
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

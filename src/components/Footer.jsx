import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-mega">
      <div className="container footer-grid">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="logo-vk" style={{color: 'white', fontWeight: 800, fontSize: '1.5rem'}}>VBK</span>
            <span className="logo-trust" style={{color: 'var(--accent-color)', fontWeight: 800, fontSize: '1.5rem', marginLeft: '0.2rem'}}>TRUST</span>
          </div>
          <p className="footer-description">
            Empowering the brightest medical minds in India through fully-funded MBBS scholarships. Established to support those who demonstrate academic brilliance and a commitment to public health.
          </p>
        </div>

        <div className="footer-col links-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/register">Apply for Scholarship</Link></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h3>Contact Us</h3>
          <ul className="contact-info">
            <li>
              <Mail size={18} />
              <a href="mailto:vbktrustorg@gmail.com">vbktrustorg@gmail.com</a>
            </li>
            <li>
              <ExternalLink size={18} />
              <a href="http://vbktrust.org" target="_blank" rel="noreferrer">vbktrust.org</a>
            </li>
            <li className="address-item">
              <MapPin size={24} style={{flexShrink: 0, marginTop: '2px'}} />
              <span>
                Flat 87, E Building Woodland apt,<br/>
                Gandhi Bhavan Road, Kothrud,<br/>
                Pune City, Pune,<br/>
                Maharashtra - 411038
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container flex justify-between items-center bottom-flex">
          <p>&copy; {new Date().getFullYear()} Vasudeo Korgaonkar Trust. All rights reserved.</p>
          <div className="footer-legal">
            <span>The Trust does not impose any fees on students to apply.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

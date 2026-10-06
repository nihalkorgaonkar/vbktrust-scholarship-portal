import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between navbar-inner">
        
        {/* Logo */}
        <Link to="/" className="navbar-logo flex items-center gap-4">
          <div className="logo-placeholder">
            {/* The user mentioned referencing the file for branding, 
                so we use the text with the specific colors */}
            <span className="logo-vk">VBK</span>
            <span className="logo-trust">TRUST</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links hidden-mobile">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          <Link to="/student-records" className="nav-link">Student Records</Link>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions hidden-mobile flex items-center gap-4">
          <Link to="/admin" className="nav-link" style={{fontSize: '0.85rem'}}>Admin</Link>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle hidden-desktop" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          <Link to="/about" className="mobile-link" onClick={toggleMenu}>About Us</Link>
          <Link to="/contact" className="mobile-link" onClick={toggleMenu}>Contact Us</Link>
          <Link to="/student-records" className="mobile-link" onClick={toggleMenu}>Student Records</Link>
          <div className="mobile-divider"></div>
          <Link to="/admin" className="mobile-link" onClick={toggleMenu}>Admin</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

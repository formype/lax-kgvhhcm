import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="logo">
          <img src="/logo.png" alt="Logo Trường THCS Lê Anh Xuân" className="school-logo-img" />
          <span>Trường THCS Lê Anh Xuân</span>
        </a>
        
        <div className="nav-links">
          <a href="#home">Trang chủ</a>
          <a href="#timeline">Tiểu sử</a>
          <a href="#quotes">Lời dạy</a>
          <a href="#gallery">Tư liệu</a>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</a>
        <a href="#timeline" onClick={() => setIsMobileMenuOpen(false)}>Tiểu sử</a>
        <a href="#quotes" onClick={() => setIsMobileMenuOpen(false)}>Lời dạy</a>
        <a href="#gallery" onClick={() => setIsMobileMenuOpen(false)}>Tư liệu</a>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionLink = (e, id) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      e.preventDefault();
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo Trường THCS Lê Anh Xuân" className="school-logo-img" />
          <span>Trường THCS Lê Anh Xuân</span>
        </Link>

        <div className="nav-links">
          <a href="#home" onClick={(e) => handleSectionLink(e, 'home')}>Trang chủ</a>
          <a href="#timeline" onClick={(e) => handleSectionLink(e, 'timeline')}>Tiểu sử</a>
          <a href="#quotes" onClick={(e) => handleSectionLink(e, 'quotes')}>Lời dạy</a>
          <a href="#gallery" onClick={(e) => handleSectionLink(e, 'gallery')}>Tư liệu</a>
          <Link to="/goc-sang-tao" className={location.pathname === '/goc-sang-tao' ? 'active' : ''}>
            Góc sáng tạo
          </Link>
          <Link to="/khao-sat" className={location.pathname === '/khao-sat' ? 'active' : ''}>
            Khảo sát
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Mở menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" onClick={(e) => handleSectionLink(e, 'home')}>Trang chủ</a>
        <a href="#timeline" onClick={(e) => handleSectionLink(e, 'timeline')}>Tiểu sử</a>
        <a href="#quotes" onClick={(e) => handleSectionLink(e, 'quotes')}>Lời dạy</a>
        <a href="#gallery" onClick={(e) => handleSectionLink(e, 'gallery')}>Tư liệu</a>
        <Link to="/goc-sang-tao" onClick={() => setIsMobileMenuOpen(false)}>Góc sáng tạo</Link>
        <Link to="/khao-sat" onClick={() => setIsMobileMenuOpen(false)}>Khảo sát</Link>
      </div>
    </nav>
  );
};

export default Navbar;

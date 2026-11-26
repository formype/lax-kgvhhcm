import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePage } from '../context/PageContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activePage, navigateToPage } = usePage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeSection = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigateToPage('home', id);
  };

  const handlePageSelect = (e, page) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigateToPage(page);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="/" className="logo" onClick={(e) => handleHomeSection(e, 'home')}>
          <img src="/logo.png" alt="Logo Trường THCS Lê Anh Xuân" className="school-logo-img" />
          <span>Trường THCS Lê Anh Xuân</span>
        </a>

        <div className="nav-links">
          <a href="#home" onClick={(e) => handleHomeSection(e, 'home')}>Trang chủ</a>
          <a href="#timeline" onClick={(e) => handleHomeSection(e, 'timeline')}>Tiểu sử</a>
          <a href="#quotes" onClick={(e) => handleHomeSection(e, 'quotes')}>Lời dạy</a>
          <a href="#gallery" onClick={(e) => handleHomeSection(e, 'gallery')}>Tư liệu</a>
          <a
            href="#goc-sang-tao"
            className={activePage === 'creative' ? 'active' : ''}
            onClick={(e) => handlePageSelect(e, 'creative')}
          >
            Góc sáng tạo
          </a>
          <a
            href="#khao-sat"
            className={activePage === 'survey' ? 'active' : ''}
            onClick={(e) => handlePageSelect(e, 'survey')}
          >
            Khảo sát
          </a>
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
        <a href="#home" onClick={(e) => handleHomeSection(e, 'home')}>Trang chủ</a>
        <a href="#timeline" onClick={(e) => handleHomeSection(e, 'timeline')}>Tiểu sử</a>
        <a href="#quotes" onClick={(e) => handleHomeSection(e, 'quotes')}>Lời dạy</a>
        <a href="#gallery" onClick={(e) => handleHomeSection(e, 'gallery')}>Tư liệu</a>
        <a href="#goc-sang-tao" onClick={(e) => handlePageSelect(e, 'creative')}>Góc sáng tạo</a>
        <a href="#khao-sat" onClick={(e) => handlePageSelect(e, 'survey')}>Khảo sát</a>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionLink = (e, id) => {
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
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-school-brand">
              <img src="/logo.png" alt="Logo Trường THCS Lê Anh Xuân" className="footer-school-logo" />
              <span className="footer-school-name">Trường THCS Lê Anh Xuân</span>
            </div>
            <h3>KHÔNG GIAN VĂN HÓA<br /><span className="text-gold">HỒ CHÍ MINH</span></h3>
          </div>

          <div className="footer-links">
            <h4>Liên kết</h4>
            <ul>
              <li><a href="#home" onClick={(e) => handleSectionLink(e, 'home')}>Trang chủ</a></li>
              <li><a href="#timeline" onClick={(e) => handleSectionLink(e, 'timeline')}>Tiểu sử</a></li>
              <li><a href="#quotes" onClick={(e) => handleSectionLink(e, 'quotes')}>Lời dạy</a></li>
              <li><a href="#gallery" onClick={(e) => handleSectionLink(e, 'gallery')}>Tư liệu</a></li>
              <li><Link to="/khao-sat">Khảo sát</Link></li>
            </ul>
          </div>

          <div className="footer-info">
            <h4>Thông tin</h4>
            <p>Dự án Không gian văn hóa Hồ Chí Minh trên nền tảng số.</p>
            <p>Mọi chi tiết xin liên hệ tvhnhan.laxq11@hcm.edu.vn</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 THCS Lê Anh Xuân. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e) => {
    const rx = (0.5 - e.clientY / window.innerHeight) * 6;
    const ry = (e.clientX / window.innerWidth - 0.5) * 6;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <section
      id="home"
      className="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container hero-container" style={{ perspective: '1200px' }}>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.25s ease-out'
          }}
        >
          <motion.h2
            className="hero-subtitle text-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            style={{ transform: 'translateZ(24px)' }}
          >
            Tự hào dân tộc Việt Nam
          </motion.h2>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            style={{ transform: 'translateZ(42px)' }}
          >
            KHÔNG GIAN VĂN HÓA
            <span className="text-gold">HỒ CHÍ MINH</span>
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            style={{ transform: 'translateZ(26px)' }}
          >
            "Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang để sánh vai với các cường quốc năm châu được hay không, chính là nhờ một phần lớn ở công học tập của các em."
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            style={{ transform: 'translateZ(34px)' }}
          >
            <a href="#timeline" className="btn btn-gold">Khám phá hành trình</a>
            <a href="#gallery" className="btn">Xem tư liệu</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

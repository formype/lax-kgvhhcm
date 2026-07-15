import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import './References.css';

const references = [
  {
    title: "Hồ Chí Minh Toàn tập, NXB Chính trị quốc gia Sự thật.",
    link: "https://stbook.vn/"
  },
  {
    title: "Hồ Chí Minh - Biên niên tiểu sử, NXB Chính trị quốc gia Sự thật.",
    link: "https://nxbchinhtriquocgia.vn/"
  },
  {
    title: "SGK Lịch sử và Địa lí 8, 9 (Chương trình GDPT 2018), NXB Giáo dục Việt Nam.",
    link: "https://taphuan.nxbgd.vn/"
  },
  {
    title: "Bảo tàng Hồ Chí Minh - Thư viện tài liệu",
    link: "https://baotanghochiminh.vn/file-library.htm"
  },
  {
    title: "Cổng Thông tin điện tử Chính phủ",
    link: "https://chinhphu.vn/"
  }
];

const References = () => {
  return (
    <section id="references" className="section references-section">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Tài liệu tham khảo về Bác
        </motion.h2>
        
        <div className="references-list">
          {references.map((ref, index) => (
            <motion.a 
              href={ref.link}
              target="_blank"
              rel="noopener noreferrer"
              className="reference-item glass"
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="ref-icon">
                <BookOpen size={24} />
              </div>
              <div className="ref-content">
                <span className="ref-number">{index + 1}.</span>
                <h3 className="ref-title">{ref.title}</h3>
              </div>
              <div className="ref-link-icon">
                <ExternalLink size={20} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default References;

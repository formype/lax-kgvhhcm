import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Guestbook from './Guestbook';
import './Gallery.css';

const quotes = [
  {
    text: "Không có gì quý hơn độc lập, tự do.",
    source: "Lời kêu gọi đồng bào và chiến sĩ cả nước, 1966"
  },
  {
    text: "Nước Việt Nam là một, dân tộc Việt Nam là một. Sông có thể cạn, núi có thể mòn, song chân lý đó không bao giờ thay đổi.",
    source: "Thư gửi đồng bào Nam Bộ, 1946"
  }
];

const galleryItems = [
  {
    title: "Lời kêu gọi toàn quốc Kháng chiến",
    img: "/loi-keu-goi.jpg",
    link: "https://www.youtube.com/watch?app=desktop&v=RyLurrERAhs&t"
  },
  {
    title: "Bản Tuyên ngôn Độc lập",
    img: "/tuyen-ngon-doc-lap.png",
    link: "https://www.youtube.com/watch?v=xRKUB3fUTJM"
  },
  {
    title: "Tác phẩm Lịch Sử nước ta - Hồ Chí Minh",
    img: "/lich-su-nuoc-ta.jpg",
    link: "https://youtu.be/ANnN3LqQxlY?si=cEJxDS20QTpudVlN"
  },
  {
    title: "Di chúc của Chủ tịch Hồ Chí Minh",
    img: "/di-chuc.jpg",
    link: "https://www.youtube.com/watch?v=4uVtVw639JQ"
  },
  {
    title: "Tác phẩm Nhật ký trong tù - Hồ Chí Minh",
    img: "/nhat-ky-trong-tu.jpg",
    link: "https://www.youtube.com/watch?v=raXUIDqGdH0"
  },
  {
    title: "Tác phẩm Đường Kách mệnh - Hồ Chí Minh",
    img: "/duong-kach-menh.jpg",
    link: "https://www.youtube.com/watch?v=HNt9eg-98qE"
  }
];

const Gallery = () => {
  return (
    <>
      {/* Quotes Section */}
      <section id="quotes" className="section quotes-section">
        <div className="container">
          <div className="quotes-grid">
            {quotes.map((quote, index) => (
              <motion.div 
                className="quote-card glass"
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Quote className="quote-icon" size={40} />
                <p className="quote-text">{quote.text}</p>
                <p className="quote-source">- {quote.source} -</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Guestbook />

      {/* Gallery Section */}
      <section id="gallery" className="section gallery-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Những tác phẩm của Chủ tịch Hồ Chí Minh
          </motion.h2>
          
          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <motion.div 
                className="gallery-item glass"
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => {
                  if (item.link && item.link !== "#") {
                    window.open(item.link, '_blank');
                  }
                }}
                style={{ cursor: item.link !== "#" ? 'pointer' : 'default' }}
              >
                <div className="gallery-img-container">
                  {item.img ? (
                    <>
                      <img src={item.img} alt={item.title} className="gallery-img" />
                      {item.link !== "#" && (
                        <div className="play-overlay">
                          <div className="play-button">▶</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="gallery-img-placeholder">
                      <span>{item.title}</span>
                    </div>
                  )}
                </div>
                {item.img && (
                  <div className="gallery-info">
                    <h3>{item.title}</h3>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;

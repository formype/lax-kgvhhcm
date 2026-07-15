import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Ship, Flag, Star, ChevronDown, ChevronUp, Globe, MapPin, FileText, Shield, Swords, Heart, Award } from 'lucide-react';
import './Timeline.css';

const timelineData = [
  {
    year: '1890',
    title: 'Năm sinh',
    desc: 'Chủ tịch Hồ Chí Minh (lúc nhỏ tên là Nguyễn Sinh Cung, khi đi học là Nguyễn Tất Thành, trong nhiều năm hoạt động cách mạng lấy tên là Nguyễn Ái Quốc và nhiều bí danh, bút danh khác) sinh ngày 19/5/1890 ở xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An; mất ngày 2/9/1969 tại Hà Nội.\nChủ tịch Hồ Chí Minh sinh ra trong một gia đình nhà nho yêu nước, lớn lên ở một địa phương có truyền thống anh dũng chống giặc ngoại xâm. Sống trong hoàn cảnh đất nước chìm dưới ách đô hộ của thực dân Pháp, thời niên thiếu và thanh niên của mình, Hồ Chí Minh đã chứng kiến nỗi khổ cực của đồng bào và những phong trào đấu tranh chống thực dân, Hồ Chí Minh sớm có chí đuổi thực dân, giành độc lập cho đất nước, đem lại tự do, hạnh phúc cho đồng bào.',
    icon: <BookOpen />
  },
  {
    year: '1911',
    title: 'Ra đi tìm đường cứu nước',
    desc: 'Với ý chí và quyết tâm đánh đuổi thực dân, giành độc lập cho đất nước, đem lại tự do, hạnh phúc cho đồng bào, tháng 6/1911, Hồ Chí Minh đã rời Tổ quốc đi sang phương Tây để tìm con đường giải phóng dân tộc.\nNgày 03/6/1911, Nguyễn Tất Thành nhận thẻ nhân viên lên con tàu Amiral Latouche Tréville với cái tên Văn Ba. Hai ngày sau, 05/6/1911 con tàu rời cảng Nhà Rồng đến Pháp.\nTừ năm 1912 - 1917, dưới cái tên Nguyễn Tất Thành, Người đến nhiều nước ở châu Á, châu Âu, châu Mỹ, châu Phi, sống hoà mình với nhân dân lao động. Qua thực tiễn, Người sớm nhận thức được cuộc đấu tranh giải phóng dân tộc của nhân dân Việt Nam là một bộ phận trong cuộc đấu tranh chung của nhân dân thế giới.',
    icon: <Ship />
  },
  {
    year: '1920',
    title: 'Tham gia sáng lập Đảng Cộng sản Pháp',
    desc: 'Năm 1919, lấy tên là Nguyễn Ái Quốc, thay mặt những người Việt Nam yêu nước tại Pháp, Hồ Chí Minh đã gửi tới Hội nghị Versailles bản yêu sách đòi quyền tự do cho nhân dân Việt Nam.\nDưới ảnh hưởng của Cách mạng Tháng Mười Nga năm 1917 và Luận cương của Lênin, tháng 12/1920, Nguyễn Ái Quốc tham dự Đại hội lần thứ XVIII Đảng Xã hội Pháp và bỏ phiếu tán thành Đảng gia nhập Quốc tế III (Quốc tế Cộng sản), trở thành một trong những người sáng lập Đảng Cộng sản Pháp.\nTừ một người yêu nước trở thành một người cộng sản, Hồ Chí Minh khẳng định: "Muốn cứu nước và giải phóng dân tộc, không có con đường nào khác con đường cách mạng vô sản".',
    icon: <Globe />
  },
  {
    year: '1930',
    title: 'Thành lập Đảng Cộng sản Việt Nam',
    desc: 'Năm 1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên, trực tiếp mở lớp huấn luyện đào tạo cán bộ cách mạng, ra tuần báo "Thanh niên", chuẩn bị cho việc thành lập Đảng Cộng sản Việt Nam.\nTừ tháng 7/1928 đến tháng 11/1929, Nguyễn Ái Quốc hoạt động trong phong trào Việt kiều yêu nước ở Thái Lan, tiếp tục chuẩn bị cho sự ra đời của Đảng.\nTháng 2/1930, Nguyễn Ái Quốc chủ trì Hội nghị thành lập Đảng họp tại Cửu Long, Hồng Kông (Trung Quốc). Hội nghị đã thông qua Chính cương vắn tắt, Sách lược vắn tắt, Điều lệ vắn tắt của Đảng Cộng sản Việt Nam, đội tiên phong của giai cấp công nhân và toàn thể dân tộc Việt Nam.',
    icon: <Flag />
  },
  {
    year: '1941',
    title: 'Về nước lãnh đạo cách mạng',
    desc: 'Từ năm 1934 đến năm 1938, Nguyễn Ái Quốc nghiên cứu tại Viện Nghiên cứu các vấn đề dân tộc thuộc địa tại Mátxcơva (Liên Xô). Kiên trì con đường đã xác định cho cách mạng Việt Nam, Người tiếp tục theo dõi, chỉ đạo phong trào cách mạng trong nước.\nTháng 10/1938, Người rời Liên Xô sang Trung Quốc, bắt liên lạc với tổ chức Đảng chuẩn bị về nước.\nNgày 28/1/1941, Nguyễn Ái Quốc về nước sau hơn 30 năm xa Tổ Quốc, Người đã sống và làm việc tại Pác Bó, tỉnh Cao Bằng. Tháng 5/1941, Người triệu tập Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng, quyết định đường lối đánh đuổi Pháp, Nhật, thành lập Mặt trận Việt Minh, trực tiếp lãnh đạo phong trào cách mạng giải phóng dân tộc.',
    icon: <MapPin />
  },
  {
    year: '1942',
    title: 'Bị bắt giam tại Trung Quốc',
    desc: 'Tháng 8/1942, lấy tên là Hồ Chí Minh, Người sang Trung Quốc bắt liên lạc với Đồng minh cùng phối hợp hành động chống phát xít. Tuy nhiên, Người bị chính quyền địa phương của Tưởng Giới Thạch bắt giam trong các nhà lao của tỉnh Quảng Tây.\nTrong thời gian bị giam giữ gian khổ hơn một năm (từ tháng 8/1942 đến tháng 9/1943), Người đã sáng tác tập thơ "Nhật ký trong tù" (Ngục trung nhật ký) nổi tiếng. Với hơn 100 bài thơ chữ Hán, tác phẩm thể hiện tinh thần lạc quan, phong thái ung dung và ý chí kiên cường của người chiến sĩ cộng sản vĩ đại.',
    icon: <FileText />
  },
  {
    year: '1944',
    title: 'Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân',
    desc: 'Tháng 9/1944, Hồ Chí Minh được trả tự do và trở về căn cứ cách mạng Cao Bằng.\nĐến ngày 22/12/1944, nhận thấy thời cơ cách mạng đang đến gần, Hồ Chí Minh đã ra chỉ thị thành lập Đội Việt Nam Tuyên truyền Giải phóng quân (tiền thân của Quân đội nhân dân Việt Nam anh hùng ngày nay). Đội quân này dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp đã đóng vai trò nòng cốt, tạo đà cho các cuộc khởi nghĩa vũ trang sau đó.',
    icon: <Shield />
  },
  {
    year: '1945',
    title: 'Đọc bản Tuyên ngôn Độc lập',
    desc: 'Tháng 8/1945, Hồ Chí Minh cùng Trung ương Đảng lãnh đạo nhân dân khởi nghĩa giành chính quyền thắng lợi trong cuộc Cách mạng Tháng Tám lịch sử.\nNgày 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đã dõng dạc đọc bản "Tuyên ngôn độc lập", chính thức tuyên bố thành lập nước Việt Nam Dân chủ Cộng hòa và ra mắt Chính phủ lâm thời do Người làm Chủ tịch kiêm Bộ trưởng Bộ Ngoại giao.\nSau đó, Người đã tổ chức thành công cuộc Tổng tuyển cử tự do trong cả nước, bầu ra Quốc hội và thông qua Hiến pháp dân chủ đầu tiên của Việt Nam.',
    icon: <Star />
  },
  {
    year: '1946',
    title: 'Lời kêu gọi toàn quốc kháng chiến',
    desc: 'Ngày 19/12/1946, trước dã tâm xâm lược nước ta một lần nữa của thực dân Pháp, Chủ tịch Hồ Chí Minh đã ra Lời kêu gọi toàn quốc kháng chiến, thề quyết hy sinh tất cả chứ nhất định không chịu mất nước, không chịu làm nô lệ.\nDưới sự lãnh đạo sáng suốt của Trung ương Đảng và Bác Hồ, cuộc kháng chiến trường kỳ gian khổ của dân tộc ta đã giành được thắng lợi to lớn, kết thúc vẻ vang bằng chiến thắng lịch sử Điện Biên Phủ (7/5/1954) lừng lẫy năm châu, chấn động địa cầu.',
    icon: <Swords />
  },
  {
    year: '1969',
    title: 'Bác Hồ kính yêu qua đời',
    desc: 'Trong giai đoạn chống Mỹ cứu nước, Người luôn là chỗ dựa tinh thần vững chắc cho toàn dân tộc. Năm 1966, Người ra lời kêu gọi lịch sử với chân lý bất hủ: "Không có gì quý hơn độc lập, tự do!".\nNgày 02/9/1969, Chủ tịch Hồ Chí Minh qua đời tại Hà Nội, để lại niềm tiếc thương vô hạn cho toàn Đảng, toàn dân và bạn bè quốc tế.\nTrước lúc đi xa, Người để lại bản Di chúc thiêng liêng, căn dặn những việc Đảng và nhân dân phải làm. Trong đó Người viết: "Điều mong muốn cuối cùng của tôi là Toàn Đảng, toàn dân ta đoàn kết phấn đấu, xây dựng một nước Việt Nam hoà bình, thống nhất, độc lập, dân chủ và giàu mạnh, và góp phần xứng đáng vào sự nghiệp cách mạng thế giới".',
    icon: <Heart />
  },
  {
    year: 'Vị lãnh tụ vĩ đại của dân tộc',
    title: '',
    desc: 'Chủ tịch Hồ Chí Minh là người thầy vĩ đại của cách mạng Việt Nam, lãnh tụ kính yêu của giai cấp công nhân và của cả dân tộc Việt Nam, một chiến sĩ xuất sắc, một nhà hoạt động lỗi lạc của phong trào cộng sản quốc tế và phong trào giải phóng dân tộc. Người đã vận dụng và phát triển sáng tạo chủ nghĩa Mác - Lênin vào điều kiện cụ thể của Việt Nam, sáng lập Đảng Cộng sản Việt Nam, sáng lập Mặt trận dân tộc thống nhất Việt Nam, sáng lập lực lượng vũ trang nhân dân Việt Nam và sáng lập nước Việt Nam Dân chủ Cộng hoà (nay là Cộng hoà Xã hội chủ nghĩa Việt Nam). Người luôn luôn gắn cách mạng Việt Nam với cuộc đấu tranh chung của nhân dân thế giới vì hoà bình, độc lập dân tộc, dân chủ và tiến bộ xã hội. Người là tấm gương đạo đức cao cả, cần, kiệm, liêm, chính, chí công vô tư, vô cùng khiêm tốn, giản dị.',
    icon: <Award />,
    isCenter: true
  }
];

const Timeline = () => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section id="timeline" className="section timeline-section">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Tiểu sử về Chủ tịch <br /> Hồ Chí Minh
        </motion.h2>

        <div className="timeline-container">
          {timelineData.map((item, index) => (
            <motion.div 
              className={`timeline-item ${item.isCenter ? 'center' : (index % 2 === 0 ? 'left' : 'right')}`}
              key={index}
              initial={{ opacity: 0, x: item.isCenter ? 0 : (index % 2 === 0 ? -50 : 50), y: item.isCenter ? 50 : 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div 
                layout
                className="timeline-content glass"
                onClick={() => toggleExpand(index)}
                style={{ cursor: 'pointer' }}
              >
                <motion.div layout className="timeline-icon">
                  {item.icon}
                </motion.div>
                {item.year && <motion.h3 layout className="timeline-year text-gold">{item.year}</motion.h3>}
                {item.title && <motion.h4 layout className="timeline-title">{item.title}</motion.h4>}
                <motion.div layout className="timeline-desc">
                  <div className={expanded[index] ? '' : 'line-clamp-4'}>
                    {item.desc}
                  </div>
                  {item.desc.length > 200 && (
                    <motion.div 
                      layout
                      className="text-gold" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        fontSize: '0.85rem', 
                        marginTop: '15px',
                        fontWeight: '500'
                      }}
                    >
                      {expanded[index] ? 'Thu gọn' : 'Xem thêm'}
                      {expanded[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;

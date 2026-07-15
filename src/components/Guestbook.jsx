import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Guestbook.css';

function Guestbook() {
  const [formData, setFormData] = useState({ name: '', className: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    fetchReflections();
    
    // Set up realtime subscription for new approved reflections
    const subscription = supabase
      .channel('public:reflections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reflections' }, payload => {
        fetchReflections();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchReflections = async () => {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reflections:', error);
    } else {
      setReflections(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'content' && value.length > 5000) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      setError('Vui lòng điền họ tên và cảm nhận.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase
      .from('reflections')
      .insert([
        { 
          name: formData.name, 
          class_name: formData.className, 
          content: formData.content,
          is_approved: false
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      setError('Lỗi hệ thống: ' + error.message);
      console.error(error);
    } else {
      setSubmitSuccess(true);
      setFormData({ name: '', className: '', content: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }
  };

  return (
    <section className="guestbook-section" id="guestbook">
      <div className="guestbook-container">
        <motion.div 
          className="guestbook-header text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Cảm nhận & Lời hứa</h2>
          <p className="guestbook-subtitle">Hãy để lại những dòng cảm xúc hoặc lời hứa của bạn đối với Bác Hồ kính yêu.</p>
        </motion.div>

        <div className="guestbook-content">
          <motion.div 
            className="guestbook-form-card"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitSuccess ? (
              <div className="success-message">
                <CheckCircle size={48} className="success-icon" />
                <h3>Gửi thành công!</h3>
                <p>Cảm ơn bạn đã chia sẻ. Lời nhắn của bạn đã được ghi nhận và đang chờ quản trị viên phê duyệt để hiển thị.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="guestbook-form">
                <div className="form-group">
                  <label htmlFor="name">Họ và tên <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Ngập nhập họ tên của bạn..." 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="className">Lớp (Tùy chọn)</label>
                  <input 
                    type="text" 
                    id="className" 
                    name="className" 
                    value={formData.className} 
                    onChange={handleChange} 
                    placeholder="VD: 9A1 (Dành cho HS THCS Lê Anh Xuân)" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Cảm nhận của bản thân <span className="required">*</span></label>
                  <textarea 
                    id="content" 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange} 
                    placeholder="Hãy viết những suy nghĩ, cảm nhận hoặc lời hứa của bạn..." 
                    rows="6"
                    required
                  ></textarea>
                  <div className="char-count">
                    {formData.content.length} / 5000
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : (
                    <>Gửi cảm nhận <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div 
            className="reflections-list"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3><MessageSquareQuote size={24} /> Lời nhắn gửi</h3>
            
            <div className="reflections-scroll">
              {reflections.length === 0 ? (
                <div className="no-reflections">
                  <p>Chưa có dòng cảm nhận nào. Hãy là người đầu tiên chia sẻ!</p>
                </div>
              ) : (
                reflections.map((ref) => (
                  <div key={ref.id} className="reflection-card">
                    <div className="reflection-header">
                      <div className="reflection-author">
                        <strong>{ref.name}</strong>
                        {ref.class_name && <span className="reflection-class">Lớp {ref.class_name}</span>}
                      </div>
                      <div className="reflection-date">
                        {new Date(ref.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="reflection-body">
                      {ref.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Guestbook;

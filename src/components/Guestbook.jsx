import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, MessageSquareQuote } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import './Guestbook.css';

function formatDate(createdAt) {
  if (!createdAt) return '';
  const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
  return date.toLocaleDateString('vi-VN');
}

function Guestbook() {
  const [formData, setFormData] = useState({ name: '', className: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'reflections'),
      where('is_approved', '==', true),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setReflections(list);
      },
      (err) => {
        console.error('Error fetching reflections:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'content' && value.length > 5000) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedContent = formData.content.trim();
    const trimmedClass = formData.className.trim();

    if (!trimmedName || !trimmedContent) {
      setError('Vui lòng điền họ tên và cảm nhận.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'reflections'), {
        name: trimmedName,
        class_name: trimmedClass || null,
        content: trimmedContent,
        is_approved: false,
        created_at: serverTimestamp()
      });

      setSubmitSuccess(true);
      setFormData({ name: '', className: '', content: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError('Lỗi hệ thống: ' + err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
                    placeholder="Hãy nhập họ và tên của bạn..."
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
                    placeholder="VD: 9/1 (Dành cho học sinh trường THCS Lê Anh Xuân)"
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
                        {formatDate(ref.created_at)}
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

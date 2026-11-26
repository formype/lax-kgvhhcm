import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Upload,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import Ambient3DBackground from '../components/Ambient3DBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../lib/firebase';
import './CreativeCorner.css';

const MAX_IMAGE_MB = 20;
const MAX_VIDEO_MB = 100;

function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function buildRenamedFileName(originalName, userName, role, className) {
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'bin';

  const cleanUser = removeVietnameseTones(userName.trim())
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const cleanRole = role === 'Học sinh' ? 'Hoc_sinh' : 'Giao_vien';
  const cleanClass =
    role === 'Học sinh' && className.trim()
      ? '_' +
        removeVietnameseTones(className.trim())
          .replace(/[^a-zA-Z0-9]/g, '-')
          .replace(/-+/g, '-')
      : '';

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

  return `${cleanUser || 'Nguoi_dung'}_${cleanRole}${cleanClass}_${stamp}.${ext}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp từ máy của bạn.'));
    reader.readAsDataURL(file);
  });
}

function formatDate(createdAt) {
  if (!createdAt) return '';
  const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
  return date.toLocaleDateString('vi-VN');
}

function getImageDisplayUrl(item) {
  if (item.drive_file_id) {
    return `https://lh3.googleusercontent.com/d/${item.drive_file_id}=w1600`;
  }
  return item.media_url;
}

function CreativeCorner() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'image' | 'video'
  const [selectedItem, setSelectedItem] = useState(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [className, setClassName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const gdriveUploadUrl = import.meta.env.VITE_GDRIVE_UPLOAD_URL;

  useEffect(() => {
    const q = query(collection(db, 'creative_items'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
        );
      },
      (err) => {
        console.error('Error loading creative_items:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole !== 'Học sinh') setClassName('');
  };

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    setErrorMsg('');
    setSuccessMsg('');

    if (!picked) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    const isImage = picked.type.startsWith('image/');
    const isVideo = picked.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMsg('Chỉ hỗ trợ tệp hình ảnh (JPG, PNG, WEBP...) hoặc video (MP4, WEBM, MOV).');
      return;
    }

    const maxBytes = (isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB) * 1024 * 1024;
    if (picked.size > maxBytes) {
      setErrorMsg(
        isImage
          ? `Ảnh vượt quá dung lượng tối đa ${MAX_IMAGE_MB} MB.`
          : `Video vượt quá dung lượng tối đa ${MAX_VIDEO_MB} MB.`
      );
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = name.trim();
    const trimmedClass = className.trim();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn.');
      return;
    }
    if (!role) {
      setErrorMsg('Vui lòng chọn vai trò (Giáo viên hoặc Học sinh).');
      return;
    }
    if (role === 'Học sinh' && !trimmedClass) {
      setErrorMsg('Vui lòng nhập Lớp của bạn.');
      return;
    }
    if (!trimmedTitle) {
      setErrorMsg('Vui lòng nhập Tiêu đề cho ảnh/video.');
      return;
    }
    if (!file) {
      setErrorMsg('Vui lòng chọn một tệp ảnh hoặc video để tải lên.');
      return;
    }
    if (!gdriveUploadUrl) {
      setErrorMsg(
        'Chưa cấu hình đường dẫn Google Drive Upload (VITE_GDRIVE_UPLOAD_URL). Vui lòng thiết lập Google Apps Script trước khi tải lên.'
      );
      return;
    }

    setIsUploading(true);

    try {
      const renamedFileName = buildRenamedFileName(file.name, trimmedName, role, trimmedClass);
      const base64Data = await fileToBase64(file);

      const response = await fetch(gdriveUploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          fileName: renamedFileName,
          mimeType: file.type,
          base64Data
        })
      });

      const data = await response.json();
      if (!data?.success || !data?.fileId || !data?.mediaUrl) {
        throw new Error(data?.error || 'Không thể tải tệp lên Google Drive.');
      }

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      await addDoc(collection(db, 'creative_items'), {
        name: trimmedName,
        role,
        class_name: role === 'Học sinh' ? trimmedClass : null,
        title: trimmedTitle,
        description: trimmedDesc || null,
        media_type: mediaType,
        media_url: data.mediaUrl,
        drive_file_id: data.fileId,
        file_name: data.fileName || renamedFileName,
        created_at: serverTimestamp()
      });

      setSuccessMsg(
        `Đã tải lên thành công tác phẩm "${trimmedTitle}" (tệp lưu trên Drive: ${
          data.fileName || renamedFileName
        }).`
      );
      setTitle('');
      setDescription('');
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg('Lỗi tải lên: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    filter === 'all' ? true : item.media_type === filter
  );

  return (
    <div className="app">
      <div className="global-graphics" aria-hidden="true">
        <div className="global-spotlight-top"></div>
        <div className="global-vignette"></div>
      </div>
      <Ambient3DBackground />

      <Navbar />

      <main className="creative-page">
        <div className="container">
          <motion.div
            className="creative-header text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="section-title">Góc Sáng Tạo</h1>
            <p className="creative-subtitle">
              Nơi trưng bày những bức ảnh, tranh vẽ và thước phim sáng tạo của thầy cô và học sinh Trường THCS Lê Anh Xuân về Bác Hồ kính yêu.
            </p>
          </motion.div>

          {/* FORM UPLOAD ẢNH / VIDEO - BỐ CỤC 2 CỘT CÂN ĐỐI */}
          <motion.section
            className="creative-upload-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="creative-card-heading">
              <div className="creative-heading-left">
                <Sparkles size={22} className="text-gold" />
                <div>
                  <h2>Gửi tác phẩm ảnh hoặc video</h2>
                </div>
              </div>
              <button
                type="button"
                className="creative-toggle-btn"
                onClick={() => setIsFormExpanded((prev) => !prev)}
              >
                {isFormExpanded ? 'Thu gọn biểu mẫu' : '+ Mở biểu mẫu gửi bài'}
              </button>
            </div>

            {isFormExpanded && (
              <form onSubmit={handleSubmit} className="creative-form">
                <div className="creative-split-grid">
                  {/* Cột trái: Thông tin người gửi & tác phẩm */}
                  <div className="creative-col-left">
                    <div className="form-group">
                      <label htmlFor="creative-name">
                        Họ và tên <span className="required">*</span>
                      </label>
                      <input
                        id="creative-name"
                        type="text"
                        placeholder="Nhập họ và tên đầy đủ..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={`role-and-class-row ${role === 'Học sinh' ? 'with-class' : ''}`}>
                      <div className="form-group">
                        <label>
                          Bạn là <span className="required">*</span>
                        </label>
                        <div className="role-selector">
                          <button
                            type="button"
                            className={`role-option-btn ${role === 'Giáo viên' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('Giáo viên')}
                          >
                            <UserCheck size={17} />
                            <span>Giáo viên</span>
                          </button>
                          <button
                            type="button"
                            className={`role-option-btn ${role === 'Học sinh' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('Học sinh')}
                          >
                            <GraduationCap size={17} />
                            <span>Học sinh</span>
                          </button>
                        </div>
                      </div>

                      {role === 'Học sinh' && (
                        <div className="form-group">
                          <label htmlFor="creative-class">
                            Lớp <span className="required">*</span>
                          </label>
                          <input
                            id="creative-class"
                            type="text"
                            placeholder="VD: 9/1"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="creative-title">
                        Tiêu đề tác phẩm <span className="required">*</span>
                      </label>
                      <input
                        id="creative-title"
                        type="text"
                        placeholder="VD: Tranh vẽ Bác Hồ với thiếu nhi..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="creative-desc">Mô tả ngắn (Tùy chọn)</label>
                      <textarea
                        id="creative-desc"
                        rows="3"
                        placeholder="Chia sẻ đôi dòng về ý nghĩa tác phẩm của bạn..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Cột phải: Khu vực chọn & xem trước Ảnh / Video */}
                  <div className="creative-col-right">
                    <label className="dropzone-outer-label">
                      Tệp Ảnh (tối đa {MAX_IMAGE_MB}MB) hoặc Video (tối đa {MAX_VIDEO_MB}MB){' '}
                      <span className="required">*</span>
                    </label>

                    <label htmlFor="creative-file" className="file-dropzone-panel">
                      {previewUrl && file ? (
                        <div className="dropzone-preview-inner">
                          {file.type.startsWith('image/') ? (
                            <img src={previewUrl} alt="Xem trước" className="preview-media" />
                          ) : (
                            <video src={previewUrl} controls className="preview-media" />
                          )}
                          <div className="dropzone-file-badge">
                            <span>{file.name}</span>
                            <small>Nhấn để đổi tệp khác</small>
                          </div>
                        </div>
                      ) : (
                        <div className="dropzone-placeholder">
                          <div className="dropzone-icon-circle">
                            <Upload size={26} />
                          </div>
                          <strong>Nhấn để chọn ảnh hoặc video</strong>
                          <span>Hỗ trợ JPG, PNG, WEBP, MP4, WEBM, MOV</span>
                        </div>
                      )}
                      <input
                        id="creative-file"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {file && (
                      <div className="renamed-preview-note">
                        Tên tệp lưu trên Drive:{' '}
                        <code>
                          {buildRenamedFileName(
                            file.name,
                            name || 'Nguoi_dung',
                            role || 'Hoc_sinh',
                            className
                          )}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <div className="creative-alert error">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="creative-alert success">
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-gold creative-submit-btn" disabled={isUploading}>
                  {isUploading ? 'Đang tải lên Google Drive...' : (
                    <>
                      <Upload size={17} /> Tải tác phẩm lên Góc sáng tạo
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.section>

          {/* KHU TRƯNG BÀY ẢNH & VIDEO */}
          <section className="creative-gallery-section">
            <div className="creative-filter-bar">
              <h2>Tác phẩm đã trưng bày ({filteredItems.length})</h2>
              <div className="creative-filters">
                <button
                  type="button"
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`filter-btn ${filter === 'image' ? 'active' : ''}`}
                  onClick={() => setFilter('image')}
                >
                  <ImageIcon size={15} /> Hình ảnh
                </button>
                <button
                  type="button"
                  className={`filter-btn ${filter === 'video' ? 'active' : ''}`}
                  onClick={() => setFilter('video')}
                >
                  <Video size={15} /> Video
                </button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="creative-empty glass">
                Chưa có tác phẩm nào được đăng tải. Hãy là người đầu tiên chia sẻ ảnh hoặc video của bạn!
              </div>
            ) : (
              <div className="creative-grid">
                {filteredItems.map((item) => (
                  <article key={item.id} className="creative-item-card glass">
                    <div className="creative-media-wrap">
                      {item.media_type === 'video' ? (
                        <iframe
                          src={item.media_url}
                          title={item.title}
                          className="creative-video-frame"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={getImageDisplayUrl(item)}
                          alt={item.title}
                          className="creative-image-thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (
                              item.drive_file_id &&
                              !e.currentTarget.dataset.fallbackTried
                            ) {
                              e.currentTarget.dataset.fallbackTried = '1';
                              e.currentTarget.src = `https://drive.google.com/thumbnail?id=${item.drive_file_id}&sz=w1200`;
                            }
                          }}
                          onClick={() => setSelectedItem(item)}
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="creative-item-body">
                      <div className="creative-item-meta">
                        <span className="creative-type-tag">
                          {item.media_type === 'video' ? 'Video' : 'Hình ảnh'}
                        </span>
                        <span className="creative-date">{formatDate(item.created_at)}</span>
                      </div>
                      <h3 className="creative-item-title">{item.title}</h3>
                      {item.description && (
                        <p className="creative-item-desc">{item.description}</p>
                      )}
                      <div className="creative-author">
                        <strong>{item.name}</strong>
                        <span>
                          {item.role}
                          {item.class_name ? ` • Lớp ${item.class_name}` : ''}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Lightbox xem ảnh phóng to */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="creative-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="creative-lightbox-box glass"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setSelectedItem(null)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
              <img
                src={getImageDisplayUrl(selectedItem)}
                alt={selectedItem.title}
                className="lightbox-img"
                referrerPolicy="no-referrer"
              />
              <div className="lightbox-caption">
                <h3>{selectedItem.title}</h3>
                {selectedItem.description && <p>{selectedItem.description}</p>}
                <span>
                  Tác giả: <strong>{selectedItem.name}</strong> ({selectedItem.role}
                  {selectedItem.class_name ? ` • Lớp ${selectedItem.class_name}` : ''})
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default CreativeCorner;

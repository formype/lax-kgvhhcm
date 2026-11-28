import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LogIn, LogOut, CheckCircle, Trash2, EyeOff } from 'lucide-react';
import './Admin.css';

function formatDateTime(createdAt) {
  if (!createdAt) return '';
  const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
  return date.toLocaleString('vi-VN');
}

function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [reflections, setReflections] = useState([]);
  const [creativeItems, setCreativeItems] = useState([]);
  const [activeSection, setActiveSection] = useState('reflections'); // 'reflections' | 'creative'
  const [activeStatus, setActiveStatus] = useState('pending'); // 'pending' | 'approved'

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setReflections([]);
      setCreativeItems([]);
      return undefined;
    }

    const q = query(collection(db, 'reflections'), orderBy('created_at', 'desc'));
    const unsubData = onSnapshot(
      q,
      (snapshot) => {
        setReflections(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
        );
      },
      (err) => {
        console.error('Error loading reflections:', err);
      }
    );

    const qCreative = query(collection(db, 'creative_items'), orderBy('created_at', 'desc'));
    const unsubCreative = onSnapshot(
      qCreative,
      (snapshot) => {
        setCreativeItems(
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

    return () => {
      unsubData();
      unsubCreative();
    };
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'reflections', id), {
        is_approved: !currentStatus
      });
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const deleteReflection = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) {
      try {
        await deleteDoc(doc(db, 'reflections', id));
      } catch (err) {
        alert('Lỗi xóa: ' + err.message);
      }
    }
  };

  const toggleCreativeApproval = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'creative_items', id), {
        is_approved: !currentStatus
      });
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const deleteCreativeItem = async (item) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác phẩm này khỏi Góc sáng tạo và Google Drive?')) {
      try {
        const gdriveUrl = import.meta.env.VITE_GDRIVE_UPLOAD_URL;
        if (gdriveUrl && item.drive_file_id) {
          const res = await fetch(gdriveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'delete',
              fileId: item.drive_file_id
            })
          });
          const data = await res.json();
          if (!data?.success) {
            const detail = data?.error || 'Không rõ lỗi từ Google Apps Script.';
            const hint = detail.includes('Thiếu dữ liệu tệp tải lên')
              ? '\n\n(Gợi ý: Bạn cần vào script.google.com, dán code mới nhất và chọn Triển khai -> Quản lý các bản triển khai -> Sửa -> Phiên bản mới).'
              : '';
            const forceDelete = window.confirm(
              `Không thể xóa tệp trên Google Drive (${detail}).${hint}\n\nBạn vẫn muốn xóa bài khỏi trang web chứ?`
            );
            if (!forceDelete) return;
          }
        }
        await deleteDoc(doc(db, 'creative_items', item.id));
      } catch (err) {
        alert('Lỗi xóa: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2><LogIn size={24} /> Đăng nhập Quản trị</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Admin</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && <div className="error-message">{authError}</div>}
            <button type="submit" className="login-btn">Đăng nhập</button>
          </form>
          <a href="/" className="back-link">← Về trang chủ</a>
        </div>
      </div>
    );
  }

  const pendingReflections = reflections.filter((r) => !r.is_approved);
  const approvedReflections = reflections.filter((r) => r.is_approved);
  const pendingCreative = creativeItems.filter((c) => !c.is_approved);
  const approvedCreative = creativeItems.filter((c) => c.is_approved);

  const displayReflections = activeStatus === 'pending' ? pendingReflections : approvedReflections;
  const displayCreative = activeStatus === 'pending' ? pendingCreative : approvedCreative;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <h2>Bảng Quản Trị Hệ Thống</h2>
        </div>
        <div className="admin-user">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="logout-btn"><LogOut size={16} /> Thoát</button>
          <a href="/" className="view-site-btn" target="_blank" rel="noreferrer">Xem website</a>
        </div>
      </header>

      <main className="admin-main">
        {/* Chọn phân hệ quản trị */}
        <div className="admin-section-switcher">
          <button
            className={`section-switch-btn ${activeSection === 'reflections' ? 'active' : ''}`}
            onClick={() => setActiveSection('reflections')}
          >
            Cảm nhận &amp; Lời hứa ({pendingReflections.length} chờ duyệt)
          </button>
          <button
            className={`section-switch-btn ${activeSection === 'creative' ? 'active' : ''}`}
            onClick={() => setActiveSection('creative')}
          >
            Góc sáng tạo ({pendingCreative.length} chờ duyệt)
          </button>
        </div>

        {/* Phân chia rõ ràng Chờ duyệt / Đã duyệt */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveStatus('pending')}
          >
            Chờ duyệt ({activeSection === 'reflections' ? pendingReflections.length : pendingCreative.length})
          </button>
          <button
            className={`tab-btn ${activeStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveStatus('approved')}
          >
            Đã duyệt ({activeSection === 'reflections' ? approvedReflections.length : approvedCreative.length})
          </button>
        </div>

        {activeSection === 'creative' ? (
          <div className="admin-list">
            {displayCreative.length === 0 ? (
              <div className="empty-state">
                {activeStatus === 'pending'
                  ? 'Không có tác phẩm nào đang chờ duyệt.'
                  : 'Chưa có tác phẩm nào được duyệt.'}
              </div>
            ) : (
              displayCreative.map((item) => (
                <div key={item.id} className="admin-card">
                  <div className="admin-card-header">
                    <div className="admin-card-info">
                      <strong>{item.title}</strong>
                      <span className="badge">{item.media_type === 'video' ? 'Video' : 'Ảnh'}</span>
                      <span className="badge">{item.name}{item.class_name ? ` - Lớp ${item.class_name}` : ` - ${item.role}`}</span>
                      <span className="date">{formatDateTime(item.created_at)}</span>
                    </div>
                    <div className="admin-card-actions">
                      {item.is_approved ? (
                        <button onClick={() => toggleCreativeApproval(item.id, item.is_approved)} className="action-btn warning" title="Ẩn tác phẩm này">
                          <EyeOff size={16} /> Ẩn
                        </button>
                      ) : (
                        <button onClick={() => toggleCreativeApproval(item.id, item.is_approved)} className="action-btn success" title="Duyệt cho phép hiển thị">
                          <CheckCircle size={16} /> Duyệt
                        </button>
                      )}
                      <button onClick={() => deleteCreativeItem(item)} className="action-btn danger" title="Xóa khỏi Góc sáng tạo và Google Drive">
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                  </div>
                  <div className="admin-card-body">
                    <div>
                      Tệp Drive: <code>{item.file_name}</code> —{' '}
                      <a
                        href={
                          item.drive_file_id
                            ? `https://drive.google.com/file/d/${item.drive_file_id}/view`
                            : item.media_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-gold-light)', textDecoration: 'underline' }}
                      >
                        Xem tệp
                      </a>
                    </div>
                    {item.description && <div style={{ marginTop: 6 }}>{item.description}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="admin-list">
            {displayReflections.length === 0 ? (
              <div className="empty-state">
                {activeStatus === 'pending'
                  ? 'Không có cảm nhận nào đang chờ duyệt.'
                  : 'Chưa có cảm nhận nào được duyệt.'}
              </div>
            ) : (
              displayReflections.map((item) => (
              <div key={item.id} className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-info">
                    <strong>{item.name}</strong>
                    {item.class_name && <span className="badge">Lớp {item.class_name}</span>}
                    <span className="date">{formatDateTime(item.created_at)}</span>
                  </div>
                  <div className="admin-card-actions">
                    {item.is_approved ? (
                      <button onClick={() => toggleApproval(item.id, item.is_approved)} className="action-btn warning" title="Ẩn bài này">
                        <EyeOff size={16} /> Ẩn
                      </button>
                    ) : (
                      <button onClick={() => toggleApproval(item.id, item.is_approved)} className="action-btn success" title="Duyệt cho phép hiển thị">
                        <CheckCircle size={16} /> Duyệt
                      </button>
                    )}
                    <button onClick={() => deleteReflection(item.id)} className="action-btn danger" title="Xóa vĩnh viễn">
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </div>
                <div className="admin-card-body">
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </main>
    </div>
  );
}

export default Admin;

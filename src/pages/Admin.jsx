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
  const [activeTab, setActiveTab] = useState('pending');

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

    return () => unsubData();
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
  const displayList = activeTab === 'pending' ? pendingReflections : approvedReflections;

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
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Chờ duyệt ({pendingReflections.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Đã duyệt ({approvedReflections.length})
          </button>
        </div>

        <div className="admin-list">
          {displayList.length === 0 ? (
            <div className="empty-state">Không có dữ liệu trong danh mục này.</div>
          ) : (
            displayList.map((item) => (
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
      </main>
    </div>
  );
}

export default Admin;

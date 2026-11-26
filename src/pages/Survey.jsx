import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  UserCheck,
  GraduationCap,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import Ambient3DBackground from '../components/Ambient3DBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../lib/firebase';
import { generateShuffledQuiz } from '../data/surveyQuestions';
import './Survey.css';

const LOCAL_STORAGE_KEY = 'lax_survey_top50_v1';
const TOP_LIMIT = 50;
const QUIZ_COUNT = 20;

function toMillis(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  return new Date(createdAt).getTime() || 0;
}

function sortLeaderboard(entries) {
  return [...entries]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((a.duration_seconds ?? 99999) !== (b.duration_seconds ?? 99999)) {
        return (a.duration_seconds ?? 99999) - (b.duration_seconds ?? 99999);
      }
      return toMillis(a.created_at) - toMillis(b.created_at);
    })
    .slice(0, TOP_LIMIT);
}

function qualifiesForTop50(leaderboard, score, durationSeconds) {
  if (leaderboard.length < TOP_LIMIT) return true;
  const last = leaderboard[leaderboard.length - 1];
  if (score > last.score) return true;
  if (score === last.score && durationSeconds < (last.duration_seconds ?? 99999)) {
    return true;
  }
  return false;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return sortLeaderboard(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

function Survey() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [storageMode, setStorageMode] = useState('firebase'); // 'firebase' | 'local'

  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // 'Giáo viên' | 'Học sinh'
  const [className, setClassName] = useState('');

  const [questions, setQuestions] = useState(() => generateShuffledQuiz(QUIZ_COUNT));
  const [answers, setAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  const resultRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'survey_results'),
      orderBy('score', 'desc'),
      orderBy('duration_seconds', 'asc'),
      orderBy('created_at', 'asc'),
      limit(TOP_LIMIT)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setStorageMode('firebase');
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setLeaderboard(sortLeaderboard(rows));
      },
      (err) => {
        console.warn('Firestore survey_results unavailable, falling back to localStorage:', err);
        setStorageMode('local');
        setLeaderboard(loadLocalLeaderboard());
      }
    );

    return () => unsubscribe();
  }, []);

  // Quiz timer while not submitted
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole !== 'Học sinh') {
      setClassName('');
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedClass = className.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn.');
      return;
    }
    if (!role) {
      setErrorMsg('Vui lòng chọn vai trò của bạn (Giáo viên hoặc Học sinh).');
      return;
    }
    if (role === 'Học sinh' && !trimmedClass) {
      setErrorMsg('Vui lòng nhập Lớp của bạn.');
      return;
    }

    const unansweredCount = questions.filter((q) => !answers[q.id]).length;
    if (unansweredCount > 0) {
      setErrorMsg(`Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Vui lòng hoàn thành đủ ${QUIZ_COUNT} câu.`);
      return;
    }

    setIsSubmitting(true);

    let correctCount = 0;
    const breakdown = questions.map((q) => {
      const chosenId = answers[q.id];
      const chosenOption = q.options.find((o) => o.id === chosenId);
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = Boolean(chosenOption?.isCorrect);
      if (isCorrect) correctCount += 1;
      return {
        id: q.id,
        question: q.question,
        chosenLabel: chosenOption?.displayLabel,
        chosenText: chosenOption?.text,
        correctLabel: correctOption?.displayLabel,
        correctText: correctOption?.text,
        isCorrect
      };
    });

    const duration = elapsedSeconds;
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEntry = {
      id: entryId,
      name: trimmedName,
      role,
      class_name: role === 'Học sinh' ? trimmedClass : null,
      score: correctCount,
      total_questions: QUIZ_COUNT,
      duration_seconds: duration,
      created_at: new Date().toISOString()
    };

    const currentBoard = storageMode === 'firebase' ? leaderboard : loadLocalLeaderboard();
    const enteredTop50 = qualifiesForTop50(currentBoard, correctCount, duration);

    let updatedBoard = currentBoard;
    if (enteredTop50) {
      if (storageMode === 'firebase') {
        try {
          const docRef = await addDoc(collection(db, 'survey_results'), {
            name: newEntry.name,
            role: newEntry.role,
            class_name: newEntry.class_name,
            score: newEntry.score,
            total_questions: newEntry.total_questions,
            duration_seconds: newEntry.duration_seconds,
            created_at: serverTimestamp()
          });
          newEntry.id = docRef.id;
          updatedBoard = sortLeaderboard([...currentBoard, newEntry]);
        } catch (err) {
          console.warn('Firestore write failed, saving locally:', err);
          setStorageMode('local');
          updatedBoard = sortLeaderboard([...loadLocalLeaderboard(), newEntry]);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBoard));
        }
      } else {
        updatedBoard = sortLeaderboard([...currentBoard, newEntry]);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBoard));
      }
      setLeaderboard(updatedBoard);
    }

    const rankIndex = updatedBoard.findIndex((item) => item.id === newEntry.id);

    setResult({
      score: correctCount,
      total: QUIZ_COUNT,
      duration,
      enteredTop50,
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      breakdown
    });
    setIsSubmitting(false);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRetake = () => {
    setQuestions(generateShuffledQuiz(QUIZ_COUNT));
    setAnswers({});
    setElapsedSeconds(0);
    setErrorMsg('');
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="app">
      <div className="global-graphics" aria-hidden="true">
        <div className="global-spotlight-top"></div>
        <div className="global-vignette"></div>
      </div>
      <Ambient3DBackground />

      <Navbar />

      <main className="survey-page">
        <div className="container">
          <motion.div
            className="survey-header text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="section-title">Khảo sát Tìm hiểu về Chủ tịch Hồ Chí Minh</h1>
            <p className="survey-subtitle">
              Hoàn thành 20 câu hỏi trắc nghiệm để kiểm tra kiến thức và ghi danh vào bảng vàng Top 50 của Trường THCS Lê Anh Xuân.
            </p>
          </motion.div>

          {/* 1. BẢNG THỐNG KÊ TOP 50 */}
          <motion.section
            className="leaderboard-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="leaderboard-header">
              <div className="leaderboard-title-wrap">
                <Trophy size={26} className="text-gold" />
                <div>
                  <h2>Bảng Xếp Hạng Top 50 Người Trả Lời Đúng Nhất</h2>
                  <p>Xếp hạng theo số câu đúng cao nhất và thời gian hoàn thành nhanh nhất</p>
                </div>
              </div>
              <span className="leaderboard-count-badge">
                {leaderboard.length} / {TOP_LIMIT} vị trí
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="leaderboard-empty">
                Chưa có kết quả nào được ghi nhận. Hãy là người đầu tiên ghi danh vào Top 50!
              </div>
            ) : (
              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Hạng</th>
                      <th>Họ và tên</th>
                      <th>Vai trò</th>
                      <th>Lớp</th>
                      <th>Số câu đúng</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => (
                      <tr key={entry.id || idx} className={idx < 3 ? `top-rank-${idx + 1}` : ''}>
                        <td className="rank-cell">
                          <span className="rank-pill">#{idx + 1}</span>
                        </td>
                        <td className="name-cell">{entry.name}</td>
                        <td>{entry.role}</td>
                        <td>{entry.class_name || '—'}</td>
                        <td className="score-cell">
                          {entry.score} / {entry.total_questions || QUIZ_COUNT}
                        </td>
                        <td className="time-cell">{formatDuration(entry.duration_seconds || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>

          {/* KẾT QUẢ SAU KHI NỘP */}
          {result && (
            <motion.section
              ref={resultRef}
              className="survey-result-card glass"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-summary">
                <CheckCircle2 size={54} className="result-icon" />
                <h2>Kết quả khảo sát của {name}</h2>
                <div className="result-score-big">
                  <span>{result.score}</span> / {result.total} câu đúng
                </div>
                <p className="result-meta">
                  Vai trò: <strong>{role}</strong>
                  {role === 'Học sinh' && className ? ` • Lớp: ${className}` : ''} • Thời gian làm bài:{' '}
                  <strong>{formatDuration(result.duration)}</strong>
                </p>
                {result.enteredTop50 ? (
                  <div className="result-top50-badge">
                    Chúc mừng! Thành tích của bạn đã được cập nhật vào Top 50
                    {result.rank ? ` (Hạng #${result.rank})` : ''}.
                  </div>
                ) : (
                  <div className="result-note">
                    Điểm của bạn chưa lọt vào Top 50 hiện tại. Hãy thử lại ở lượt đề mới nhé!
                  </div>
                )}

                <button type="button" className="btn btn-gold" onClick={handleRetake}>
                  <RotateCcw size={17} /> Làm lại với bộ đề trộn mới
                </button>
              </div>

              <div className="result-review-list">
                <h3>Chi tiết đáp án ({result.score}/{result.total} câu đúng)</h3>
                {result.breakdown.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`review-item ${item.isCorrect ? 'correct' : 'wrong'}`}
                  >
                    <div className="review-q-header">
                      <span className="review-q-num">Câu {idx + 1}</span>
                      {item.isCorrect ? (
                        <span className="review-status ok">
                          <CheckCircle2 size={16} /> Chính xác
                        </span>
                      ) : (
                        <span className="review-status err">
                          <XCircle size={16} /> Chưa đúng
                        </span>
                      )}
                    </div>
                    <p className="review-q-text">{item.question}</p>
                    <p className="review-answer-line">
                      Bạn chọn: <strong>{item.chosenLabel}. {item.chosenText}</strong>
                    </p>
                    {!item.isCorrect && (
                      <p className="review-correct-line">
                        Đáp án đúng: <strong>{item.correctLabel}. {item.correctText}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 2 & 3. FORM THÔNG TIN + 20 CÂU HỎI TRẮC NGHIỆM */}
          {!result && (
            <form onSubmit={handleSubmit} className="survey-workspace">
              <section className="survey-card glass">
                <h2 className="survey-section-heading">Thông tin người tham gia</h2>

                <div className="survey-info-grid">
                  <div className="form-group">
                    <label htmlFor="survey-name">
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      id="survey-name"
                      type="text"
                      placeholder="Nhập họ và tên đầy đủ..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

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
                        <UserCheck size={18} />
                        <span>Giáo viên</span>
                      </button>
                      <button
                        type="button"
                        className={`role-option-btn ${role === 'Học sinh' ? 'active' : ''}`}
                        onClick={() => handleRoleChange('Học sinh')}
                      >
                        <GraduationCap size={18} />
                        <span>Học sinh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {role === 'Học sinh' && (
                  <motion.div
                    className="form-group class-input-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                  >
                    <label htmlFor="survey-class">
                      Lớp <span className="required">*</span>
                    </label>
                    <input
                      id="survey-class"
                      type="text"
                      placeholder="VD: 9/1, 8/3..."
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </section>

              <section className="survey-card glass">
                <div className="quiz-header-bar">
                  <div>
                    <h2 className="survey-section-heading" style={{ marginBottom: 4 }}>
                      Phần câu hỏi trắc nghiệm ({QUIZ_COUNT} câu)
                    </h2>
                    <p className="quiz-hint">
                      Thứ tự câu hỏi và các đáp án đã được hệ thống xáo trộn ngẫu nhiên.
                    </p>
                  </div>
                  <div className="quiz-progress-meta">
                    <span className="quiz-pill">
                      Đã chọn: <strong>{answeredCount}/{QUIZ_COUNT}</strong>
                    </span>
                    <span className="quiz-pill">
                      <Clock size={14} /> {formatDuration(elapsedSeconds)}
                    </span>
                  </div>
                </div>

                <div className="quiz-questions-list">
                  {questions.map((q, qIdx) => (
                    <div key={q.id} className="quiz-question-block">
                      <h3 className="quiz-question-title">
                        <span className="q-index">Câu {qIdx + 1}.</span> {q.question}
                      </h3>
                      <div className="quiz-options-grid">
                        {q.options.map((opt) => {
                          const isSelected = answers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectOption(q.id, opt.id)}
                            >
                              <span className="option-letter">{opt.displayLabel}</span>
                              <span className="option-text">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {errorMsg && (
                  <div className="survey-error-banner">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gold survey-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang chấm điểm...' : (
                    <>
                      Nộp khảo sát & Chấm điểm <Send size={17} />
                    </>
                  )}
                </button>
              </section>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Survey;

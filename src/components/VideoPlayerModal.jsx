import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  X
} from 'lucide-react';

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

const VideoPlayerModal = ({ item, onClose }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const directVideoUrl = item.drive_file_id
    ? `https://drive.google.com/uc?export=download&id=${item.drive_file_id}`
    : item.media_url;

  const previewIframeUrl = item.drive_file_id
    ? `https://drive.google.com/file/d/${item.drive_file_id}/preview`
    : item.media_url;

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const skip = (delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Number(e.target.value);
    v.currentTime = next;
    setCurrentTime(next);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !isMuted;
    v.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const nextVol = Number(e.target.value);
    v.volume = nextVol;
    v.muted = nextVol === 0;
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
  };

  const cycleSpeed = () => {
    const v = videoRef.current;
    const nextIdx = (SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIdx];
    setSpeed(nextSpeed);
    if (v) v.playbackRate = nextSpeed;
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen failed:', err);
    }
  };

  return (
    <motion.div
      className="creative-lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={containerRef}
        className={`creative-video-modal glass ${isFullscreen ? 'is-fullscreen' : ''}`}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="video-modal-topbar">
          <div className="video-modal-title-group">
            <h3>{item.title}</h3>
            <span>
              {item.name} ({item.role}
              {item.class_name ? ` • Lớp ${item.class_name}` : ''})
            </span>
          </div>
          <div className="video-modal-top-actions">
            <button
              type="button"
              className="video-top-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ' : 'Phóng to toàn màn hình'}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button
              type="button"
              className="video-top-btn"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="video-stage">
          {useIframeFallback ? (
            <iframe
              src={previewIframeUrl}
              title={item.title}
              className="video-stage-iframe"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={directVideoUrl}
                className="video-stage-element"
                playsInline
                autoPlay
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onError={() => setUseIframeFallback(true)}
              />

              {!isPlaying && (
                <button
                  type="button"
                  className="video-center-play-btn"
                  onClick={togglePlay}
                  aria-label="Phát video"
                >
                  <Play size={34} fill="currentColor" />
                </button>
              )}

              {/* YouTube-style Controls Bar */}
              <div className="yt-controls-bar">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="yt-seek-bar"
                  aria-label="Tua video"
                />

                <div className="yt-controls-row">
                  <div className="yt-controls-left">
                    <button type="button" className="yt-btn" onClick={togglePlay} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                      {isPlaying ? <Pause size={19} /> : <Play size={19} fill="currentColor" />}
                    </button>
                    <button type="button" className="yt-btn" onClick={() => skip(-10)} title="Lùi 10 giây">
                      <RotateCcw size={17} />
                    </button>
                    <button type="button" className="yt-btn" onClick={() => skip(10)} title="Tới 10 giây">
                      <RotateCw size={17} />
                    </button>

                    <div className="yt-volume-group">
                      <button type="button" className="yt-btn" onClick={toggleMute} title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}>
                        {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="yt-volume-slider"
                        aria-label="Âm lượng"
                      />
                    </div>

                    <span className="yt-time-text">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="yt-controls-right">
                    <button type="button" className="yt-speed-btn" onClick={cycleSpeed} title="Tốc độ phát">
                      {speed}x
                    </button>
                    <button
                      type="button"
                      className="yt-btn"
                      onClick={toggleFullscreen}
                      title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                    >
                      {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {item.description && (
          <div className="video-modal-desc">{item.description}</div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayerModal;

import React, { useRef, useState } from 'react';

const formatTime = (sec) => {
  if (!sec && sec !== 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};


const FooterPlayer = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  rightContent,
}) => {

  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(1); // 1 = 100%
  const volumeTimeout = useRef(null);

  if (!track) return null;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Hide volume bar after a short delay
  const handleShowVolume = () => {
    setShowVolume(true);
    if (volumeTimeout.current) clearTimeout(volumeTimeout.current);
    volumeTimeout.current = setTimeout(() => setShowVolume(false), 2500);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setShowVolume(true);
    if (volumeTimeout.current) clearTimeout(volumeTimeout.current);
    volumeTimeout.current = setTimeout(() => setShowVolume(false), 2500);
    // Set the global audio element's volume if present
    const audio = document.querySelector('audio');
    if (audio) audio.volume = newVolume;
  };

  return (
  <div className="player player-footer" style={{marginBottom:0, boxShadow:'none', borderRadius:0, width:'100vw', left:0, right:0, bottom:0, position:'relative', paddingBottom:0}}>
      <img src={track.album_cover_path} alt="cover" />
      <div className="player-info">
        <h4>
          {track.prompt
            ? (track.prompt.charAt(0).toUpperCase() + (track.prompt.length > 40
                ? track.prompt.slice(1, 40) + '...'
                : track.prompt.slice(1)))
            : ''} &nbsp;&nbsp; {formatTime(currentTime)} / {formatTime(duration)}
        </h4>
        <div
          className="progress"
          style={{ position: 'relative', height: 8, background: '#23263a', borderRadius: 3, userSelect: 'none', cursor: 'pointer' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            onSeek(newTime);
          }}
          onWheel={e => {
            e.preventDefault();
            let delta = e.deltaY < 0 ? 5 : -5; // 5 seconds forward/back
            let newTime = Math.min(Math.max(currentTime + delta, 0), duration);
            onSeek(newTime);
          }}
        >
          <span
            style={{
              display: 'block',
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'var(--blue)',
              borderRadius: 3,
              transition: 'width 0.2s',
              cursor: 'pointer',
            }}
          />
          {/* Drag handle for seeking */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${progress}% - 8px)`,
              top: '-4px',
              width: 16,
              height: 16,
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'left 0.2s',
            }}
            draggable={false}
            onMouseDown={e => {
              e.preventDefault();
              const bar = e.currentTarget.parentNode;
              const onMove = moveEvent => {
                let clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const rect = bar.getBoundingClientRect();
                let x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                let newTime = (x / rect.width) * duration;
                onSeek(newTime);
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('mouseup', onUp);
                window.removeEventListener('touchend', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('touchmove', onMove);
              window.addEventListener('mouseup', onUp);
              window.addEventListener('touchend', onUp);
            }}
            onTouchStart={e => {
              e.preventDefault();
              const bar = e.currentTarget.parentNode;
              const onMove = moveEvent => {
                let clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const rect = bar.getBoundingClientRect();
                let x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
                let newTime = (x / rect.width) * duration;
                onSeek(newTime);
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('mouseup', onUp);
                window.removeEventListener('touchend', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('touchmove', onMove);
              window.addEventListener('mouseup', onUp);
              window.addEventListener('touchend', onUp);
            }}
          />
        </div>
      </div>
      <div className="icons" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-link"
          style={{ fontSize: 22, color: '#a78bfa', border: 'none', background: 'none' }}
          onClick={onPlayPause}
        >
          <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
        </button>
        {/* <a href="#"><i className="bi bi-chat-dots-fill"></i></a>
        <a href="#"><i className="bi bi-hand-thumbs-up"></i></a>
        <a href="#"><i className="bi bi-hand-thumbs-down"></i></a> */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            className="btn btn-link"
            style={{ fontSize: 22, color: '#a78bfa', border: 'none', background: 'none', padding: 0, margin: 0 }}
            onClick={e => {
              e.preventDefault();
              handleShowVolume();
            }}
            tabIndex={0}
          >
            <i className="bi bi-volume-up-fill"></i>
          </button>
          {showVolume && (
            <div
              style={{
                position: 'absolute',
                bottom: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#23263a',
                borderRadius: 8,
                padding: '10px 8px',
                boxShadow: '0 2px 8px #0005',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 80,
                minWidth: 36,
              }}
              onClick={e => e.stopPropagation()}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  writingMode: 'bt-lr',
                  WebkitAppearance: 'slider-vertical',
                  width: 28,
                  height: 80,
                  margin: 0,
                  accentColor: '#a78bfa',
                  cursor: 'pointer',
                }}
              />
              <span style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
        {/* <div className="dropdown iconoption-div">
          <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="bi bi-three-dots-vertical"></i>
          </a>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#">Action 1</a></li>
            <li><a className="dropdown-item" href="#">Action 2</a></li>
            <li><a className="dropdown-item" href="#">Action 3</a></li>
          </ul>
        </div> */}
        {rightContent && (
          <div style={{marginLeft:'auto'}}>{rightContent}</div>
        )}
      </div>
    </div>
  );
};

export default FooterPlayer;
